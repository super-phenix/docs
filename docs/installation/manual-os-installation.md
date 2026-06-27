# Manual OS installation

This guide covers installing **Talos Linux** on your servers and bootstrapping a **Kubernetes** cluster by hand, using `talosctl`. Use this path when you already have physical or virtual machines ready and want full control over the Talos machine configuration before handing the cluster to Superphenix.

Part of the [deployment guide](deployment-guide.md). For the automated alternative, see [Automated OS installation](automated-os-installation.md).

## When to use this path

- **First lab or single-AZ deployment**: fastest way to get a working cluster on a small node count (for example 3 nodes in hyperconverged mode).
- **Management on an AZ**: the management cluster must be a pre-existing Talos cluster before you install the `superphenix-operator` Helm chart.
- **Bring your own cluster**: you manage Talos upgrades, machine configs, and node lifecycle yourself; Superphenix connects to the cluster via a `Cluster` resource with `connection.mode: Local` or `Remote`.

!!! warning "Official support scope"
    Superphenix can technically run on any conformant Kubernetes cluster, but we **officially support Talos**. Current default values and operational assumptions are tuned for Talos-based clusters.

## Prerequisites

Before you start, confirm:

- **Hardware and network** meet the profile for your topology: see [Hardware requirements](../architecture/deployment-requirements.md) and [Network requirements](../architecture/network-requirements.md).
- **Deployment topology** is chosen (hyperconverged vs decoupled, management in vs out): see [Deployment topology](../architecture/deployment-topology.md).
- **`talosctl`** is installed on your workstation: [talosctl CLI reference](https://www.talos.dev/latest/reference/cli/).
- Servers can reach each other on the **cluster VLAN** and your workstation can reach each node on the Talos API port during bootstrap.

## Installation overview

1. Generate Talos machine configuration for your cluster endpoint.
2. Boot each node from the Talos installer (ISO, PXE, or disk image).
3. Apply machine configs to every node.
4. Bootstrap etcd on the first control-plane node.
5. Retrieve the kubeconfig and verify the Kubernetes API.
6. Continue with [Installing management plane](installing-management.md) on this cluster (or register it as a remote cluster from your management plane).

## Step 1: Generate cluster configuration

Pick a stable **Kubernetes API endpoint** (VIP, load balancer, or first control-plane IP) and generate configs:

```bash
talosctl gen config spx-cluster https://<api-endpoint>:6443
```

This produces `controlplane.yaml`, `worker.yaml`, and `talosconfig`. Edit the generated files before applying them:

- Set node hostnames, disk selectors, and network interfaces to match your hardware.
- For a minimal 3-node hyperconverged lab, you can run all nodes as control-plane members (no separate workers).
- Align `podCIDR` and `serviceCIDR` with what you plan to declare later in the Superphenix `Cluster` resource.

Official reference: [Talos Getting Started](https://talos.dev/v1.11/introduction/getting-started).

## Step 2: Boot the nodes

Install Talos on each server using one of:

- **ISO**: boot from the Talos installer image and install to disk.
- **PXE**: network boot for repeatable datacenter provisioning.
- **Image**: flash a prepared disk image when you manage imaging outside Talos.

Each node should come up in **maintenance mode** and expose the Talos API on its management/cluster interface.

## Step 3: Apply machine configuration

Apply the control-plane config to every control-plane node (repeat for each node IP):

```bash
talosctl apply-config --insecure --nodes <node-ip> --file controlplane.yaml
```

If you use dedicated workers, apply `worker.yaml` to worker nodes instead.

## Step 4: Bootstrap etcd

From one control-plane node only, bootstrap the cluster:

```bash
talosctl bootstrap --nodes <first-control-plane-ip>
```

Wait until the Kubernetes API responds on `https://<api-endpoint>:6443`.

## Step 5: Verify the cluster

Fetch kubeconfig and confirm nodes are ready:

```bash
talosctl kubeconfig .
kubectl get nodes
```

All control-plane (and worker, if any) nodes should report `Ready` before you install Superphenix.

## Next steps

- Install the operator: [Installing management plane](installing-management.md).
- Define your AZ: [Configure a cluster](configuring-a-cluster.md).
- For production sizing and tuning: [Production recommendations](production-recommendations.md).
