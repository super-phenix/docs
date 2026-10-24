# Enabling block pool replication

Block pool replication copies RBD images from one storage cluster to another. The peer keeps the latest mirrored snapshot, so a failover can start from that export.

Use it together with [backups](configuring-backups.md). A backup rebuilds a project, including its metadata, from the copy stored in S3. Restoring that copy is slower than attaching the latest replicated export, so replication is what keeps the recovery time objective (RTO) low.

Replication is asynchronous. Keep the backup as well: the peer holds the latest mirrored snapshot, and it can be a few snapshots behind the source.

!!! info "Where to apply this"

    Apply the pool and the mirror daemon on the cluster that hosts the storage, on **both** sides of the replication:

    - **Hyperconverged** — the AZ
    - **Decoupled** — the storage cluster

    The pool is configured through the `rook-local-cluster` application, in the same place as [adding a storage pool](adding-a-storage-pool.md).

## Requirements

- The pool name is identical on both clusters. For an erasure-coded pool, that includes both Ceph pools, `[pool-name]` and `[pool-name]-metadata`.
- The data protection and the device class can differ. One side can be a 3-replica NVMe pool while the other is an erasure-coded pool on HDD.
- Mirroring is enabled on the pool on both clusters, and each cluster holds a secret that contains the other cluster's bootstrap token.
- Each storage cluster runs one RBD mirror daemon.

## Enable mirroring

Add `mirroring` to the pool spec on both clusters. The example below is the replicated pool from [adding a storage pool](adding-a-storage-pool.md); only the `mirroring` section is new.

```yaml
systemConfiguration:
  apps:
    rook-local-cluster:
      values:
        cephBlockPools:
          - name: "[pool-name]"
            spec:
              failureDomain: host
              replicated:
                size: 3
              deviceClass: "nvme"
              mirroring:
                enabled: true
                mode: image
```

On an erasure-coded pool, add the same `mirroring` block only under the `metadataPool`. The `dataPool` will automatically get replicated if its `metadataPool` is replicated.

Once mirroring is enabled, Rook stores a bootstrap token in a Secret in the `spx-storage` namespace. Its name is reported on the pool:

```bash
kubectl -n spx-storage get cephblockpool [pool-name] \
  -o jsonpath='{.status.info.rbdMirrorBootstrapPeerSecretName}{"\n"}'
```

The Secret is usually named `pool-peer-token-[pool-name]`. Read the token:

```bash
kubectl -n spx-storage get secret pool-peer-token-[pool-name] \
  -o jsonpath='{.data.token}' | base64 --decode; echo
```

## Share the token

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
    secretNames:
      - "[peer-secret]"
```

Repeat in the other direction, so each pool lists the Secret that contains the remote token. For an erasure-coded pool, import a token and set `peers.secretNames` on both `[pool-name]` and `[pool-name]-metadata`.

## Run the mirror daemon

Apply this manifest on both storage clusters. One daemon is enough for the pools on that cluster.

```yaml
apiVersion: ceph.rook.io/v1
kind: CephRBDMirror
metadata:
  name: rbd-mirror
  namespace: spx-storage
spec:
  count: 1
```

Check that the daemon is running:

```bash
kubectl -n spx-storage get pods -l app=rook-ceph-rbd-mirror
```

## Fields

| Field | Description |
|---|---|
| `mirroring.enabled` | Turns on RBD mirroring for the pool. Set it on both clusters. |
| `mirroring.mode` | `image` mirrors each RBD image, including its snapshots. |
| `mirroring.peers.secretNames` | Secrets in `spx-storage` that contain a remote cluster's bootstrap token. |
| `CephRBDMirror.spec.count` | Number of mirror daemons. `1` serves every mirrored pool on the cluster. |

For the full pool spec, see the [CephBlockPool reference](https://rook.io/docs/rook/latest/CRDs/Block-Storage/ceph-block-pool-crd/#mirroring).
