# Manual OS installation

This guide covers installing **Talos Linux** on your servers and bootstrapping a **Kubernetes** cluster by hand, using `talosctl`. Use this path when you already have physical or virtual machines ready and want full control over the Talos machine configuration before handing the cluster to Superphenix.

Part of the [deployment guide](../index.md). For the automated alternative, see [Automated OS installation](automated-os-installation.md).

For the installation of Talos Linux on **GPU nodes**, see [Installing GPU Nodes](gpu-node-installation.md).

## When to use this path

- **First lab or single-AZ deployment**: fastest way to get a working cluster on a small node count (for example 3 nodes in hyperconverged mode).
- **Management on an AZ**: the management cluster must be a pre-existing Talos cluster before you install the `superphenix-operator` Helm chart.
- **Bring your own cluster**: you manage Talos upgrades, machine configs, and node lifecycle yourself; Superphenix connects to the cluster via a `Cluster` resource with `connection.mode: Local` or `Remote`.

!!! warning "Official support scope"
    Superphenix is **only officially supported on Talos**. Use **Talos 1.12.6 or older**: newer versions hit a Linux kernel bug that breaks the SDN.

## Prerequisites

Before you start, confirm:

- **Hardware and network** meet the profile for your topology: see [Hardware requirements](../../../architecture/hardware-requirements.md) and [Network requirements](../../../architecture/network-requirements.md).
- **Deployment topology** is chosen (hyperconverged vs decoupled, management in vs out): see [Deployment topology](../../../architecture/deployment-topology.md).
- **`talosctl`** ([CLI reference](https://www.talos.dev/latest/reference/cli/)) and **`kubectl`** on your workstation.
- **Talos 1.12.6 or older** installer media (ISO, PXE, or disk image).
- Servers can reach each other on the **cluster VLAN** and your workstation can reach each node on the Talos API port during bootstrap.

## Installation overview

1. Generate Talos machine configuration for your cluster endpoint.
2. Boot each node from the Talos installer (ISO, PXE, or disk image).
3. Apply machine configs to every node.
4. Bootstrap etcd on the first control-plane node.
5. Retrieve the kubeconfig and verify the Kubernetes API.
6. Continue with [Installing inside an AZ](../installing-management/management-inside-az.md) on this cluster (or register it as a remote cluster from your management plane).

## Step 1: Generate cluster configuration

Pick a stable **Kubernetes API endpoint** (VIP, load balancer, or first control-plane IP) and generate configs:

```bash
talosctl gen config spx-cluster https://<api-endpoint>:6443
```

This produces `controlplane.yaml`, `worker.yaml`, and `talosconfig`. Edit the generated files **before** you apply them.

Set node hostnames, disk selectors, and addressing to match your hardware. Superphenix installs the CNI and CoreDNS itself, so those must be disabled in Talos. Every node also needs the containerd and kernel settings below, plus an **external** interface with the **same name** on every node. Control-plane configs must enable **MutatingAdmissionPolicy**.

Edit `controlplane.yaml` (and `worker.yaml` if you use dedicated workers) with at least:

```yaml
machine:
  files:
    - content: |
        [plugins]
          [plugins."io.containerd.grpc.v1.cri"]
            device_ownership_from_security_context = true
          [plugins."io.containerd.cri.v1.runtime"]
            device_ownership_from_security_context = true
      path: /etc/cri/conf.d/20-customization.part
      op: create
  kernel:
    modules:
      - name: openvswitch
  network:
    interfaces:
      - interface: ext0 # same name on every node (NIC, bond, or VLAN)
        dhcp: true
        routes:
          - network: 0.0.0.0/0
            gateway: 192.168.1.1 # your default gateway

cluster:
  network:
    cni:
      name: none
  coreDNS:
    disabled: true
  controllerManager:
    extraArgs:
      feature-gates: "MutatingAdmissionPolicy=true"
  apiServer:
    extraArgs:
      feature-gates: "MutatingAdmissionPolicy=true"
      runtime-config: "admissionregistration.k8s.io/v1beta1=true"
```

For a small hyperconverged lab with only control-plane nodes, also set `cluster.allowSchedulingOnControlPlanes: true` so Superphenix workloads can run on those nodes. Dedicated workers do not need that flag or the `controllerManager` / `apiServer` extraArgs; apply the same `machine` and `cluster.network` / `coreDNS` settings in `worker.yaml`.

Replace `ext0`, DHCP vs static addressing, and the default gateway to match your network. Keep the interface **name** identical on every node.

???+ warning "Same external interface name on every node"
    The **external** interface must have the **same name on every node** (`ext0` here). Superphenix uses that name cluster-wide. If kernel names differ, append a `LinkAliasConfig` per node (physical NICs only; name bonds and VLANs yourself). Keep `name: ext0` identical; change only the MAC:

    ```yaml
    ---
    apiVersion: v1alpha1
    kind: LinkAliasConfig
    name: ext0
    selector:
      match: mac(link.permanent_addr) == "00:1a:2b:3c:4d:5e" # this node's NIC MAC
    ```

    Do not use kernel-style alias names (`eth0`, `ens3`, `enp0s31f6`, …).

Official reference: [Talos Getting Started](https://talos.dev/v1.11/introduction/getting-started). For a full 3-node lab walkthrough including Superphenix Helm values, see [Getting started](../../getting-started.md).

## Step 2: Boot the nodes

Install **Talos 1.12.6 or older** on each server using one of:

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

- Install the operator: [Installing inside an AZ](../installing-management/management-inside-az.md) or [Installing outside an AZ](../installing-management/management-outside-az.md).
- Define your AZ: [Configure a cluster](../installing-an-az/configuring-a-cluster.md).
- For production sizing and tuning: [Production recommendations](../../production-recommendations.md).
