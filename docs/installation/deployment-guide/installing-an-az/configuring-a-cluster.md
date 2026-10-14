# Configure a cluster

When you define a `Cluster` resource, you specify the topology, geography, and connection details. Below is an example configuration for a remote workload cluster:

```yaml
apiVersion: operator.superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: az-paris-1
  namespace: superphenix-system
spec:
  # Hyperconverged, or Decoupled. Empty only for a management cluster (type Management).
  deploymentTopology: Decoupled

  # Required when deploymentTopology is Decoupled: Storage or Workload.
  # Required when deploymentTopology is empty: Management.
  type: Workload

  # -- Geography information
  region: europe-west
  availabilityZone: paris-1

  # -- Connection
  # Defines how the operator connects to the cluster.
  connection:
    mode: Remote
    url: https://api.paris-1.superphenix.net:6443
    secretRef:
      name: cluster-paris-1-credentials
      namespace: superphenix-system

  # Optional. Semantic version of the cluster. Empty inherits the operator's system chart version.
  version: v0.1.0
  # Optional. Empty uses the operator defaults (ghcr.io/super-phenix/charts, superphenix-system).
  systemLocation:
    repoURL: ghcr.io/super-phenix/charts
    chartName: superphenix-system

  # Passed through to the superphenix-system chart. Per-application overrides live under apps.<name>.
  systemConfiguration: {}

  lifecycle:
    pause: false
    manual: false
    cleanupOnDeletion: false

  # Unmanaged (default) - Talos is installed outside the operator.
  # Import - the operator imports an already installed Talos cluster and manages its configuration.
  # Full - the operator installs and configures Talos.
  talosManagementMode: Unmanaged
```

Set `connection.mode: Local` when the cluster being defined is the same Kubernetes cluster that hosts the operator (typical for management-on-AZ after bootstrap).

## talos-manager configuration

If you want to use the [:octicons-arrow-right-24: automated OS installation method](../installing-the-os/automated-os-installation.md), you need to specify the configuration for the talos-manager chart using the field `talosManagerConfiguration`, as well as set `talosManagementMode` to either `Full` or `Import` in your `Cluster`'s specs. Below are the values of this chart:

```yaml
# Cluster specific variables:
# Enable PXE features (optional, overrides the value set automatically by the operator depending on "talosManagementMode"):
pxeEnabled: false
# Network interface the DHCP server should listen to (optional if "talosManagementMode" set to "Import" or if "pxeEnabled" set to "false"):
dhcpInterface: ""
# IP address of the PXE server (the bootstrap server) (optional if "talosManagementMode" set to "Import" or if "pxeEnabled" set to "false"):
pxeIpAddr: ""
# Name of the Talos cluster:
clusterName: ""
# Cluster type (can be either "storage" or "virt"):
clusterType: ""
# Reconciliation mode of the Talos configuration, as defined by talos-operator ("Reconcile", "Disable" or "DryRun"):
reconciliationMode: ""
# Cluster network specifications:
clusterNetwork:
  ipv4: ""
  ipv6: ""
  cidrIpv4: 0
  cidrIpv6: 0
  vlanId: 0
  gatewayIpv4: ""
  gatewayIpv6: ""
  linkMtu: 0
# Public network specifications (optional if "clusterType" is not "storage"):
publicNetwork:
  ipv4: ""
  ipv6: ""
  cidrIpv4: 0
  cidrIpv6: 0
  vlanId: 0
  linkMtu: 0
# Storage network specifications (optional):
storageNetwork:
  ipv4: ""
  ipv6: ""
  cidrIpv4: 0
  cidrIpv6: 0
  vlanId: 0
  linkMtu: 0
# Kubernetes pod subnets specifications:
podSubnets:
  ipv4: ""
  ipv6: ""
  cidrIpv4: 0
  cidrIpv6: 0
# Kubernetes service subnets specifications:
serviceSubnets:
  ipv4: ""
  ipv6: ""
  cidrIpv4: 0
  cidrIpv6: 0
# IPv4 address of the Talos control plane node (optional if "controlplaneIpv6" is set):
controlplaneIpv4: ""
# IPv6 address of the Talos control plane node:
controlplaneIpv6: ""
# Port of the Talos control plane:
controlplanePort: 0
# ArgoCD token:
argocdToken: ""
# Version of Talos to install on nodes:
talosVersion: ""
# Version of Kubernetes to install on Talos:
k8sVersion: ""
# 'MachineConfig' overrides for all types of nodes (array, optional):
machineGlobalOverrides: []
# 'MachineConfig' overrides for control plane nodes (array, optional).
# Control planes must enable MutatingAdmissionPolicy:
machineOverridesControlPlane:
  - cluster:
      controllerManager:
        extraArgs:
          feature-gates: "MutatingAdmissionPolicy=true"
      apiServer:
        extraArgs:
          feature-gates: "MutatingAdmissionPolicy=true"
          runtime-config: "admissionregistration.k8s.io/v1beta1=true"
# 'MachineConfig' overrides for worker nodes (array, optional):
machineOverridesWorker: []

# Nodes specific variables:
nodes:
  - hostname: ""
    # Talos node type (can be either "controlplane" or "worker"):
    type: ""
    # CPU architecture of this node (optional if "talosManagementMode" set to "Import" or if "pxeEnabled" set to "false"):
    cpuArchitecture: ""
    # MAC address used by the PXE firmware (optional if "talosManagementMode" set to "Import" or if "pxeEnabled" set to "false"):
    pxeMacAddress: ""
    # Kernel command line arguments when booting in PXE (optional):
    kernelCmdlineArgs: ""
    # Specifies whether this machine should be set up for PXE:
    pxeSetup: false
    # IPv4 address of the node's IPMI (optional if "pxeSetup" set to "false"):
    ipmiIpv4: ""
    # Username of an administrator account on the IPMI (optional if "pxeSetup" set to "false"):
    ipmiUser: ""
    # Password of the aforementioned IPMI account (optional if "pxeSetup" set to "false"):
    ipmiPassword: ""
    # Name of the interface used by the PXE firmware, as given by the IPMI through Redfish (optional if "pxeSetup" set to "false"):
    pxeInterfaceName: ""
    # Specifications of the network interface:
    interface:
      # Name to give to the interface (avoid common names such as "ethX" or "enoXnpY"):
      name: ""
      # IP of this node on the cluster network (IPv6 is optional):
      clusterNetwork:
        ipv4: ""
        ipv6: ""
      # IP of this node on the public network (optional if "clusterType" is not "storage"):
      publicNetwork:
        ipv4: ""
        ipv6: ""
      # IP of this node on the storage network (optional):
      storageNetwork:
        ipv4: ""
        ipv6: ""
      # Specifies whether this interface should be connected to VLANs:
      useVlan: false
      # Specifications of the LACP bond, if applicable (setting "enabled" to "false" makes other sub-fields optional):
      lacpBond:
        enabled: false
        lacpRate: ""
        xmitHashPolicy: ""
        miimon: 0
        updelay: 0
        downdelay: 0
        linkMtu: 0
        # Physical interfaces to be aggregated:
        physicalInterfaces:
          - name: ""
            macAddress: ""
      # MAC address of the single physical interface, if bond is disabled:
      physicalMacAddress: ""
    # Specifications of the installation disk:
    installDisk:
      # Indicates whether the installation disk should be selected automatically ("true" makes other sub-fields optional):
      auto: false
      # Selector for the installation disk, if not selected automatically (this is the same as the "diskSelector" field from the Talos documentation : https://docs.siderolabs.com/talos/v1.13/reference/configuration/v1alpha1/config#diskselector):
      selector: ""
    # 'MachineConfig' overrides for this node (array, optional):
    machineOverrides: []
```

## Related

- [Installing an AZ](index.md): overview of AZ installation.
- [Adding a storage class](../../../operations/storage/adding-a-storage-class.md): hyperconverged and decoupled storage.
- [Deployment topology](../../../architecture/deployment-topology.md): hyperconverged vs decoupled layouts.
