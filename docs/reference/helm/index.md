# Helm charts

Each page lists the chart's values and the documentation that ships with that chart in the [Superphenix repository](https://github.com/super-phenix/superphenix), under `components/`. A default is the chart default. Replace placeholder secrets before use. The pages call those placeholders out when the chart says they must be overridden.

The operator installs clusters by rendering **superphenix-system**. Per-cluster overrides go in `Cluster.spec.systemConfiguration`, documented on [Cluster](../crds/cluster.md).

## Platform

These charts install the management plane and the stack on each cluster.

| Chart | Path | What it configures |
|-------|------|--------------------|
| [superphenix-operator](superphenix-operator.md) | `components/system/superphenix-operator` | Operator deployment, Argo CD, and the Cluster resources it manages. |
| [superphenix-system](superphenix-system.md) | `components/system/superphenix-system` | App-of-apps installed on management, hyperconverged, storage, and workload clusters. |
| [superphenix-api](superphenix-api.md) | `components/system/superphenix-api` | Superphenix API deployment. |
| [superphenix-controller](superphenix-controller.md) | `components/system/superphenix-controller` | Per-AZ controller deployment. |

## Components

The system chart renders these charts. Their values are what a cluster or a tenant project sets inside that app.

| Chart | Path | What it configures |
|-------|------|--------------------|
| [sfs-iaas](sfs-iaas.md) | `components/dependencies/sfs-iaas` | Tenant IaaS resources: VPCs, subnets, disks, and the rest of the self-service catalog. |
| [sfs-kaas](sfs-kaas.md) | `components/dependencies/sfs-kaas` | Tenant Kubernetes clusters. |
| [sfs-baas](sfs-baas.md) | `components/dependencies/sfs-baas` | Backup policies. |
| [sfs-gitops](sfs-gitops.md) | `components/dependencies/sfs-gitops` | GitOps identity for an organization and project. |
| [spx-policies](spx-policies.md) | `components/dependencies/spx-policies` | Validating admission policies. |
| [spx-rook-connection](spx-rook-connection.md) | `components/dependencies/spx-rook-connection` | Connection from a workload cluster to a storage cluster. |
| [talos-manager](talos-manager.md) | `components/dependencies/talos-manager` | PXE and Talos cluster configuration. Passed through `Cluster.spec.talosManagerConfiguration`. |
| [talos-backup](talos-backup.md) | `components/dependencies/talos-backup` | Scheduled etcd backups. |
| [tuned](tuned.md) | `components/dependencies/tuned` | Node tuning profiles. |
| [kaas-essentials](kaas-essentials.md) | `components/dependencies/kaas-essentials` | Utilities inside a tenant cluster: HAProxy, Cilium, and KubeVirt CSI. |
| [kaas-datastore](kaas-datastore.md) | `components/dependencies/kaas-datastore` | etcd datastores for Kamaji control planes. |
| [misc](misc.md) | `components/dependencies/misc` | Extra YAML objects selected by cluster mode. |

## Charts without values

These charts are bundled and installed by superphenix-system. Their `values.yaml` files are empty, so they have no operator-facing values of their own: `cdi`, `csi-addons`, `external-snapshotter`, `kaas-controller`, and `multus`.
