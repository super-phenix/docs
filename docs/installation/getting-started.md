# Getting started

This guide will walk you through the steps to install a lab using the simplest layout: **3 nodes**, one AZ, **hyperconverged**, management on the same cluster, one switch / flat VLAN.

Run every command from a **bootstrap host** that can reach the nodes (typically a laptop on that switch).

## Prerequisites

- **talosctl** ([CLI reference](https://www.talos.dev/latest/reference/cli/)), **Helm** ([install](https://helm.sh/docs/intro/install/)), **kubectl**, and **curl**
- **Talos 1.12.6 or older** — newer versions hit a Linux kernel bug that breaks the SDN. Superphenix is **only officially supported on Talos**.
- An **IPv4 range on the network behind the external interface**. Superphenix picks addresses from that subnet at random and assigns them to **NAT gateways** and **elastic IPs**. If the subnet is shared with node addresses or other devices, those IPs can be excluded from the IPAM. Ideally, reserve the whole range (or a dedicated part of it) for Superphenix.
- A **domain name** for the console. The cluster serves HTTP(S) on **every node** on ports **80** and **443**, so DNS only needs to point at **one** node. For HA, use a load balancer or DNS round-robin.

    !!! tip "No DNS?"
        Use **[nip.io](https://nip.io)** against an internal node IP, for example `console.192.168.1.10.nip.io`.

    !!! warning "NAT gateway traffic to a node"
        Due to a macvlan limitation, traffic from a NAT gateway is blackholed when its destination is an address on the node hosting that gateway. VMs and Kubernetes as a Service clusters can therefore lose access to the console or control plane when DNS points directly to a node. Put a load balancer in front of the nodes and point DNS to the load balancer. See [Limitations](../operations/limitations.md#nat-gateway-traffic-to-its-host-node) for details and an alternative workaround.

## 1. Install Talos

Boot the nodes with the [Talos getting started](https://talos.dev/v1.11/introduction/getting-started) guide, then generate configs:

```bash
talosctl gen config spx-local https://<api-endpoint>:6443
```

Edit `controlplane.yaml` **before** you apply it. Superphenix installs the CNI and CoreDNS itself; this 3-node lab also schedules workloads on the control planes. Control planes must enable **MutatingAdmissionPolicy**. Replace the interface name, gateway, and `192.168.1.0/24` subnets with your lab network.

???+ example "controlplane.yaml"

    ```yaml
    cluster:
      allowSchedulingOnControlPlanes: true
      network:
        cni:
          name: none
        podSubnets:
          - 10.0.0.0/12
          - fd00:100:0000:0::/96
        serviceSubnets:
          - 10.16.0.0/12
          - fd00:100:ffff:0::/112
      coreDNS:
        disabled: true
      controllerManager:
        extraArgs:
          feature-gates: "MutatingAdmissionPolicy=true"
          node-cidr-mask-size-ipv6: "112"
      apiServer:
        extraArgs:
          feature-gates: "MutatingAdmissionPolicy=true"
          runtime-config: "admissionregistration.k8s.io/v1beta1=true"
      etcd:
        advertisedSubnets:
          - 192.168.1.0/24 # Change this with your lab network

    machine:
      files:
        - content: |
            [plugins]
              [plugins."io.containerd.grpc.v1.cri"]
                device_ownership_from_security_context = true
              [plugins."io.containerd.cri.v1.runtime"]
                device_ownership_from_security_context = true
          path: /etc/cri/conf.d/20-customization.part
          op: create
      kernel:
        modules:
          - name: openvswitch
      kubelet:
        nodeIP:
          validSubnets:
            - 192.168.1.0/24 # Change this with your lab network
      network:
        interfaces:
          - interface: ext0 # Same name on every node (NIC, bond, or VLAN)
            dhcp: true # Ensure DHCP always gives the same addresses to your nodes, or configure static addresses.
            routes:
              - network: 0.0.0.0/0
                gateway: 192.168.1.254 # Your lab default gateway
    ```


???+ warning "Same external interface name on every node"
    The **external** interface must have the **same name on every node** (`ext0` here). Superphenix uses that name cluster-wide. If kernel names differ, append a `LinkAliasConfig` per node (physical NICs only; name bonds and VLANs yourself). Keep `name: ext0` identical; change only the MAC:

    ```yaml
    ---
    apiVersion: v1alpha1
    kind: LinkAliasConfig
    name: ext0
    selector:
      match: mac(link.permanent_addr) == "00:1a:2b:3c:4d:5e" # this node's NIC MAC
    ```

    Do not use kernel-style alias names (`eth0`, `ens3`, `enp0s31f6`, …).

Apply, bootstrap once, then confirm nodes are up:

```bash
talosctl apply-config --insecure --nodes <node-ip> --file controlplane.yaml
talosctl bootstrap --nodes <first-control-plane-ip>
talosctl kubeconfig .
kubectl get nodes
```

## 2. Install Superphenix

Create `values.yaml`. Replace domains, node IPs, the external subnet, and `ext0`.

```yaml
# Required until Superphenix has installed Kube-OVN. Set back to false after the stack is healthy.
installOnClusterWithoutCNI: true

config:
  argocd:
    values:
      server:
        ingress:
          hostname: "argocd.example.org" # or argocd.192.168.1.10.nip.io

management:
  systemConfiguration:
    apps:
      kratos:
        values:
          globalSecret: "a-very-long-string-you-need-to-change"
      superphenix-console:
        values:
          domain: console.example.org # or console.192.168.1.10.nip.io

clusters:
  local:
    deploymentTopology: Hyperconverged
    region: lab
    availabilityZone: lab-a
    connection:
      mode: Local
    systemConfiguration:
      apps:
        misc:
          values:
            objects:
              # Replace the CIDR, gateway and the IPs excluded from
              # being used by the NAT gateways and elastic IPs.
              external-subnet:
                spec:
                  protocol: IPv4
                  cidrBlock: 192.168.1.0/24
                  gateway: 192.168.1.254
                  # Those are the IPs you want excluded from the Superphenix IPAM
                  # You can set individual IPs, or ranges using the ".." separator
                  excludeIps:
                    - 192.168.1.0..192.168.1.200
                    - 192.168.1.254
              external-subnet-nad:
                spec:
                  # Replace ext0 with the external interface 
                  # name common to all your nodes
                  config: '{
                      "cniVersion": "0.3.0",
                      "type": "macvlan",
                      "master": "ext0",
                      "mode": "bridge",
                      "ipam": {
                        "type": "kube-ovn",
                        "server_socket": "/run/openvswitch/kube-ovn-daemon.sock",
                        "provider": "external-subnet.kube-system"
                      }
                    }'
        kubeovn:
          values:
            # Replace with the IPs of your 3 masters here
            masterNodes: "192.168.1.150,192.168.1.151,192.168.1.153"
```

!!! warning "Local storage for debugging only"
    If slow disks perform poorly with Ceph, you can use the `local-path` storage class to avoid network-storage overhead. Data is tied to one node and is lost if that node or disk is lost, so workloads cannot move freely between nodes. See [Using local storage](../operations/storage/using-local-storage.md).

Install the **superphenix-operator** on the Talos cluster using Helm:
```bash
OPERATOR_VERSION="$(curl -fsSL -o /dev/null -w '%{url_effective}' https://github.com/super-phenix/superphenix/releases/latest | sed 's#.*/v##')"

helm install superphenix-operator \
  "oci://ghcr.io/super-phenix/charts/superphenix-operator:${OPERATOR_VERSION}" \
  --namespace superphenix-system \
  --create-namespace \
  -f values.yaml
```

When the stack is healthy, continue with [Accessing Superphenix](../operations/accessing-superphenix.md) to open the console, retrieve the initial ArgoCD password, and monitor application synchronization.

???+ note "Override Kube-OVN CIDRs"
    If your **node subnet overlaps** Kube-OVN defaults (pods `10.0.0.0/12`, services `10.16.0.0/12`, join `100.64.0.0/12`, isolated egress `10.32.0.0/16`), pick a different  node range or override `clusters.local.systemConfiguration.apps.kubeovn.values.networking`. A `192.168.1.0/24` lab does not conflict.

    Example when nodes are on `10.1.0.0/24` (inside the default pod range `10.0.0.0/12`):

    ```yaml
    clusters:
      local:
        systemConfiguration:
          apps:
            kubeovn:
              values:
                masterNodes: "10.1.0.11,10.1.0.12,10.1.0.13"
                networking:
                  pods:
                    cidr:
                      v4: "10.128.0.0/12"
                      v6: "fd00:200:0000:0::/96"
                    gateways:
                      v4: "10.128.0.1"
                      v6: "fd00:200:0000:0::1"
                  services:
                    cidr:
                      v4: "10.144.0.0/12"
                      v6: "fd00:200:ffff:0::/112"
                  join:
                    cidr:
                      v4: "100.64.0.0/12"
                      v6: "fd00:200:64::/112"
    ```

Full chart values: [superphenix-operator](https://github.com/super-phenix/superphenix/blob/main/components/system/superphenix-operator/values.yaml), [superphenix-system](https://github.com/super-phenix/superphenix/blob/main/components/system/superphenix-system/values.yaml).

For other topologies and production sizing, see the [Deployment guide](deployment-guide/index.md) and [Production recommendations](production-recommendations.md).
