# Getting started

Start with a small but production-shaped deployment. This guide targets a **single AZ** in **hyperconverged mode** using the **minimal hardware profile (3 nodes)**.

Before installation, review architecture planning documents so topology and infrastructure constraints are clear up front:

- [Architecture overview](architecture.md)
- [Deployment topology](architecture/deployment-topology.md)
- [Hardware requirements](architecture/deployment-requirements.md)
- [Network requirements](architecture/network-requirements.md)

For complete and advanced deployment paths (all installation modes and operating patterns), see [Full installations guide](installation/full-installations.md).

## Reference lab setup

Use this baseline for a first deployment:

- **Topology**: Single AZ, hyperconverged
- **Nodes**: 3 nodes (minimal specs)
- **Network**: Flat VLAN on a single switch

## Installation flow

1. **Install the operating system on the 3 nodes**  
   _Placeholder: add OS installation steps here._
2. **Install the `superphenix-operator`**
3. **Create the cluster CRD**

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
