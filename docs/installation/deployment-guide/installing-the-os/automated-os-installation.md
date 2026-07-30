# Automated OS installation

This guide covers using the **superphenix-operator**, the **talos-operator** and **talos-manager** to provision and lifecycle-manage **physical servers** as Talos Kubernetes clusters. Use this path when you want declarative, GitOps-driven installation from a management cluster instead of running `talosctl` on each node by hand.

Part of the [deployment guide](../index.md). For the manual alternative, see [Manual OS installation](manual-os-installation.md).

## When to use this path

- **Greenfield datacenter**: bare-metal servers with BMC/IPMI are registered once; the operator drives imaging, Talos configuration, and cluster bootstrap.
- **Multi-AZ at scale**: a management cluster outside the workload AZs orchestrates many clusters from a single control plane (see [Deployment topology](../../../architecture/deployment-topology.md)).
- **Repeatable operations**: node additions, replacements, and Talos upgrades are handled through Kubernetes resources rather than ad hoc CLI steps.
- **Decoupled management**: the management cluster can run on any reachable Kubernetes environment while the operator provisions Talos clusters on your hardware.

## How it fits in the Superphenix stack

When you install the `superphenix-operator` Helm chart on the management cluster, the management stack can include:

- The **Superphenix web console**
- **ArgoCD** for GitOps synchronization of the Superphenix system
- The **talos-operator**, which deploys a server for PXE boot and manages physical nodes and Talos cluster lifecycle (optional, enabled when you use operator-driven provisioning)
- **talos-manager**, which generates a `TalosCluster` resource for talos-operator to manage the cluster (optional, enabled when you use operator-driven provisioning).

The operator reads `Cluster` (and related) resources in the `superphenix-system` namespace and reconciles the Superphenix stack on each target cluster. When physical provisioning is enabled, the talos-operator layer handles server-level installation before or alongside that reconciliation.

## Prerequisites

- A **management Kubernetes cluster** (v1.28+) with network access to:
    - The **Kubernetes API** of every Superphenix cluster it will manage.
    - The **out-of-band (OOB)** management network of every physical server (IPMI, Redfish, or equivalent BMC).
- **`superphenix-operator`** installed via Helm: see [Installing outside an AZ](../installing-management/management-outside-az.md) (typical for automated provisioning) or [Installing inside an AZ](../installing-management/management-inside-az.md).
- **Hardware** sized for your topology: see [Hardware requirements](../../../architecture/deployment-requirements.md). Production deployments should use servers with **IPMI** and a dedicated OOB network (see [Production recommendations](../../production-recommendations.md)).
- **Network** layout planned (cluster VLAN, public VLAN, storage fabric): see [Network requirements](../../../architecture/network-requirements.md).

!!! important
    If management runs **outside** every AZ, it only needs connectivity to cluster APIs and BMCs; it does not need to be a Talos cluster itself. If management runs **on an AZ**, that AZ must already exist, typically created via [Manual OS installation](manual-os-installation.md). See [Installing inside an AZ](../installing-management/management-inside-az.md).

!!! important
    Nodes must support PXE boot and EFI (make sure that the boot mode is UEFI and not "legacy" in the BIOS settings). If you want to make your nodes reboot into PXE automatically, they will need an IPMI with Redfish enabled.
    Setting up PXE automatically on the BIOS only works on DELL iDRAC and Lenovo XClarity, and setting up VLAN on the PXE interface only works on DELL iDRAC. Automatic reboot into PXE should work with all IPMI.

!!! important
    Make sure no DHCP server is running on the cluster VLAN, as it might conflict with the DHCP server deployed by talos-operator for PXE boot.

## Installation overview

1. Install the `superphenix-operator` on the management cluster.
2. Define `Cluster` resources that describe topology, geography and connection mode, as well as BMC credentials, MAC addresses and desired role of each node for talos-manager.
3. Let the operator boot and provision Talos on the servers, bootstrap Kubernetes, and install the Superphenix stack.
4. Connect decoupled storage and workload clusters as needed. See [Connecting a workload and storage cluster](../../../operations/storage/connecting-a-workload-and-storage-cluster.md).

## Step 1: Install the operator

On your management cluster:

```bash
helm upgrade --install superphenix-operator \
  ghcr.io/super-phenix/charts/superphenix-operator \
  --namespace superphenix-system \
  --create-namespace --set "management.values.talos-operator.enabled=true"
```

## Step 2: Define cluster resources

Create `Cluster` resources in `superphenix-system` that describe each Superphenix AZ. For operator-provisioned clusters, set connection details so the management plane can reach the cluster once bootstrap completes:

```yaml
apiVersion: superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: az-paris-1
  namespace: superphenix-system
spec:
  deploymentTopology: Decoupled
  type: Virtualization
  region: europe-west
  availabilityZone: paris-1
  connection:
    mode: Remote
    url: https://api.paris-1.superphenix.net:6443
    secretRef:
      name: cluster-paris-1-credentials
      namespace: superphenix-system
  version: v0.1.0
  repoURL: https://charts.superphenix.net
  chartName: superphenix-stack
  talosManagementMode: Full
  talosManagerConfiguration:
    dhcpInterface: "enp0s1"
    pxeIpAddr: "10.0.0.1"
    clusterName: "az-paris-1"
    clusterType: virt
    reconciliationMode: Reconcile
    clusterNetwork:
      ipv4: "10.0.0.0"
      ipv6: "fc00:1::"
      cidrIpv4: 24
      cidrIpv6: 64
      vlanId: 1
      gatewayIpv4: "10.0.0.254"
      linkMtu: 1500
    publicNetwork:
      ipv6: "fc00:2::"
      cidrIpv6: 64
      vlanId: 2
      linkMtu: 1500
    podSubnets:
      ipv4: "10.0.0.0"
      ipv6: "fd00:100::"
      cidrIpv4: 12
      cidrIpv6: 96
    serviceSubnets:
      ipv4: "10.16.0.0"
      ipv6: "fd00:100:ffff::"
      cidrIpv4: 12
      cidrIpv6: 112
    controlplaneIpv6: "fc00:1::ffff:ffff:ffff:ffff"
    controlplanePort: 6443
    talosVersion: "v1.13.0"
    k8sVersion: "v1.35.0"
    nodes:
      - hostname: "az-paris-1-master01"
        type: controlplane
        cpuArchitecture: amd64
        pxeMacAddress: "AA:AA:AA:AA:AA:AA"
        pxeSetup: true
        ipmiIpv4: "10.0.2.1"
        ipmiUser: user
        ipmiPassword: pass
        pxeInterfaceName: "Interface1"
        interface:
          name: net0
          clusterNetwork:
            ipv4: "10.0.0.2"
            ipv6: "fc00:1::2"
          publicNetwork:
            ipv6: "fc00:2::2"
          useVlan: true
          lacpBond:
            enabled: false
          physicalMacAddress: "AA:AA:AA:AA:AA:AA"
        installDisk:
          auto: true
      - ...
```

Set `connection.mode: Local` when the cluster being defined is the same Kubernetes cluster that hosts the operator (typical for management-on-AZ after bootstrap).

Set `talosManagementMode: Full` to let talos-operator boot, install and configure Talos automatically, or `talosManagementMode: Import` to import an already installed Talos cluster and let talos-operator manage its lifecycle.

See [Configure a cluster](../installing-an-az/configuring-a-cluster.md) for the full field reference.

## Step 3: Reconcile and verify

After resources are applied:

1. Confirm talos-operator has installed Talos and joined all nodes.
2. Confirm the Superphenix operator has synced the stack (ArgoCD applications healthy).
3. Validate nodes and core Superphenix components from the web console or `kubectl`.

*Coming soon: troubleshooting runbook for stalled provisioning, BMC connectivity, and bootstrap failures.*

## Choosing between manual and operator-driven installation

| Aspect | [Manual OS installation](manual-os-installation.md) | [Automated OS installation](automated-os-installation.md) |
|--------|----------------------------------------------|-----------------------------|
| **Best for** | Labs, first cluster, management-on-AZ bootstrap | Multi-AZ, datacenter automation, decoupled management |
| **Tooling** | `talosctl` on your workstation | Kubernetes resources + talos-operator |
| **BMC / IPMI** | Optional | Expected for hands-off physical install |
| **Day-2 node lifecycle** | You operate Talos directly | Operator and GitOps workflows |

## Next steps

- [Installing outside an AZ](../installing-management/management-outside-az.md)
- [Installing an AZ](../installing-an-az/index.md)
- [Production recommendations](../../production-recommendations.md)
- [Deployment topology](../../../architecture/deployment-topology.md)
