# Installing inside an AZ

Install the management plane on a cluster whose operating system is already in place. The operator, web console, and GitOps components run on the same Kubernetes cluster as one of your availability zones.

Where the management plane should run, and how that choice interacts with hyperconverged and decoupled AZs, is covered in [Deployment topology](../../../architecture/deployment-topology.md#management-plane). Cluster, AZ, and region concepts are in the [Architecture overview](../../../architecture/index.md).

Part of the [deployment guide](../index.md). The other placement is [Installing outside an AZ](management-outside-az.md). Settings for the console, identity, database, and Argo CD are in [Configuring the management stack](full-configuration.md).

## Before you start

Finish [Manual OS installation](../installing-the-os/manual-os-installation.md) on the cluster that will host management. From the bootstrap host:

- `kubectl` uses the kubeconfig from that guide (`talosctl kubeconfig`).
- **Helm** is installed ([install Helm](https://helm.sh/docs/intro/install/)).
- Talos was generated with `cluster.network.cni.name: none`. Nodes stay `NotReady` until the local AZ installs Kube-OVN. That state is expected until you finish [Installing an AZ](../installing-an-az/index.md).

## 1. Prepare the operator values

Create a `values.yaml` for the `superphenix-operator` chart. Copy the management settings from [Configuring the management stack](full-configuration.md): console domain, Kratos secret, PostgreSQL password, and Argo CD hostname.

This cluster has no CNI yet, so the operator and its Argo CD instance must schedule on `NotReady` nodes and use the host network. Set:

```yaml
# Required until the local AZ has installed Kube-OVN.
# Set back to false after that AZ is healthy.
installOnClusterWithoutCNI: true
```

While the local AZ is still absent, you can hold GitOps synchronization of the management applications by setting `management.lifecycle.manual: true` in the same file. Set it back to `false` once storage and ingress from that AZ are healthy. The field is described in [Configuring the management stack](full-configuration.md#operator-lifecycle).

## 2. Install the operator

```bash
OPERATOR_VERSION="$(curl -fsSL -o /dev/null -w '%{url_effective}' https://github.com/super-phenix/superphenix/releases/latest | sed 's#.*/v##')"

helm upgrade --install superphenix-operator \
  "oci://ghcr.io/super-phenix/charts/superphenix-operator:${OPERATOR_VERSION}" \
  --namespace superphenix-system \
  --create-namespace \
  -f values.yaml
```

The chart creates a `Cluster` named `management` (`type: Management`, `connection.mode: Local`). The operator then installs the [superphenix-system](https://github.com/super-phenix/superphenix/tree/main/components/system/superphenix-system) management components on this cluster: the web console, API, Kratos, Permify, and PostgreSQL, together with Argo CD. Optional components stay disabled unless you enable them in the configuration file.

Confirm the operator is up:

```bash
kubectl --namespace superphenix-system get pods
kubectl --namespace superphenix-system get clusters.operator.superphenix.net
```

The `management` cluster should be listed. PostgreSQL stays pending until a storage class exists, which is described in the next section.

## Console availability

!!! warning "The console stays unavailable until the local AZ is installed"
    PostgreSQL and the console's HTTP routes depend on storage and ingress from the local AZ. Those are installed by the AZ stack in the same [superphenix-system](https://github.com/super-phenix/superphenix/tree/main/components/system/superphenix-system) chart, when you install this cluster as an AZ:

    - **Storage, for the database.** PostgreSQL requests a persistent volume (8Gi by default). Rook creates the default storage class when the local AZ is installed (`spx-rbd-3x` on a hyperconverged AZ). Until that class exists, the database volume stays pending, and the API, Kratos, and Permify cannot start.
    - **Ingress, for HTTP.** The console, API, and Kratos are HTTP routes. Traefik serves ports **80** and **443** on every node and is installed with the AZ (hyperconverged, workload, or storage). Until Traefik is running, nothing answers on the console domain.

    Open the console only after that AZ is installed and healthy. Argo CD's UI uses the same ingress.

## Next steps

1. [Installing an AZ](../installing-an-az/index.md) on this cluster. Register it with `connection.mode: Local` ([Installing hyperconverged](../installing-an-az/installing-hyperconverged.md) or [Installing decoupled](../installing-an-az/installing-decoupled.md)).
2. When Kube-OVN is healthy, set `installOnClusterWithoutCNI` back to `false` (and `management.lifecycle.manual` back to `false` if you enabled it) and run the Helm command again with the same values file.
3. [Accessing Superphenix](../../../operations/accessing-superphenix.md): open the console, retrieve the initial Argo CD password, and follow synchronization.
