# Add storage classes to a cluster

**Storage classes** are how end users choose what type of storage they get on the platform. When someone creates a disk or bucket, they pick a class that defines what they get: media type (HDD, SSD, NVMe), QoS (IOPS, bandwidth), data protection (replication, erasure coding), and options such as encryption.

On each cluster, you define storage classes and expose them to users. The steps depend on your AZ layout:

- **Hyperconverged**: storage runs on the same cluster as workloads.
- **Decoupled**: the workload cluster connects to storage provided by a dedicated storage cluster.

In both cases, every storage class is backed by a **storage pool**. The pool defines the physical media and data protection; one pool can serve several classes with different QoS or encryption settings. For example, an NVMe pool with 3-way replication could back two classes. One could be capped at 100 MB/s and another be configured with encryption, while the data lands on the same underlying pool.

The sections below cover creating **storage pools**, then exposing them through **storage classes**.

## Adding a storage pool

A **storage pool** is the Ceph layer that holds the data. It chooses which disks to use and how data is protected. Storage classes then expose that pool to users with different QoS or encryption settings.

### Prerequisites

The cluster must actually have the media and topology your pool expects:

- An **NVMe** pool needs NVMe disks in the cluster (same idea for SSD or HDD).
- **3× replication across hosts** needs at least three servers that hold those disks.
- **Erasure coding** (for example `4+2`) typically needs at least six servers.

If the device class or failure domain does not match what is installed, the pool cannot place data safely.

### Protection models

Ceph pools use one of two data-protection models:

- **[Replicated](https://docs.ceph.com/en/latest/rados/operations/pools/)**: copies of each object across failure domains. Simpler and a good fit for smaller clusters; more raw capacity for the same usable space (size `3` means 1 TB of data uses about 3 TB raw).
- **[Erasure coding](https://docs.ceph.com/en/latest/rados/operations/erasure-code/)**: data and parity chunks across failure domains. Better storage efficiency at scale; needs more hosts and has different performance trade-offs.

Prefer replication when you have few hosts or disks. Prefer erasure coding when you store large volumes of data and can spare at least six nodes.

### Configuration

Add the pool under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart). Choose the example that matches your protection model.

!!! info "Where to apply this configuration"
    Configure the pool on the cluster that **hosts the storage**:

    - **Hyperconverged**: the same cluster that will consume the storage.
    - **Decoupled**: the **storage** cluster (not the workload cluster).

=== "Replicated"

    Prefer this when you have fewer hosts or disks. Size `3` with `failureDomain: host` needs at least three servers with disks of the chosen device class.

    ```yaml
    systemConfiguration:
      rook-local-cluster:
        helm:
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
                  # all copies on one server—losing that server can mean permanent
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
      rook-local-cluster:
        helm:
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

## Adding a storage class

A **storage class** is the user-facing catalog entry for storage. It points at a pool and adds policies such as QoS and encryption so tenants can pick the right offering when they create disks or buckets.

### Prerequisites

- At least one **storage pool** already exists on the cluster that hosts the storage. See [Adding a new storage pool](#adding-a-new-storage-pool).

### Configuration

Add the storage class under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart), using the **`rook-connection`** chart. Choose the example that matches your AZ layout.

!!! info "Where to apply this configuration"
    Configure the storage class on the cluster that **consumes** the storage:

    - **Hyperconverged**: the same cluster that hosts the pool.
    - **Decoupled**: the **workload** cluster. Remote connection fields point at the storage cluster.

=== "Hyperconverged"

    On a hyperconverged cluster, storage and workloads share the same Kubernetes cluster. You only need to reference the local pool and define storage classes—no remote Ceph connection fields.

    ```yaml
    systemConfiguration:
      rook-connection:
        helm:
          values:
            clusters:
              - name: "[cluster-name]" # Can be the name of your hyperconverged cluster
                pools:
                  # Name must match an existing storage pool. If you're creating a storage class for an erasure
                  # coded pool, you need to specify the name of the metadata pool here. If you followed the previous
                  # steps to add an EC pool, the name of the metadata pool will be [pool name]-metadata.
                  - name: "[pool-name]"
                    storageClasses:
                      - name: "[storage-class-name]"
                        # StorageClass name will be "<cluster>.<name>" unless fullName is set.
                        # Name must be unique across every storage class in the cluster.
                        # fullName: ""
                        # Data pool for erasure-coded storage classes (leave empty for replicated).
                        # If you followed the previous steps to add an EC pool, the name of the data pool will be
                        # the name of your pool.
                        dataPool: ""
                        # If set to true, this storage class will be used as the default when none is specified.
                        # Only one can be set per cluster. We recommend setting the pool with the less costly media (e.g. HDD).
                        default: true
                        # Enables encryption of the individual disks created from this storage class.
                        # The data will be stored within the pool encrypted.
                        encryption:
                          # Set to true to enable encryption, and provide a random passphrase.
                          enabled: false
                          # Encryption passphrase, can be a random string of characters.
                          passphrase: ""
    ```

=== "Decoupled"

    On a decoupled AZ, create the storage class on the **workload** cluster and connect it to a pool on the **storage** cluster. That requires Ceph connection details (`clusterID`, credentials, bootstrap MON, and health check) plus the pool and storage class definitions.

    ```yaml
    systemConfiguration:
      rook-connection:
        helm:
          values:
            clusters:
              - name: "[storage-cluster-name]" # The name of the remote storage cluster
                # Ceph cluster ID (FSID), e.g. e2a62ea1-6428-496e-a5bf-366936a8c833
                clusterID: ""
                username: "[csi-user]"
                token: ""
                # Initial MON used to retrieve the full MON list
                bootstrapMon:
                  # MON ID (must be a single letter)
                  id: ""
                  # IP of the MON
                  ip: ""
                  # Port of the MON
                  port: "6789"
                  # Protocol of the IP (IPv4 or IPv6)
                  protocol: IPv6
                # Used by Rook to check remote cluster health and refresh the MON list
                healthCheck:
                  username: "client.csi-health"
                  token: ""
                pools:
                  # Name must match an existing storage pool. If you're creating a storage class for an erasure
                  # coded pool, you need to specify the name of the metadata pool here. If you followed the previous
                  # steps to add an EC pool, the name of the metadata pool will be [pool name]-metadata.
                  - name: "[pool-name]" # Must match an existing pool on the storage cluster
                    storageClasses:
                      - name: "[storage-class-name]"
                        # StorageClass name will be "<cluster>.<name>" unless fullName is set.
                        # Name must be unique across every storage class in the cluster.
                        # fullName: ""
                        # Data pool for erasure-coded storage classes (leave empty for replicated).
                        # If you followed the previous steps to add an EC pool, the name of the data pool will be
                        # the name of your pool.
                        dataPool: ""
                        # If set to true, this storage class will be used as the default when none is specified.
                        # Only one can be set per cluster. We recommend setting the pool with the less costly media (e.g. HDD).
                        default: true
                        # Enables encryption of the individual disks created from this storage class.
                        # The data will be stored within the pool encrypted.
                        encryption:
                          # Set to true to enable encryption, and provide a random passphrase.
                          enabled: false
                          # Encryption passphrase, can be a random string of characters.
                          passphrase: ""
    ```
