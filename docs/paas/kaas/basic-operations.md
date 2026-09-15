# Basic operations

This section details the most common actions regarding Kubernetes clusters on Superphenix: **deploying, scaling, upgrading and deleting**.

## Deploying a cluster

???+ warning "Requirements"
    KaaS cluster nodes are deployed in the same VPC and subnet as any IaaS virtual machines, but their controlplane runs inside a separate VPC which means that the nodes will reach out over the world wide web to access it.
    Therefore, make sure that your subnet has internet access when creating a cluster.
    This can be achieved by creating an EIP with the SNAT option enabled and attaching it to your subnet.

To deploy a cluster through the console, follow the steps of the creation wizard.  
For a GitOps deployment, you can copy and adjust the example below based on your needs.

=== "Console"

    1. Open **PaaS → Kubernetes**.
    2. Click **Create Cluster** (top right).
    3. Under **General Information** set:
        - **Name**
        - **AZ**: must match where you want the cluster to be deployed.
        - **Cluster Version**: Kubernetes version.
    4. Optionally, you can: 
        - Enable **[Advanced configuration](advanced-configuration.md)** options.
        - Enable **[Disaster Recovery](disaster-recovery.md)**.
        - Configure the **[Cluster Network Policies](network-configuration.md)**.
    5. Under **Cluster Instance Group**, create one or more node groups, for each of them set:
        - **Number of replicas**: How many nodes should be created for this group.
        - **Cores**: Amount of vCPUs per node.
        - **RAM**: Memory quantity per node.
        - **Storage Class**: Storage type to use for the node's disks.
        - **Boot disk size**: Size of the node's disks.
    6. Under **Network Configuration**, add one or more subnets to each node group. (*Nodes need to talk to each other and should therefore share at least one common subnet between all node groups*).
    7. Click **Create** (bottom right).

=== "GitOps"

    ```yaml
    my-cluster:
      name: "my-cluster"
      location: "my-az"
      # The list of supported versions for your AZ can be found in the console's creation wizard
      kubeVersion: v1.36.3 
      workers:
        instances:
          node-group-1:
            deployment:
              replicas: 2
            template:
              version: 1
              cores: 2
              memory: 4Gi
              interfaces:
                - subnet: "<my-subnet>"
              bootDisk:
                storage: 20Gi
      kaasEssentials:
        storageClasses:
          default:
            isDefaultClass: true
            tenantClass: default
            infraClass: default
        snapshotClasses:
          default:
            tenantClass: default
            infraClass: default
    ```

    Full chart values: [sfs-kaas](https://github.com/super-phenix/superphenix/blob/main/components/dependencies/sfs-kaas/values.yaml).

???+ tip "Accessing your cluster"
    Once your cluster is ready, you can download its **kubeconfig** file from the console:

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Download kubeconfig** (top right).

## Scaling a cluster

### Horizontal scaling

Steps to add nodes to your cluster:

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Edit** (top right).
    3. Under **Cluster Instance Group** you can either:
        - Increase the **Number of replicas** field of existing node groups.
        - Create new node groups using the **Add Group** button. Refer to the [Deploying a cluster](#deploying-a-cluster) section for details.
    4. If you created new node groups, remember to assign them one or more subnets under the **Network Configuration** tab.
    5. Navigate to the last tab (**Network Configuration**) and click **Update** (bottom right).

=== "GitOps"

    1. Increase `<cluster-name>.workers.instances.<node-group>.deployment.replicas`.
    2. Commit and push the changes.
    3. Go to the your project's page on the selfservice ArgoCD and synchronize the changes.

    You can also create a new worker pool by adding its specification under `<cluster-name>.workers.instances` like in this example:
    ```yaml
    node-group-2:
      deployment:
        replicas: 2
      template:
        version: 1
        cores: 2
        memory: 4Gi
        interfaces:
          - subnet: "<my-subnet>"
        bootDisk:
          storage: 30Gi
    ```

### Vertical scaling

Steps to increase the size of nodes in an existing node group. This will trigger a rolling update for the given node groups and create new nodes with the updated specification.

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Edit** (top right).
    3. Under **Cluster Instance Group**, increase the amount of **Cores**, **RAM** or adjust the **Boot disk size** as needed for each node group.
    4. Navigate to the last tab (**Network Configuration**) and click **Update** (bottom right).

=== "GitOps"

    1. Update `<cluster-name>.workers.instances.<node-group>.template.cores`, `.memory` or `.bootDisk.storage` as desired.
    2. Increment `<cluster-name>.workers.instances.<node-group>.template.version`. This is required for the specification update to take effect.
    3. Commit and push the changes.
    4. Go to the your project's page on the selfservice ArgoCD and synchronize the changes.

    ???+ tip "Rolling update configuration"
        You can control how the rolling update process behaves by setting `<cluster-name>.workers.instances.<node-group>.template.maxSurge` and `.maxUnavailable`.

    Example:
    ```yaml
    node-group-1:
      deployment:
        replicas: 2
      template:
        version: 2 # <-- Increment to trigger node rolling update
        cores: 4
        memory: 12Gi
        interfaces:
          - subnet: "<my-subnet>"
        bootDisk:
          storage: 30Gi
    ```

## Upgrading a cluster

To upgrade your cluster, follow these steps to trigger a controlplane upgrade. Once it is done the worker VMs will undergo a rolling update.

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Edit** (top right).
    3. Under **General information**, pick a new **Cluster Version** from the list.
    4. Navigate to the last tab (**Network Configuration**) and click **Update** (bottom right).

=== "GitOps"
    1. Change `<cluster-name>.kubeVersion` to the desired version.
    2. Commit and push the changes.
    3. Go to the your project's page on the selfservice ArgoCD and synchronize the changes.

    ???+ tip "Rolling update configuration"
        You can control how the rolling update process behaves by setting `<cluster-name>.workers.instances.<node-group>.template.maxSurge` and `.maxUnavailable`.

## Deleting a cluster

To delete a cluster, procceed as described:

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Delete** (top right).
    3. In the pop-up window, double check the cluster's name and click **Confirm**.

=== "GitOps"

    1. Remove the cluster specification from your repository.
    2. Access your cluster's application page on the selfservice ArgoCD and click the **Delete** button in the top row.
    3. In the pop-up window, double check the cluster's name and click **OK**.
