# Configure a cluster

An availability zone is an entry under `clusters` in the `superphenix-operator` values. The key is the zone code: `local` when the zone runs on the management cluster, and the code you chose otherwise. Add the entry to the values file you already use for the operator, then [upgrade the release](../../../operations/applying-configuration-changes.md#apply-a-change).

[Installing hyperconverged](installing-hyperconverged.md) and [Installing decoupled](installing-decoupled.md) are the two layouts. Every field on an entry is listed on [Cluster](../../../reference/crds/cluster.md). The applications you can set on that cluster are the [superphenix-system](../../../reference/helm/superphenix-system.md) chart.

```yaml
clusters:
  paris-1:
    deploymentTopology: Decoupled # Hyperconverged, or Decoupled
    type: Workload                # Storage or Workload when Decoupled
    region: europe-west
    availabilityZone: paris-1
    connection:
      mode: Remote # Local when this is the cluster that runs the operator
      url: https://api.paris-1.example.net:6443
      secretRef:
        name: cluster-paris-1-credentials
        namespace: superphenix-system
    lifecycle:
      pause: false
      manual: false
      cleanupOnDeletion: false
    systemConfiguration:
      apps:
        kubeovn:
          values:
            masterNodes: "192.168.1.10,192.168.1.11,192.168.1.12"
```

`connection.mode: Local` is the cluster where the operator is running. `Remote` needs the API address and a Secret with the connection credentials. You can put those credentials under `connection.credentials` instead of creating the Secret yourself. The credential fields are in the [operator chart values](https://github.com/super-phenix/superphenix/blob/main/components/system/superphenix-operator/values.yaml).

`version` selects the Superphenix release for this cluster. Leave it empty to use the operator's chart version. `systemLocation.repoURL` and `systemLocation.chartName` select a different system chart. Leave them empty to use `ghcr.io/super-phenix/charts` and `superphenix-system`.

## systemConfiguration

`systemConfiguration` is the configuration of the stack on this cluster. Each application is set under `apps.<name>.values`.

The chart installs an application only when this cluster's layout is one that application supports: hyperconverged, decoupled storage, decoupled workload, or management. An application with no layout list is installed on every cluster where it is enabled.

Every application and every value it accepts is in the [superphenix-system](../../../reference/helm/superphenix-system.md) reference.

## Lifecycle {#lifecycle}

`lifecycle` controls how this cluster's applications are synchronized. All three switches default to `false`. Day-2 use of the same switches, including on the management plane, is in [Applying configuration changes](../../../operations/applying-configuration-changes.md#lifecycle).

## Talos

`talosManagementMode` says who installs Talos on the nodes. The default is `Unmanaged`.

| Value | Effect |
|-------|--------|
| `Unmanaged` | You install and configure Talos. The operator connects to the cluster you already have. |
| `Import` | Talos is already installed. The operator takes over its configuration. |
| `Full` | The operator installs and configures Talos. |

`Import` and `Full` take their settings from `talosManagerConfiguration` on the same entry. Every key is on the [talos-manager](../../../reference/helm/talos-manager.md) chart. The install path is [Automated OS installation](../installing-the-os/automated-os-installation.md).

## Related

- [Installing an AZ](index.md): where this values file sits in the install.
- [Adding a storage class](../../../operations/storage/adding-a-storage-class.md): hyperconverged and decoupled storage.
- [Deployment topology](../../../architecture/deployment-topology.md): hyperconverged and decoupled layouts.
