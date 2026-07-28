# Configuring the storage cluster

Configure the storage cluster through the **`rook-local-cluster`** chart under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart). The same pattern applies to both **hyperconverged** and **decoupled** deployments: set these values on the cluster that hosts Ceph.

The parameters below are the ones changed most often: Ceph network address ranges and which disks Rook claims for OSDs.

!!! info "Where to apply this configuration"
    Configure storage on the cluster that **hosts Ceph**:

    - **Hyperconverged**: the single AZ cluster (storage and workloads together).
    - **Decoupled**: the **storage** cluster (not the workload cluster).

```yaml
systemConfiguration:
  rook-local-cluster:
    helm:
      values:
        cephClusterSpec:
          network:
            addressRanges:
              public:
                - fd00:ffff:2000::/64
              cluster:
                # We reserve the first of the 65536 subnets to Ceph; nodes should only be
                # assigned addresses in that range.
                - fd00:ffff:2001::/96
          storage:
            deviceFilter: "nvme*|sd*"
```

- **`network.addressRanges.public`**: address range for Ceph client (public) traffic.
- **`network.addressRanges.cluster`**: address range for Ceph replication and recovery traffic. Keep node addresses within the reserved range.
- **`storage.deviceFilter`**: which disks Rook claims as OSDs (for example NVMe and SCSI disks matching `nvme*` or `sd*`).

For network planning around public vs cluster storage traffic, see [Network requirements](../../architecture/network-requirements.md). For disk sizing and Ceph media guidance, see [Hardware requirements](../../architecture/deployment-requirements.md).

For advanced options, see the [rook-ceph-cluster](https://artifacthub.io/packages/helm/rook/rook-ceph-cluster) Helm chart values.
