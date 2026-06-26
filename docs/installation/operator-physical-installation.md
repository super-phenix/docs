# Automated OS installation

This guide covers using the **superphenix-operator** — and the **talos-operator** it deploys — to provision and lifecycle-manage **physical servers** as Talos Kubernetes clusters. Use this path when you want declarative, GitOps-driven installation from a management cluster instead of running `talosctl` on each node by hand.

Part of the [installation guide](full-installations.md). For the manual alternative, see [Manual OS installation](talos-manual-installation.md).

## When to use this path

- **Greenfield datacenter** — bare-metal servers with BMC/IPMI are registered once; the operator drives imaging, Talos configuration, and cluster bootstrap.
- **Multi-AZ at scale** — a management cluster outside the workload AZs orchestrates many clusters from a single control plane (see [Deployment topology](../architecture/deployment-topology.md)).
- **Repeatable operations** — node additions, replacements, and Talos upgrades are handled through Kubernetes resources rather than ad hoc CLI steps.
- **Decoupled management** — the management cluster can run on any reachable Kubernetes environment while the operator provisions Talos clusters on your hardware.

## How it fits in the Superphenix stack

When you install the `superphenix-operator` Helm chart on the management cluster, the management stack can include:

- The **Superphenix web console**
- **ArgoCD** for GitOps synchronization of the Superphenix system
- The **talos-operator**, which manages physical nodes and Talos cluster lifecycle (optional, enabled when you use operator-driven provisioning)

The operator reads `Cluster` (and related) resources in the `superphenix-system` namespace and reconciles the Superphenix stack on each target cluster. When physical provisioning is enabled, the talos-operator layer handles server-level installation before or alongside that reconciliation.

## Prerequisites

- A **management Kubernetes cluster** (v1.28+) with network access to:
    - The **Kubernetes API** of every Superphenix cluster it will manage.
    - The **out-of-band (OOB)** management network of every physical server (IPMI, Redfish, or equivalent BMC).
- **`superphenix-operator`** installed via Helm — see [Installation management](installation-management.md).
- **Hardware** sized for your topology — see [Hardware requirements](../architecture/deployment-requirements.md). Production deployments should use servers with **IPMI** and a dedicated OOB network (see [Production recommendations](production-recommendations.md)).
- **Network** layout planned (cluster VLAN, public VLAN, storage fabric) — see [Network requirements](../architecture/network-requirements.md).

!!! important
    If management runs **outside** every AZ, it only needs connectivity to cluster APIs and BMCs; it does not need to be a Talos cluster itself. If management runs **on an AZ**, that AZ must already exist — typically created via [Manual OS installation](talos-manual-installation.md) for the bootstrap cluster.

## Installation overview

1. Install the `superphenix-operator` on the management cluster.
2. Register physical servers (BMC credentials, MAC addresses, desired role) with the talos-operator.
3. Define `Cluster` resources that describe topology, geography, and connection mode.
4. Let the operator provision Talos on the servers, bootstrap Kubernetes, and install the Superphenix stack.
5. Connect decoupled storage and virtualization clusters as needed — see [Connecting clusters](connecting-clusters.md).

## Step 1 — Install the operator

On your management cluster:

```bash
helm upgrade --install superphenix-operator \
  ghcr.io/super-phenix/charts/superphenix-operator \
  --namespace superphenix-system \
  --create-namespace
```

Enable talos-operator components and physical provisioning through the chart values for your environment.

*Coming soon: Helm values reference for talos-operator and BMC integration.*

## Step 2 — Register physical servers

Provide the talos-operator with everything it needs to reach and install each server:

- **BMC endpoint** and credentials (stored in Kubernetes secrets).
- **Network identity** — for example MAC address or serial number used to match a machine to its slot in the cluster design.
- **Role** — control plane, worker, storage, or hypervisor tier depending on your [deployment topology](../architecture/deployment-topology.md).

The operator uses this inventory to apply the correct Talos machine configuration and join nodes into the target cluster.

*Coming soon: example `Machine` / server inventory resources and secret layout.*

## Step 3 — Define cluster resources

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
```

Set `connection.mode: Local` when the cluster being defined is the same Kubernetes cluster that hosts the operator (typical for management-on-AZ after bootstrap).

See [Configure a cluster](configure-cluster.md) for the full field reference.

## Step 4 — Reconcile and verify

After resources are applied:

1. Confirm talos-operator has installed Talos and joined all nodes.
2. Confirm the Superphenix operator has synced the stack (ArgoCD applications healthy).
3. Validate nodes and core Superphenix components from the web console or `kubectl`.

*Coming soon: troubleshooting runbook for stalled provisioning, BMC connectivity, and bootstrap failures.*

## Choosing between manual and operator-driven installation

| Aspect | [Manual OS installation](talos-manual-installation.md) | [Automated OS installation](operator-physical-installation.md) |
|--------|----------------------------------------------|-----------------------------|
| **Best for** | Labs, first cluster, management-on-AZ bootstrap | Multi-AZ, datacenter automation, decoupled management |
| **Tooling** | `talosctl` on your workstation | Kubernetes resources + talos-operator |
| **BMC / IPMI** | Optional | Expected for hands-off physical install |
| **Day-2 node lifecycle** | You operate Talos directly | Operator and GitOps workflows |

## Next steps

- [Installation management](installation-management.md)
- [Installing clusters](installing-clusters.md)
- [Production recommendations](production-recommendations.md)
- [Deployment topology](../architecture/deployment-topology.md)
