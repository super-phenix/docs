# Adding a storage class

**Storage classes** are how end users choose what type of storage they get on the platform. When someone creates a disk or bucket, they pick a class that defines what they get: media type (HDD, SSD, NVMe), QoS (IOPS, bandwidth), data protection (replication, erasure coding), and options such as encryption.

On each cluster, you define storage classes and expose them to users. The steps depend on your AZ layout:

- **Hyperconverged**: storage runs on the same cluster as workloads.
- **Decoupled**: the workload cluster connects to storage provided by a dedicated storage cluster.

In both cases, every storage class is backed by a **storage pool**. The pool defines the physical media and data protection; one pool can serve several classes with different QoS or encryption settings. For example, an NVMe pool with 3-way replication could back two classes. One could be capped at 100 MB/s and another be configured with encryption, while the data lands on the same underlying pool.

You'll need a [storage pool](adding-a-storage-pool.md) to proceed. The sections below expose those pools through **storage classes**, whether for block storage, filesystem or object storage purposes.

## Adding a block storage class

This section covers adding a **storage class for block storage**. They're used by end users pick when they create disks and other block volumes (such as PVCs in Kubernetes clusters deployed within Superphenix).

A **block storage class** is the user-facing catalog entry for block storage. It points at a pool and adds policies such as QoS and encryption so tenants can pick the right offering when they create disks.

### Prerequisites

- At least one **storage pool** already exists on the cluster that hosts the storage. See [Adding a storage pool](adding-a-storage-pool.md).

### Configuration

Add the block storage class under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart), using the **`rook-connection`** chart. Choose the example that matches your AZ layout.

!!! info "Where to apply this configuration"
    Configure the storage class on the cluster that **consumes** the storage:

    - **Hyperconverged**: the same cluster that hosts the pool.
    - **Decoupled**: the **workload** cluster. Remote connection fields point at the storage cluster.

=== "Hyperconverged"

    On a hyperconverged cluster, storage and workloads share the same Superphenix cluster. You only need to reference the local pool and define storage classes. No remote Ceph connection fields are necessary.

    ```yaml
    systemConfiguration:
      apps:
        rook-connection:
          values:
            clusters:
              - name: "spx-storage"
                blockPools:
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

    !!! info
        Values used to connect to a remote cluster are detailed in [Connecting a workload and storage cluster](connecting-a-workload-and-storage-cluster.md#consuming-block-storage).

    On a decoupled AZ, create the storage class on the **workload** cluster and connect it to a pool on the **storage** cluster. That requires Ceph connection details (`clusterID`, credentials, bootstrap MON, and health check) plus the pool and storage class definitions.

    ```yaml
    systemConfiguration:
      apps:
        rook-connection:
          values:
            clusters:
              - name: "[storage-cluster-name]" # The name of the remote storage cluster
                # Ceph cluster ID (FSID), e.g. e2a62ea1-6428-496e-a5bf-366936a8c833
                clusterID: ""
                # Pool client CephClient name, without the client. prefix
                username: "[name]"
                # Key from Secret rook-ceph-client-[name] on the storage cluster
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
                # client.csi-health, and the key from Secret rook-ceph-client-csi-health
                healthCheck:
                  username: "client.csi-health"
                  token: ""
                blockPools:
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

For advanced storage class and connection options, see the [spx-rook-connection](https://github.com/super-phenix/superphenix/tree/main/components/dependencies/spx-rook-connection) chart values.

## Adding an object storage class

This section covers adding a **storage class for object (S3) storage**. They're used by end users when they create buckets and consume S3-compatible storage.

An **object storage class** is the user-facing catalog entry for S3 object storage. It exposes an object store so tenants can create and use buckets with the media, protection, and policies you define.

### Prerequisites

- At least one **object store** already exists on the cluster that hosts the storage. See [Adding an object store](adding-an-object-store.md).

### Configuration

Add the object storage class under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart), using the **`rook-connection`** chart. Choose the example that matches your AZ layout.

!!! info "Where to apply this configuration"
    Configure the storage class on the cluster that **consumes** the storage:

    - **Hyperconverged**: the same cluster that hosts the object store.
    - **Decoupled**: the **workload** cluster. Remote connection fields point at the storage cluster.

=== "Hyperconverged"

    On a hyperconverged cluster, storage and workloads share the same Superphenix cluster. You only need to reference the local object store and define the object storage class. No remote RGW endpoint or Ceph connection fields are necessary.

    ```yaml
    systemConfiguration:
      apps:
        rook-connection:
          values:
            clusters:
              - name: "spx-storage"
                objectStores:
                  - name: "[object-store-name]" # CephObjectStore name, refer to the article to create an object store
                    storageClasses:
                      - name: "[storage-class-name]"
                        # StorageClass name will be "<cluster>.<name>" unless fullName is set.
                        # Name must be unique across every storage class in the cluster.
                        # fullName: ""
    ```

=== "Decoupled"

    !!! info
        Values used to connect to a remote cluster are detailed in [Connecting a workload and storage cluster](connecting-a-workload-and-storage-cluster.md#consuming-object-storage).

    On a decoupled AZ, create the object storage class on the **workload** cluster and connect it to an object store on the **storage** cluster. That requires the RGW admin keys, the remote RGW endpoints, and the object store storage class definitions.

    ```yaml
    systemConfiguration:
      apps:
        rook-connection:
          values:
            clusters:
              - name: "[storage-cluster-name]" # The name of the remote storage cluster
                # Keys from Secret rook-ceph-object-user-[store]-[store] on the storage cluster
                rgwAdminOps:
                  accessKey: ""
                  secretKey: ""
                objectStores:
                  - name: "[object-store-name]"
                    # External RGW endpoints. Each entry accepts either `ip` or `hostname`.
                    endpoints:
                      - ip: ""
                        # hostname: ""
                    # Gateway HTTP port
                    port: 80
                    # Gateway HTTPS port (only set when TLS is enabled)
                    securePort: 443
                    # TLS configuration for the remote RGW (optional)
                    # tls:
                    #   enabled: false
                    #   # PEM-encoded certificate the operator will trust when talking to the RGW
                    #   cert: ""
                    storageClasses:
                      - name: "[storage-class-name]"
                        # StorageClass name will be "<cluster>.<name>" unless fullName is set.
                        # Name must be unique across every storage class in the cluster.
                        # fullName: ""
                        reclaimPolicy: Delete
    ```

For advanced storage class and connection options, see the [spx-rook-connection](https://github.com/super-phenix/superphenix/tree/main/components/dependencies/spx-rook-connection) chart values.
