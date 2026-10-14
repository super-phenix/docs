# IPv6 configuration

Superphenix supports both IPv4 and IPv6, and some of the largest Superphenix deployments are IPv6-first.

Superphenix is usually deployed in dual-stack mode with IPv6 as the preferred address family. IPv6 is used for internal communication, while IPv4 preserves connectivity to external components and services that are not available over IPv6, such as GitHub.

The first address family in the configuration is the preferred family. Superphenix uses it for internal communication across both physical and virtual networks.

!!! warning "Keep the address-family order consistent"
    Use the same IPv4/IPv6 order for the Talos pod and service subnets, the kubelet node IP ranges, the etcd advertised subnets, and the Kube-OVN network configuration. Kube-OVN master addresses must use the address family listed first.

## Running dual stack with IPv4 first

The configuration from [Getting started](../../installation/getting-started.md) places IPv4 before IPv6. Configure the Talos pod and service subnets, etcd advertised subnets, and kubelet node IP ranges in that order:

```yaml
cluster:
  network:
    podSubnets:
      - 10.0.0.0/12
      - fd00:100:0000:0::/96
    serviceSubnets:
      - 10.16.0.0/12
      - fd00:100:ffff:0::/112
  etcd:
    advertisedSubnets:
      - 192.168.1.0/24
      - fd00:1::/64

machine:
  kubelet:
    nodeIP:
      validSubnets:
        - 192.168.1.0/24
        - fd00:1::/64
```

The kubelet and etcd ranges select node addresses, so replace the example ranges with the IPv4 and IPv6 ranges of your node network.

Configure Kube-OVN with IPv4 first as well. Because IPv4 is preferred, `masterNodes` must contain the IPv4 addresses of the control-plane nodes:

```yaml
clusters:
  local:
    systemConfiguration:
      apps:
        kubeovn:
          values:
            masterNodes: "192.168.1.150,192.168.1.151,192.168.1.153"
            networking:
              pods:
                cidr:
                  v4: "10.0.0.0/12"
                  v6: "fd00:100:0000:0::/96"
                gateways:
                  v4: "10.0.0.1"
                  v6: "fd00:100:0000:0::1"
              services:
                cidr:
                  v4: "10.16.0.0/12"
                  v6: "fd00:100:ffff:0::/112"
              join:
                cidr:
                  v4: "100.64.0.0/12"
                  v6: "fd00:100:64::/112"
```

With this configuration, Superphenix prioritizes IPv4 for communication within the physical node network and virtual workload networks.

## Running dual stack with IPv6 first

To prefer IPv6, reverse the address-family order everywhere. In the Talos configuration, list IPv6 before IPv4 for the pod and service subnets, etcd advertised subnets, and kubelet node IP ranges:

```yaml
cluster:
  network:
    podSubnets:
      - fd00:100:0000:0::/96
      - 10.0.0.0/12
    serviceSubnets:
      - fd00:100:ffff:0::/112
      - 10.16.0.0/12
  etcd:
    advertisedSubnets:
      - fd00:1::/64
      - 192.168.1.0/24

machine:
  kubelet:
    nodeIP:
      validSubnets:
        - fd00:1::/64
        - 192.168.1.0/24
```

Configure the Kube-OVN ranges in the same IPv6-first order. Because IPv6 is preferred, `masterNodes` must contain the IPv6 addresses of the control-plane nodes:

```yaml
clusters:
  local:
    systemConfiguration:
      apps:
        kubeovn:
          values:
            masterNodes: "fd00:1::150,fd00:1::151,fd00:1::153"
            networking:
              pods:
                cidr:
                  v6: "fd00:100:0000:0::/96"
                  v4: "10.0.0.0/12"
                gateways:
                  v6: "fd00:100:0000:0::1"
                  v4: "10.0.0.1"
              services:
                cidr:
                  v6: "fd00:100:ffff:0::/112"
                  v4: "10.16.0.0/12"
              join:
                cidr:
                  v6: "fd00:100:64::/112"
                  v4: "100.64.0.0/12"
```

With this configuration, Superphenix prioritizes IPv6 for communication within the physical node network and virtual workload networks, while IPv4 remains available for IPv4-only destinations.

## Configure Ceph to use IPv6

On the cluster that hosts Ceph, bind the Ceph public and cluster networks to IPv6 subnets through the `rook-local-cluster` configuration:

```yaml
systemConfiguration:
  apps:
    rook-local-cluster:
      values:
        cephClusterSpec:
          network:
            addressRanges:
              public:
                - fd00:ffff:2000::/64
              cluster:
                - fd00:ffff:2001::/96
```

The `public` subnet carries Ceph client and monitor traffic. The `cluster` subnet carries replication, recovery, and other traffic between Ceph daemons. Every Ceph node must have an address in the configured IPv6 subnet or subnets.

!!! important "Connecting separate workload and storage clusters"
    For a decoupled deployment, follow [Connecting a workload and storage cluster](../storage/connecting-a-workload-and-storage-cluster.md).

    The `bootstrapMon.ip` used by the workload cluster must be an IPv6 address from the Ceph public network, and `bootstrapMon.protocol` must be set to `IPv6`. This ensures that Superphenix bootstraps the connection and retrieves the Ceph monitor list over IPv6.

    ```yaml
    bootstrapMon:
      id: a
      ip: "fd00:ffff:2000::10"
      port: "6789"
      protocol: IPv6
    ```
