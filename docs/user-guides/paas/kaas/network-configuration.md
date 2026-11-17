# Network configuration

## Node subnets

Worker nodes need to talk to each other and therefore need at least one shared subnet between all node groups. You can than add more subnets to certain node groups depending on your needs.

???+ note "Internal cluster CIDRs"
    By default KaaS clusters use the following IP ranges:

    1. Pod CIDR:
        - `10.0.0.0/12`
        - `fd00:100::/96`
    2. Service CIDR:
        - `10.96.0.0/16`
        - `fd00:100:ffff::/112`
    
    To avoid issues your node's subnet CIDR should not overlap with the pod CIDR.

## Network policies

!!! info "Work in progress"
    *The cluster networkpolicies configuration is currently beeing reworked, documentation will be updated accrodingly once done.*

### Default policies

By default a KaaS cluster installation will deploy `networkPolicies` which ensure that:

- Controlplane is joinable from anywhere.
- Communication between worker nodes is allowed.
- Nodes can access the internet.
- Nodes can be accessed from anywhere.

### Customize the configuration

!!! warning "Known limitations"
    Currently this mechanism cannot be used to limit controlplane access to a specific range of public IPs.

You can control the `networkPolicies` for the controlplane and worker nodes independently:

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Edit** (top right).
    3. Under **General Information → Cluster Network Policies** you can set:
        - **Control Plane Network Policies** to either **default** or **none** (**Default** allows ingress from anywhere).
        - **Workers Network Policies** to **default**, **strict** or **none** (**Default** allows communications from and to anywhere, **Strict** limits ingress to other nodes of the same cluster).
    4. Navigate to the last tab (**Network Configuration**) and click **Update** (bottom right).

=== "GitOps"

    ```yaml
    my-cluster:
      controlPlane:
        network:
          defaultPolicies: default/none
      workers:
        network:
          defaultPolicies: default/strict/none
    ```

    Full chart values: [sfs-kaas](https://github.com/super-phenix/superphenix/blob/main/components/dependencies/sfs-kaas/values.yaml).

Disabling those `networkPolicies` allows you to define your own security groups to restrict traffic to and from the cluster.
These are the labels you can use to target the cluster components in your rules:

1. Controlplane
  ```yaml
  superphenix.net/resourceEffectiveID: <SPXID of your cluster>
  superphenix.net/workloadClass: kaas-tenant-api-server
  ```
2. Worker nodes
  ```yaml
  cluster.x-k8s.io/cluster-name: <SPXID of your cluster>
  ```
