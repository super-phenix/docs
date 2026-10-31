# Reference

Field-level reference for the Superphenix API and for the Helm charts that install and configure the platform.

The API is the `operator.superphenix.net/v1alpha1` group: **Cluster**, **Organization**, and **Project**. Chart values are the keys and defaults an operator sets on the platform charts and on the component charts those platforms render.

<div class="grid cards" markdown>

-   :lucide-braces:{ .lg .middle } **API**

    ---

    Custom resources for clusters, organizations, and projects.

    [:octicons-arrow-right-24: API](api/index.md)

-   :lucide-package:{ .lg .middle } **Helm charts**

    ---

    Chart values and the documentation that ships with each chart.

    [:octicons-arrow-right-24: Helm charts](helm/index.md)

</div>

For how a cluster is deployed, see [Configure a cluster](../installation/deployment-guide/installing-an-az/configuring-a-cluster.md). For what an availability zone and a project mean, see [Architecture overview](../architecture/index.md).
