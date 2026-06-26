# Full installations guide

This page will document all supported Superphenix installation modes and detailed runbooks.

Superphenix supports two installation modes:

- **Hyperconverged**: Storage and virtualization run on the same cluster.
- **Decoupled**: Storage and virtualization run on separate clusters.

In Decoupled mode, you can have two types of clusters:

- **Storage cluster**: Dedicated to storage (Ceph, Rook, etc.)
- **Virtualization cluster**: Dedicated to virtualization (KubeVirt, etc.)

## Cluster configuration

When you define a `Cluster` resource in Superphenix, you can configure several fields in the `spec`.

### Deployment and Topology

- **deploymentTopology**: Defines whether the cluster is `Hyperconverged` or `Decoupled`.
- **type**: Specifies the cluster type (`Storage` or `Virtualization`) when `deploymentTopology` is `Decoupled`.

### Geography

- **region**: The geographic region where this cluster is located.
- **availabilityZone**: The availability zone identifier within the region.

### Software and Chart

- **version**: The Superphenix version for this cluster.
- **repoURL**: The URL of the repository where the Superphenix system chart is located.
- **chartName**: The name of the Superphenix system chart.
- **systemConfiguration**: A YAML dictionary of values passed to the system configuration chart.

### Connection

- **connection**: Defines how the operator connects to the cluster.
    - **mode**: Specifies the connection mode (`Remote` or `Local`).
    - **url**: The address of the remote cluster API server (required for `Remote` mode).
    - **secretRef**: A reference to a secret containing connection credentials (required for `Remote` mode).
        - **name**: Name of the secret.
        - **namespace**: Namespace of the secret.

### Operations

- **pauseSync**: Allows to temporarily pause the synchronization of the Superphenix stack on this cluster.
- **manual**: Disables the autosync of all applications on this cluster.
- **cleanupOnDeletion**: Allows the cleanup of the cluster when it gets deleted.

## Prerequisites

- A Kubernetes cluster (v1.28+)
- Helm (v3.12+)
- ArgoCD (v2.10+)

## Installation steps

Coming soon.
