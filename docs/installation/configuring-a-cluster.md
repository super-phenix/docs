# Configure a cluster

When you define a `Cluster` resource, you specify the topology, geography, and connection details. Below is an example configuration for a remote workload cluster:

```yaml
apiVersion: superphenix.net/v1alpha1
kind: Cluster
metadata:
  name: az-paris-1
  namespace: superphenix-system
spec:
  # -- Deployment and Topology
  # Defines whether the cluster is Hyperconverged or Decoupled.
  deploymentTopology: Decoupled
  
  # Specifies the cluster type (Storage or Virtualization) when deploymentTopology is Decoupled.
  type: Virtualization

  # -- Geography
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

  # -- System configuration
  version: v0.1.0
  repoURL: https://charts.superphenix.net
  chartName: superphenix-stack
  
  systemConfiguration:
    network:
      podCIDR: 10.244.0.0/16

  # -- Operations
  pauseSync: false
  manual: false
  cleanupOnDeletion: false
```

Set `connection.mode: Local` when the cluster being defined is the same Kubernetes cluster that hosts the operator (typical for management-on-AZ after bootstrap).

## Related

- [Installing an AZ](installing-an-az.md): overview of AZ installation.
- [Connecting clusters](connecting-clusters.md): decoupled storage and workload.
- [Deployment topology](../architecture/deployment-topology.md): hyperconverged vs decoupled layouts.
