# Advanced configuration

To accommodate for more specific needs, KaaS clusters support a range of additionnal configuration options.

## Essential cluster components

You can override the default configuration of the following components of your cluster:

- CoreDNS
- CNI: Cilium
- Metrics server

The default configuration can be found here: [kaas-essentials](https://github.com/super-phenix/superphenix/blob/main/components/dependencies/kaas-essentials/values.yaml)

Here is how you can achieve this:

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Edit** (top right).
    3. Under **Advanced Configuration → Cluster Essentials Customization**, click on **Edit config** for the given component and write the configuration overrides in the pop-up window. Expected input are values from the component's Helm chart in YAML format.

    For example, to change the amount of CoreDNS replicas you would write:
    ```yaml
    replicaCount: 1
    ```
 
=== "GitOps"

    1. Add your custom Helm values under `<cluster-name>.kaasEssentials.values.<coredns/cilium/metrics-server>`.

    For example, to change the amount of CoreDNS replicas you would have:
    ```yaml
    my-cluster:
      kaasEssentials:
        values:
          coredns:
            replicaCount: 1
    ```

    Full chart values: [sfs-kaas](https://github.com/super-phenix/superphenix/blob/main/components/dependencies/sfs-kaas/values.yaml).

## Post-installation Helm chart

You can further automate the setup process of your cluster by pointing to a custom Helm chart which will be applied to the cluster during the installation.

To accomplish this follow these steps:

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Edit** (top right).
    3. Under **Advanced Configuration**, enable the **Post Installation Chart** toggle
    4. Fill out the information about the desired chart:
        - **Chart Name**
        - **Chart Version**
        - **Namespace**: target namespace where the chart should be applied.
        - **Repository URL**: Source reposistory to pull the chart from.
    3. Click on **Helm Chart Values → Edit values** and write the configuration overrides for you chart.

=== "GitOps"

    1. Add deployment specification about your chart under `<cluster-name>.postInstallChart`:
        - **chartName**
        - **chartVersion**
        - **namespace**: target namespace where the chart should be applied.
        - **repoUrl**: Source reposistory to pull the chart from.
        - **revision**: Counter that needs to be increased to trigger the re-apply of the chart.
        
    Example for the Traefik ingress and gatewayAPI controller:
    ```yaml
    my-cluster:
      postInstallChart:
        chartName: traefik
        chartVersion: 39.0.2
        repoUrl: https://traefik.github.io/charts
        revision: 1
        values:
          # add your values here
    ```

    Full chart values: [sfs-kaas](https://github.com/super-phenix/superphenix/blob/main/components/dependencies/sfs-kaas/values.yaml).

For example, this feature can be leveraged to automatically enroll the cluster to an ArgoCD instance. A custom chart deploys a job that sets up the service account,
ArgoCD connection and git repository. To assist in such endeavours, KaaS clusters contain a configmap which presents details about the cluster.

This configmap is called `spx-cluster-info` and can be found in the `kube-system` namespace. It provides the following information under a `cluster` key:

- **clusterID**: The unique SPXID of the cluster.
- **friendlyName**: User-defined, human-readable name.
- **kubeVersion**: Kubernetes release version.
- **name**: Name of the cluster, used to generate its ID. Either UUIDv4 for console deployment or same as *friendlyName* for GitOps clusters.
- **organizationID**: SPXID of the organization.
- **projectID**: SPXID of the project.
- **location**: AZ in which the cluster is deployed.

You can also find those values here: [kaas-essentials](https://github.com/super-phenix/superphenix/blob/main/components/dependencies/kaas-essentials/values.yaml).
