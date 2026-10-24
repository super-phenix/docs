# Adding an object store

An **object store** is the Ceph RADOS Gateway (RGW) that serves the S3 API. Buckets created by tenants are stored there. Each store has:

- A **metadata pool**. It holds the bucket index and the rest of the RGW metadata. It stays small next to the object data and is sensitive to latency, so SSD or NVMe is a good fit.
- A **data pool**. It holds the objects. It can be replicated or erasure coded.
- One or more **gateway** that serves the S3 API.

Superphenix ships with `cephObjectStores` empty, so a cluster has no object store until you add one. Add it on the cluster that hosts Ceph, then publish it to tenants with an [object storage class](adding-a-storage-class.md#adding-an-object-storage-class).

Both pools use the same media, failure domain, and data protection as a [storage pool](adding-a-storage-pool.md). Follow that article for device classes, replication, and erasure coding, including the host counts each profile needs. Disks Rook is allowed to claim are set in [Configuring the storage cluster](configuring-the-storage-cluster.md). Add another object store when those choices should differ, for example an erasure-coded HDD store for capacity and a replicated NVMe store for latency.

## Configuration

Add the store under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart), using the **`rook-local-cluster`** chart. Choose the example that matches the **data** pool. The metadata pool always uses the replicated layout.

!!! info "Where to apply this configuration"
    Configure the object store on the cluster that **hosts the storage**:

    - **Hyperconverged**: the same cluster that will consume the storage.
    - **Decoupled**: the **storage** cluster (not the workload cluster).

=== "Replicated"

    Use this when the data pool should be replicated. The pool fields are the ones documented for a [replicated storage pool](adding-a-storage-pool.md).

    ```yaml
    systemConfiguration:
      apps:
        rook-local-cluster:
          values:
            cephObjectStores:
              - name: "[object-store-name]"
                spec:
                  metadataPool:
                    # RGW metadata. Always replicated. See "Adding a storage pool".
                    # We recommend SSD/NVMes here, but can also be HDD
                    deviceClass: ssd
                    failureDomain: "host"
                    replicated:
                      size: 3
                  dataPool:
                    # Object data. Same fields as a replicated storage pool.
                    deviceClass: hdd
                    failureDomain: "host"
                    replicated:
                      size: 3
                  # Keep the pools if this object store is deleted, so the objects
                  # remain. Set false only when you intend to drop the data with the store.
                  preservePoolsOnDelete: true
                  gateway:
                    # HTTP port on which the store will listen.
                    port: 8090
                    # Number of gateways we'll deploy. The more we have, the more traffic we can
                    # ingress. Any node of the cluster can act as a gateway.
                    instances: 3
                # Tenant-facing classes are created with rook-connection.
                # Leave the chart's own bucket class disabled.
                storageClass:
                  enabled: false
                # The ingress to expose the storage class and make every node respond to S3 traffic.
                # Traefik terminates TLS and forwards to the gateway port.
                ingress:
                  enabled: true
                  annotations:
                    cert-manager.io/cluster-issuer: letsencrypt
                    nginx.ingress.kubernetes.io/ssl-redirect: "true"
                    nginx.ingress.kubernetes.io/proxy-body-size: "0"
                    nginx.ingress.kubernetes.io/proxy-request-buffering: "off"
                    nginx.ingress.kubernetes.io/proxy-buffering: "off"
                    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
                  host:
                    # Public S3 hostname. Point DNS at the cluster.
                    name: s3.example.org
                    path: /
                  tls:
                    - hosts:
                        - s3.example.org
                      secretName: "[object-store-name]-tls"
    ```

=== "Erasure coded"

    Use this when the data pool should be erasure coded. The data pool fields are the ones documented for an [erasure-coded storage pool](adding-a-storage-pool.md). The metadata pool stays replicated.

    ```yaml
    systemConfiguration:
      apps:
        rook-local-cluster:
          values:
            cephObjectStores:
              - name: "[object-store-name]"
                spec:
                  metadataPool:
                    # RGW metadata. Always replicated, including when object data is erasure coded.
                    # See "Adding a storage pool".
                    # We recommend SSD/NVMes here, but can also be HDD
                    deviceClass: ssd
                    failureDomain: "host"
                    replicated:
                      size: 3
                  dataPool:
                    # Object data. Same fields as an erasure-coded storage pool.
                    deviceClass: hdd
                    failureDomain: "host"
                    erasureCoded:
                      dataChunks: 4
                      codingChunks: 2
                  # Keep the pools if this object store is deleted, so the objects
                  # remain. Set false only when you intend to drop the data with the store.
                  preservePoolsOnDelete: true
                  gateway:
                    # HTTP port on which the store will listen.
                    port: 8090
                    # Number of gateways we'll deploy. The more we have, the more traffic we can
                    # ingress. Any node of the cluster can act as a gateway.
                    instances: 3
                # Tenant-facing classes are created with rook-connection.
                # Leave the chart's own bucket class disabled.
                storageClass:
                  enabled: false
                # The ingress to expose the storage class and make every node respond to S3 traffic.
                # Traefik terminates TLS and forwards to the gateway port.
                ingress:
                  enabled: true
                  annotations:
                    cert-manager.io/cluster-issuer: letsencrypt
                    nginx.ingress.kubernetes.io/ssl-redirect: "true"
                    nginx.ingress.kubernetes.io/proxy-body-size: "0"
                    nginx.ingress.kubernetes.io/proxy-request-buffering: "off"
                    nginx.ingress.kubernetes.io/proxy-buffering: "off"
                    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
                  host:
                    # Public S3 hostname. Point DNS at the cluster.
                    name: s3.example.org
                    path: /
                  tls:
                    - hosts:
                        - s3.example.org
                      secretName: "[object-store-name]-tls"
    ```

The `name` is the `CephObjectStore` name on this cluster. Use that same `[object-store-name]` when you [add an object storage class](adding-a-storage-class.md#adding-an-object-storage-class).

The Ingress is the S3 endpoint clients use (`https://s3.example.org`). Replace the hostname and point DNS at the nodes of the cluster. Any node of the cluster is capable of handling S3.

For advanced pool and gateway options, see the [rook-ceph-cluster](https://artifacthub.io/packages/helm/rook/rook-ceph-cluster) Helm chart values.

## Verify the object store

The store is created in the `rook-local-cluster` namespace, `spx-storage`. Wait until its phase is `Ready` and one gateway pod is running for each `gateway.instances`:

```bash
kubectl -n spx-storage get cephobjectstore
kubectl -n spx-storage get pods -l app=rook-ceph-rgw
```

Then expose the store to tenants:

- **Hyperconverged**: add an [object storage class](adding-a-storage-class.md#adding-an-object-storage-class) on this cluster.
- **Decoupled**: [connect the workload cluster](connecting-a-workload-and-storage-cluster.md#consuming-object-storage), then add the object storage class there.
