# Getting started

Start with a small but production-shaped deployment. This guide targets a **single AZ** in **hyperconverged mode** using the **minimal hardware profile (3 nodes)**.

In a normal installation flow, the **deployment topology for the AZ must be chosen before cluster creation**. In practice, this means deciding the AZ model (for example, hyperconverged vs decoupled) before applying the `Cluster` resource.

Before installation, review architecture planning documents so topology and infrastructure constraints are clear up front:

- [Architecture overview](../architecture.md)
- [Deployment topology](../architecture/deployment-topology.md)
- [Hardware requirements](../architecture/deployment-requirements.md)
- [Network requirements](../architecture/network-requirements.md)

For complete and advanced deployment paths (all installation modes and operating patterns), see [Full installations guide](full-installations.md).

For production-oriented configuration and performance guidance, see [Production recommendations](production-recommendations.md).

## Reference lab setup

Use this baseline for a first deployment:

- **Topology**: Single AZ, hyperconverged
- **Nodes**: 3 nodes (minimal specs)
- **Network**: Flat VLAN on a single switch

## Installation flow

!!! warning "Official support scope"
    Superphenix can technically run on any conformant Kubernetes cluster, but we **officially support Talos**. Current default values and operational assumptions are tuned for Talos-based clusters.

1. **Install Talos on the 3 nodes and bootstrap Kubernetes**

   For the fastest 3-node bootstrap path, follow the Talos getting-started flow:

   - Generate cluster config:
     `talosctl gen config spx-local https://<api-endpoint>:6443`
   - Apply machine configs to each node:
     `talosctl apply-config --insecure --nodes <node-ip> --file controlplane.yaml`
   - Bootstrap etcd once from one control-plane node:
     `talosctl bootstrap --nodes <first-control-plane-ip>`

   Official references:

   - [Talos Getting Started](https://talos.dev/v1.11/introduction/getting-started)
   - [talosctl CLI reference](https://www.talos.dev/latest/reference/cli/)

2. **Install the `superphenix-operator` Helm chart**

   ```bash
   helm upgrade --install superphenix-operator \
     ghcr.io/super-phenix/charts/superphenix-operator \
     --namespace superphenix-system \
     --create-namespace
   ```

3. **Create the cluster CRD for the AZ topology selected above**

```yaml
apiVersion: operator.superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: cluster-local
  namespace: spx
spec:
  deploymentTopology: Hyperconverged
  region: us-west-2
  availabilityZone: us-west-2a
  version: 0.0.0-latest
  connection:
    mode: Local
  systemConfiguration:
    apps:
```
