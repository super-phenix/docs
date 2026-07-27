# Connecting a workload and storage cluster

In a **decoupled** AZ, storage and workloads run on separate Superphenix clusters. Before a workload cluster can expose block or object storage classes to tenants, you must connect it to one or more storage clusters.

The relationship is many-to-many:

- One **workload** cluster can connect to **many** storage clusters.
- One **storage** cluster can be consumed by **many** workload clusters.

This article applies only to **decoupled** deployments. On hyperconverged clusters, storage and workloads already share the same cluster, so no cross-cluster connection is required.

Apply this configuration under `systemConfiguration` on the **workload** `Cluster` resource (or via the `superphenix-operator` Helm chart), using the **`rook-connection`** chart.

## Consuming block storage

Connect the workload cluster to a storage cluster so it can consume Ceph block pools. After the connection is in place, expose pools to tenants with [block storage classes](adding-a-storage-class.md#adding-a-block-storage-class).

Retrieve the connection values from the remote **storage** cluster as follows:

- **`clusterID`**: from `.status.cephClusters` on the Superphenix `Cluster` CR for the remote storage cluster. The Ceph FSID is the **key** of that dictionary (for example `e2a62ea1-6428-496e-a5bf-366936a8c833`).
- **`username`**: TBD.
- **`token`**: TBD.
- **`bootstrapMon`**: the public address of **one** Ceph monitor on the storage cluster (`id`, `ip`, `port`, and `protocol`). It is used only to bootstrap the connection. After that, the full MON list is pulled and kept fresh; this bootstrap MON is not used again.
- **`healthCheck`**: TBD.

```yaml
systemConfiguration:
  rook-connection:
    helm:
      values:
        clusters:
          - name: "[storage-cluster-name]" # The name of the remote storage cluster
            # From .status.cephClusters on the remote Cluster CR (dictionary key = FSID)
            clusterID: ""
            username: "[csi-user]" # TBD
            token: "" # TBD
            # Public address of one MON; used only to bootstrap, then the full MON list is refreshed
            bootstrapMon:
              # MON ID (must be a single letter)
              id: ""
              # IP of the MON
              ip: ""
              # Port of the MON
              port: "6789"
              # Protocol of the IP (IPv4 or IPv6)
              protocol: IPv6
            # TBD
            healthCheck:
              username: "client.csi-health"
              token: ""
```

## Consuming object storage

Connect the workload cluster to a storage cluster so it can consume an RGW object store. After the connection is in place, expose the store to tenants with [object storage classes](adding-a-storage-class.md#adding-an-object-storage-class).

```yaml
systemConfiguration:
  rook-connection:
    helm:
      values:
        clusters:
          - name: "[storage-cluster-name]" # The name of the remote storage cluster
            objectStores:
              - name: "[object-store-name]" # CephObjectStore CR name (also used to derive the TLS secret name)
                # External RGW endpoints. Each entry accepts either `ip` or `hostname`.
                endpoints:
                  - ip: ""
                    # hostname: ""
                # Gateway HTTP port
                port: 80
                # Gateway HTTPS port (only set when TLS is enabled)
                # securePort: 443
                # TLS configuration for the remote RGW
                # tls:
                #   enabled: false
                #   # PEM-encoded certificate the operator will trust when talking to the RGW
                #   cert: ""
```

For advanced connection options, see the [spx-rook-connection](https://github.com/super-phenix/superphenix/tree/main/components/dependencies/spx-rook-connection) chart values.
