# Connecting a workload and storage cluster

In a **decoupled** AZ, storage and workloads run on separate Superphenix clusters. Before a workload cluster can expose block or object storage classes to tenants, you must connect it to one or more storage clusters.

The relationship is many-to-many:

- One **workload** cluster can connect to **many** storage clusters.
- One **storage** cluster can be consumed by **many** workload clusters.

This article applies only to **decoupled** deployments. On hyperconverged clusters, storage and workloads already share the same cluster, so no cross-cluster connection is required.

Create the Ceph accounts on the **storage** cluster, in the `spx-storage` namespace. Then apply the connection under `systemConfiguration` on the **workload** `Cluster` resource (or via the `superphenix-operator` Helm chart), using the **`rook-connection`** chart.

## Consuming block storage

Connect the workload cluster to a storage cluster so it can consume Ceph block pools. After the connection is in place, expose pools to tenants with [block storage classes](adding-a-storage-class.md#adding-a-block-storage-class).

Block access uses two Ceph clients on the storage cluster:

- **`csi-health`** checks cluster health and refreshes the monitor list.
- A **pool client** is what the workload cluster uses to provision and attach RBD volumes. Create one client per workload cluster.

### CSI health account

Apply this on the storage cluster:

```yaml
apiVersion: ceph.rook.io/v1
kind: CephClient
metadata:
  name: csi-health
  namespace: spx-storage
spec:
  caps:
    mon: "allow r, allow command quorum_status, allow command version"
```

Rook creates the Ceph user `client.csi-health` and stores its key in the Secret `rook-ceph-client-csi-health`. That key is the health-check token:

```bash
kubectl -n spx-storage get secret rook-ceph-client-csi-health \
  -o jsonpath='{.data.csi-health}' | base64 --decode
echo
```

### Pool client

Apply a `CephClient` on the storage cluster. `[name]` is the client name you choose for this workload cluster. Rook creates the Ceph user `client.[name]` and the Secret `rook-ceph-client-[name]`.

The same pool list goes on both `mgr` and `osd`. Each entry is `profile rbd pool=<ceph-pool-name>`. The name is the `CephBlockPool` name (`kubectl -n spx-storage get cephblockpool`). An erasure-coded pool is two Ceph pools. If you followed [Adding a storage pool](adding-a-storage-pool.md), those names are `[pool-name]-metadata` and `[pool-name]`.

=== "Selected pools"

    List only the pools this workload cluster may use:

    ```yaml
    apiVersion: ceph.rook.io/v1
    kind: CephClient
    metadata:
      name: "[name]"
      namespace: spx-storage
    spec:
      caps:
        mon: "profile rbd"
        # One "profile rbd pool=<name>" entry per Ceph pool, on both mgr and osd.
        mgr: "profile rbd pool=[pool-name], profile rbd pool=[ec-pool-name]-metadata, profile rbd pool=[ec-pool-name]"
        osd: "profile rbd pool=[pool-name], profile rbd pool=[ec-pool-name]-metadata, profile rbd pool=[ec-pool-name]"
    ```

=== "Entire cluster"

    Omit every `pool=` directive to grant this client access to every pool on the storage cluster:

    ```yaml
    apiVersion: ceph.rook.io/v1
    kind: CephClient
    metadata:
      name: "[name]"
      namespace: spx-storage
    spec:
      caps:
        mon: "profile rbd"
        mgr: "profile rbd"
        osd: "profile rbd"
    ```

Read the key after the client is ready. This key is the connection token. The connection `username` is the `CephClient` name, without the `client.` prefix:

```bash
kubectl -n spx-storage get secret rook-ceph-client-[name] \
  -o jsonpath='{.data.[name]}' | base64 --decode
echo
```

### Connect the workload cluster

Apply this on the **workload** cluster. Retrieve the remaining connection values from the remote **storage** cluster as follows:

- **`clusterID`**: from `.status.cephClusters` on the Superphenix `Cluster` CR for the remote storage cluster. The Ceph FSID is the **key** of that dictionary (for example `e2a62ea1-6428-496e-a5bf-366936a8c833`).
- **`username`**: the pool client's `CephClient` name (`[name]`), without the `client.` prefix.
- **`token`**: the key from Secret `rook-ceph-client-[name]`.
- **`bootstrapMon`**: the public address of **one** Ceph monitor on the storage cluster (`id`, `ip`, `port`, and `protocol`). It is used only to bootstrap the connection. After that, the full MON list is pulled and kept fresh; this bootstrap MON is not used again.
- **`healthCheck.username`**: `client.csi-health`.
- **`healthCheck.token`**: the key from Secret `rook-ceph-client-csi-health`.

```yaml
systemConfiguration:
  apps:
    rook-connection:
      values:
        clusters:
          - name: "[storage-cluster-name]" # The name of the remote storage cluster
            # From .status.cephClusters on the remote Cluster CR (dictionary key = FSID)
            clusterID: ""
            # CephClient name of the pool client, without the client. prefix
            username: "[name]"
            # Key from Secret rook-ceph-client-[name] on the storage cluster
            token: ""
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
            # client.csi-health, and the key from Secret rook-ceph-client-csi-health
            healthCheck:
              username: "client.csi-health"
              token: ""
```

## Consuming object storage

Connect the workload cluster to a storage cluster so it can consume an RGW object store. After the connection is in place, expose the store to tenants with [object storage classes](adding-a-storage-class.md#adding-an-object-storage-class).

### Create the admin user

Apply a `CephObjectStoreUser` on the storage cluster, one per object store. The user name matches the store name. `displayName` is the RGW display name. The capabilities below let the workload cluster manage buckets and read usage for that store.

```yaml
apiVersion: ceph.rook.io/v1
kind: CephObjectStoreUser
metadata:
  name: "[store]"
  namespace: spx-storage
spec:
  store: "[store]"
  displayName: "admin"
  capabilities:
    bucket: "*"
    users: "*"
    usage: "read"
    metadata: "read"
    zone: "read"
```

`[store]` is the `CephObjectStore` name from [Adding an object store](adding-an-object-store.md). Rook stores the S3 keys in the Secret `rook-ceph-object-user-[store]-[store]`:

```bash
kubectl -n spx-storage get secret rook-ceph-object-user-[store]-[store] \
  -o jsonpath='{.data.AccessKey}' | base64 --decode
echo
kubectl -n spx-storage get secret rook-ceph-object-user-[store]-[store] \
  -o jsonpath='{.data.SecretKey}' | base64 --decode
echo
```

`AccessKey` is `rgwAdminOps.accessKey`. `SecretKey` is `rgwAdminOps.secretKey`.

### Connect the workload cluster

Apply this on the **workload** cluster:

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
              - name: "[object-store-name]" # CephObjectStore CR name (also used to derive the TLS secret name)
                # External RGW endpoints. Each entry accepts either `ip` or `hostname`.
                endpoints:
                  - hostname: "s3.example.org"
                    # ip: ""
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
