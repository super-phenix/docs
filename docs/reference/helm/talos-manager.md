# talos-manager

Values and chart documentation for `components/dependencies/talos-manager` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

Sets up PXE on nodes and generates a TalosCluster resource for talos-operator to manage the cluster.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| argocdToken | string | `""` |  |
| clusterName | string | `""` |  |
| clusterNetwork.cidrIpv4 | int | `0` |  |
| clusterNetwork.cidrIpv6 | int | `0` |  |
| clusterNetwork.gatewayIpv4 | string | `""` |  |
| clusterNetwork.gatewayIpv6 | string | `""` |  |
| clusterNetwork.ipv4 | string | `""` |  |
| clusterNetwork.ipv6 | string | `""` |  |
| clusterNetwork.linkMtu | int | `0` |  |
| clusterNetwork.vlanId | int | `0` |  |
| clusterType | string | `""` |  |
| controlplaneIpv4 | string | `""` |  |
| controlplaneIpv6 | string | `""` |  |
| controlplanePort | int | `0` |  |
| dhcpInterface | string | `""` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| k8sVersion | string | `""` |  |
| machineGlobalOverrides | list | `[]` |  |
| machineOverridesControlPlane | list | `[]` |  |
| machineOverridesWorker | list | `[]` |  |
| nodes[0].cpuArchitecture | string | `""` |  |
| nodes[0].hostname | string | `""` |  |
| nodes[0].installDisk.auto | bool | `false` |  |
| nodes[0].installDisk.selector | string | `""` |  |
| nodes[0].interface.clusterNetwork.ipv4 | string | `""` |  |
| nodes[0].interface.clusterNetwork.ipv6 | string | `""` |  |
| nodes[0].interface.lacpBond.downdelay | int | `0` |  |
| nodes[0].interface.lacpBond.enabled | bool | `false` |  |
| nodes[0].interface.lacpBond.lacpRate | string | `""` |  |
| nodes[0].interface.lacpBond.linkMtu | int | `0` |  |
| nodes[0].interface.lacpBond.miimon | int | `0` |  |
| nodes[0].interface.lacpBond.physicalInterfaces[0].macAddress | string | `""` |  |
| nodes[0].interface.lacpBond.physicalInterfaces[0].name | string | `""` |  |
| nodes[0].interface.lacpBond.updelay | int | `0` |  |
| nodes[0].interface.lacpBond.xmitHashPolicy | string | `""` |  |
| nodes[0].interface.name | string | `""` |  |
| nodes[0].interface.physicalMacAddress | string | `""` |  |
| nodes[0].interface.publicNetwork.ipv4 | string | `""` |  |
| nodes[0].interface.publicNetwork.ipv6 | string | `""` |  |
| nodes[0].interface.storageNetwork.ipv4 | string | `""` |  |
| nodes[0].interface.storageNetwork.ipv6 | string | `""` |  |
| nodes[0].interface.useVlan | bool | `false` |  |
| nodes[0].ipmiIpv4 | string | `""` |  |
| nodes[0].ipmiPassword | string | `""` |  |
| nodes[0].ipmiUser | string | `""` |  |
| nodes[0].kernelCmdlineArgs | string | `""` |  |
| nodes[0].machineOverrides | list | `[]` |  |
| nodes[0].pxeInterfaceName | string | `""` |  |
| nodes[0].pxeMacAddress | string | `""` |  |
| nodes[0].pxeSetup | bool | `false` |  |
| nodes[0].type | string | `""` |  |
| podSubnets.cidrIpv4 | int | `0` |  |
| podSubnets.cidrIpv6 | int | `0` |  |
| podSubnets.ipv4 | string | `""` |  |
| podSubnets.ipv6 | string | `""` |  |
| publicNetwork.cidrIpv4 | int | `0` |  |
| publicNetwork.cidrIpv6 | int | `0` |  |
| publicNetwork.ipv4 | string | `""` |  |
| publicNetwork.ipv6 | string | `""` |  |
| publicNetwork.linkMtu | int | `0` |  |
| publicNetwork.vlanId | int | `0` |  |
| pxeEnabled | bool | `false` |  |
| pxeIpAddr | string | `""` |  |
| reconciliationMode | string | `""` |  |
| serviceSubnets.cidrIpv4 | int | `0` |  |
| serviceSubnets.cidrIpv6 | int | `0` |  |
| serviceSubnets.ipv4 | string | `""` |  |
| serviceSubnets.ipv6 | string | `""` |  |
| storageNetwork.cidrIpv4 | int | `0` |  |
| storageNetwork.cidrIpv6 | int | `0` |  |
| storageNetwork.ipv4 | string | `""` |  |
| storageNetwork.ipv6 | string | `""` |  |
| storageNetwork.linkMtu | int | `0` |  |
| storageNetwork.vlanId | int | `0` |  |
| talosVersion | string | `""` |  |
