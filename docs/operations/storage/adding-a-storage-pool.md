# Adding a storage pool

A **storage pool** is the Ceph layer that holds the data. It chooses which disks to use and how data is protected. [Storage classes](adding-a-storage-class.md) then expose that pool to users with different QoS or encryption settings.

## Prerequisites

The cluster must actually have the media and topology your pool expects:

- An **NVMe** pool needs NVMe disks in the cluster (same idea for SSD or HDD).
- **3× replication across hosts** needs at least three servers that hold those disks.
- **Erasure coding** (for example `4+2`) typically needs at least six servers.

If the device class or failure domain does not match what is installed, the pool cannot place data safely.

## Protection models

Ceph pools use one of two data-protection models:

- **[Replicated](https://docs.ceph.com/en/latest/rados/operations/pools/)**: copies of each object across failure domains. Simpler and a good fit for smaller clusters; more raw capacity for the same usable space (size `3` means 1 TB of data uses about 3 TB raw).
- **[Erasure coding](https://docs.ceph.com/en/latest/rados/operations/erasure-code/)**: data and parity chunks across failure domains. Better storage efficiency at scale; needs more hosts and has different performance trade-offs.

Prefer replication when you have few hosts or disks. Prefer erasure coding when you store large volumes of data and can spare at least six nodes.

## Configuration

Add the pool under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart). Choose the example that matches your protection model.

!!! info "Where to apply this configuration"
    Configure the pool on the cluster that **hosts the storage**:

    - **Hyperconverged**: the same cluster that will consume the storage.
    - **Decoupled**: the **storage** cluster (not the workload cluster).

=== "Replicated"

    Prefer this when you have fewer hosts or disks. Size `3` with `failureDomain: host` needs at least three servers with disks of the chosen device class.

    ```yaml
    systemConfiguration:
      apps:
        rook-local-cluster:
          values:
            cephBlockPools:
              - name: "[pool-name]"
                spec:
                  # Media for this pool. Valid values: hdd, ssd, nvme.
                  # Device class is detected automatically on physical disks and must
                  # match your failure domain. With failureDomain "host" and size 3,
                  # you need three servers that each have disks of this class.
                  deviceClass: hdd
                  # Where replicas are placed. "host" spreads data across servers so
                  # you can lose a machine. "osd" spreads across disks and may place
                  # all copies on one server. Losing that server can mean permanent
                  # data loss. With size 3 and failureDomain "host", you can lose
                  # two hosts and still recover.
                  failureDomain: "host"
                  # Number of replicas across failure domains. With "host", size 3
                  # means three different servers. Higher size uses more raw capacity
                  # (1 TB usable ≈ 3 TB raw at size 3).
                  replicated:
                    size: 3
                  # Per-disk RBD metrics in Prometheus. Recommended.
                  enableRBDStats: true
    ```

=== "Erasure coded"

    Prefer this for large capacity once you have enough failure domains. We recommend **`4+2` as a minimum** (`dataChunks: 4`, `codingChunks: 2`): you need at least six servers when `failureDomain` is `host`, and you can lose two of them without data loss.

    ??? tips "How erasure coding works"
        Each object is split into **data chunks** (`k`) and **coding (parity) chunks** (`m`). Any `k` of the `k + m` chunks can reconstruct the object, so you can lose up to `m` failure domains.

        Storage overhead is: `(dataChunks + codingChunks) / dataChunks`

        Examples:

        | Profile | Fields | Failure domains needed | Can lose | Raw for 1 TB usable |
        | ---- | --- | --- | --- | --- |
        | **4+2** (recommended minimum) | `dataChunks: 4`, `codingChunks: 2` | 6 | 2 | 1.5 TB (50% overhead) |
        | 8+3 | `dataChunks: 8`, `codingChunks: 3` | 11 | 3 | 1.375 TB (~38% overhead) |
        | 2+1 (lab only) | `dataChunks: 2`, `codingChunks: 1` | 3 | 1 | 1.5 TB (50% overhead) |

        For comparison, 3× replication uses about **3 TB raw per 1 TB usable**. Avoid profiles smaller than 4+2 in production: fewer coding chunks means less durability, and small `k` values leave little room to grow efficiency.

    For block storage, Rook requires a **replicated metadata pool** plus an **erasure-coded data pool**. Configure that with `cephECBlockPools`:

    ```yaml
    systemConfiguration:
      apps:
        rook-local-cluster:
          values:
            cephECBlockPools:
              - name: "[pool-name]"
                spec:
                  # Replicated pool used for RBD image metadata.
                  metadataPool:
                    failureDomain: "host"
                    replicated:
                      size: 3
                  # Erasure-coded pool that holds the image data.
                  dataPool:
                    # Media for this pool. Valid values: hdd, ssd, nvme.
                    deviceClass: hdd
                    # Where EC chunks are placed. "host" spreads chunks across
                    # servers so you can lose a machine. "osd" spreads across
                    # disks and may place several chunks on one server. Losing
                    # that server can exceed codingChunks and mean permanent
                    # data loss. Prefer "host". You need dataChunks +
                    # codingChunks failure domains (6 hosts for 4+2).
                    failureDomain: "host"
                    # k data chunks + m coding chunks. Overhead =
                    # (k + m) / k. Recommend at least 4+2 in production.
                    erasureCoded:
                      dataChunks: 4
                      codingChunks: 2
    ```

For advanced pool options, see the [rook-ceph-cluster](https://artifacthub.io/packages/helm/rook/rook-ceph-cluster) Helm chart values.

## Replication

Replication copies the pool's content to a pool on another storage cluster. The peer keeps the latest mirrored snapshot, so a failover can start from that export.

Replication has to be setup between pools, but is then enabled per project or per disk within a project. You don't have to synchronize the entire content of the pool.

Use it together with [backups](configuring-backups.md). A backup rebuilds a project, including its metadata, from the copy stored in S3. Restoring that copy is slower than attaching the latest replicated export, so replication is what keeps the recovery time objective (RTO) low.

Replication is asynchronous. Keep the backup as well: the peer holds the latest mirrored snapshot, and the backup the metadata and an history of the data over multiple days (depending on your retention).

Configure replication on **both** clusters that host the storage, in the same `rook-local-cluster` values as the pool:

- The pool name is identical on both clusters. For an erasure-coded pool, that includes both Ceph pools, `[pool-name]` and `[pool-name]-metadata`.
- The data protection and the device class can differ. One side can be a 3-replica NVMe pool while the other is an erasure-coded pool on HDD (to save on storage on the recovery cluster).
- Mirroring is enabled on the pool on both clusters, and each cluster holds a secret that contains the other cluster's bootstrap token.
- Each storage cluster runs at least one RBD mirror daemon.

### Enable mirroring

Add `mirroring` under the pool `spec` on both clusters. On an erasure-coded pool, add it only on the `metadataPool` and the`dataPool` will get automatically replicated.

```yaml
mirroring:
  enabled: true
  # Mirror each RBD image, including its snapshots.
  mode: image
```

Rook then stores a bootstrap token in a Secret in the `spx-storage` namespace. Its name is reported on the pool:

```bash
kubectl -n spx-storage get cephblockpool [pool-name] \
  -o jsonpath='{.status.info.rbdMirrorBootstrapPeerSecretName}{"\n"}'
```

The Secret is usually named `pool-peer-token-[pool-name]`. Read the token:

```bash
kubectl -n spx-storage get secret pool-peer-token-[pool-name] \
  -o jsonpath='{.data.token}' | base64 --decode; echo
```

### Share the token

On **each** cluster, create a Secret that holds the **other** cluster's token. `[pool-name]` is the pool name on this cluster, which is the same name as on the peer.

```bash
kubectl -n spx-storage create secret generic [peer-secret] \
  --from-literal=token='[token]' \
  --from-literal=pool='[pool-name]'
```

Point the pool at that Secret:

```yaml
mirroring:
  enabled: true
  mode: image
  peers:
    # Secret in spx-storage that holds the other cluster's bootstrap token.
    secretNames:
      - "[peer-secret]"
```

Repeat in the other direction, so each pool lists the Secret that contains the remote token. For an erasure-coded pool, import a token and set `peers.secretNames` on both `[pool-name]` and `[pool-name]-metadata`.

### Run the mirror daemon

Apply this manifest on both storage clusters. One daemon is enough for the pools on that cluster. The Rook chart has no value for it, so apply the manifest directly.

```yaml
apiVersion: ceph.rook.io/v1
kind: CephRBDMirror
metadata:
  name: rbd-mirror
  namespace: spx-storage
spec:
  # At least one daemon serves every mirrored pool on the cluster.
  count: 1
```

Check that the daemon is running:

```bash
kubectl -n spx-storage get pods -l app=rook-ceph-rbd-mirror
```

See the [CephBlockPool mirroring reference](https://rook.io/docs/rook/latest/CRDs/Block-Storage/ceph-block-pool-crd/#mirroring) for the full spec.

Expose the pool to tenants with a [block storage class](adding-a-storage-class.md#adding-a-block-storage-class). On a decoupled AZ, [connect the workload cluster](connecting-a-workload-and-storage-cluster.md#consuming-block-storage) first.
