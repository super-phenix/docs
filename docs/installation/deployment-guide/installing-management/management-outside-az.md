# Installing outside an AZ

Install the management plane on a dedicated Kubernetes cluster, separate from every workload availability zone. One operator on that cluster installs and operates every AZ.

Where the management plane should run, and how that choice interacts with hyperconverged and decoupled AZs, is covered in [Deployment topology](../../../architecture/deployment-topology.md#management-plane).

## Before you start

Provide a Kubernetes cluster that will host only the management plane. From the bootstrap host:

- `kubectl` uses a kubeconfig for that cluster.
- **Helm** is installed ([install Helm](https://helm.sh/docs/intro/install/)).
- The cluster is Kubernetes **v1.28+**. It can be Talos, another distribution, or a cluster hosted on another cloud.
- The cluster can reach the **Kubernetes API** of every Superphenix AZ it will manage.
- A default **StorageClass** and an **ingress controller** are already running. PostgreSQL, the console, and ArgoCD use them, and the management components do not install Rook or Traefik.
- A CNI to operate the network of the cluster

## 1. Prepare the operator values

Create a `values.yaml` for the `superphenix-operator` chart. Copy the management settings from [Configuring the management stack](full-configuration.md): console domain, Kratos secret, PostgreSQL password, and ArgoCD hostname.

## 2. Install the operator

```bash
OPERATOR_VERSION="$(curl -fsSL -o /dev/null -w '%{url_effective}' https://github.com/super-phenix/superphenix/releases/latest | sed 's#.*/v##')"

helm upgrade --install superphenix-operator \
  "oci://ghcr.io/super-phenix/charts/superphenix-operator:${OPERATOR_VERSION}" \
  --namespace superphenix-system \
  --create-namespace \
  -f values.yaml
```

The chart creates a `Cluster` named `management`. The operator then installs the [superphenix-system](https://github.com/super-phenix/superphenix/tree/main/components/system/superphenix-system) management components on this cluster: the web console, API, Kratos, Permify, and PostgreSQL, together with ArgoCD. Optional components stay disabled unless you enable them in the configuration file.

Confirm the operator is up:

```bash
kubectl --namespace superphenix-system get pods
kubectl --namespace superphenix-system get clusters.operator.superphenix.net
```

The `management` cluster should be listed. PostgreSQL binds a volume from the default storage class on this cluster.

## Console availability

!!! warning "Provide storage and ingress on this cluster"
    PostgreSQL and the console's HTTP routes use a storage class and an ingress controller that you run on the management cluster. Workload AZs do not provide them.

    - **Storage, for the database.** PostgreSQL requests a persistent volume (8Gi by default) from the default storage class. Until that volume is bound, the API, Kratos, and Permify cannot start.
    - **Ingress, for HTTP.** The console, API, Kratos, and ArgoCD are HTTP routes. Your ingress controller must serve the console domain and the ArgoCD hostname, including ports **80** and **443** if you terminate TLS the way a Superphenix AZ does with Traefik.

    The console can be opened once those two are healthy. It does not wait for a workload AZ.

## Next steps

1. [Manual OS installation](../installing-the-os/manual-os-installation.md) or [Automated OS installation](../installing-the-os/automated-os-installation.md) on the workload clusters.
2. [Installing an AZ](../installing-an-az/index.md). Register each AZ with `connection.mode: Remote`.
3. [Accessing Superphenix](../../../operations/accessing-superphenix.md): open the console, retrieve the initial ArgoCD password, and follow synchronization.
