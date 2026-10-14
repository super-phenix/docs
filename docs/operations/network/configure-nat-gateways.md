# Configure NAT gateways

NAT gateways connect private Superphenix subnets to an external network. Before creating NAT gateways or Elastic IPs (EIPs), configure:

1. An external interface with the same name on every Talos node.
2. An external subnet from which Superphenix can allocate NAT gateway addresses.
3. The EIP allocation subnet and, when required, the BGP speaker settings for each availability zone (AZ).

## Configure the external interface in Talos

Every node must expose the external network through an interface with the same name. This example uses `ext0`:

```yaml
machine:
  network:
    interfaces:
      - interface: ext0
        routes:
          - network: 0.0.0.0/0
            gateway: 10.81.5.1
```

Replace the addressing and gateway with values for your external network. The interface can be a physical NIC, bond, or VLAN, but its Talos name must be identical on every node.

If physical interface names differ between nodes, add a `LinkAliasConfig` to each node's Talos configuration. Keep `name` identical and change the MAC address for each node:

```yaml
---
apiVersion: v1alpha1
kind: LinkAliasConfig
name: ext0
selector:
  match: mac(link.permanent_addr) == "00:1a:2b:3c:4d:5e"
```

Do not use kernel-style names such as `eth0`, `ens3`, or `enp0s31f6` as the common alias.

## Configure the external subnet

Define the external subnet and its network attachment in the AZ's system configuration. The network attachment must use the common Talos interface as its `master`:

```yaml
systemConfiguration:
  apps:
    misc:
      values:
        objects:
          external-subnet:
            spec:
              protocol: IPv4
              cidrBlock: 10.81.5.0/24
              gateway: 10.81.5.1
              excludeIps:
                - 10.81.5.0..10.81.5.31
                - 10.81.5.255
          external-subnet-nad:
            spec:
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
```

Exclude the network and broadcast addresses, node addresses, router addresses, and any other addresses that Superphenix must not allocate. In a BGP deployment, this subnet is only used to address the NAT gateways and their BGP speakers. A private RFC 1918 range is recommended because these addresses do not need to be public.

!!! warning "External network connectivity"
    The common interface on every node must reach the external subnet. The backbone must then learn how to reach the EIPs through either ARP or BGP.

## Choose how to announce EIPs

Superphenix can announce EIPs to the backbone using either ARP or BGP.

### ARP announcement

ARP is the default and requires no BGP configuration. Superphenix answers ARP requests for an EIP on the external network, allowing the upstream gateway to send traffic directly to the NAT gateway.

With ARP, EIPs must belong to the external Layer 2 subnet so that the upstream gateway can resolve them.

ARP is appropriate when:

- The NAT gateways and upstream gateway share the same Layer 2 network.
- You want the simplest setup with no BGP peering.
- The external broadcast domain is small enough to extend to every relevant node.

Its main limitation is that EIP reachability depends on a shared Layer 2 domain. Extending that domain across racks or network zones can increase the broadcast scope and make the network harder to scale.

### BGP announcement

BGP advertises EIP routes to one or more upstream routers. It requires an ASN, a remote ASN, and at least one reachable neighbor.

Unlike ARP, BGP does not require EIPs to belong to `external-subnet`. The external subnet provides private addresses for the NAT gateways and connectivity to their BGP neighbors, while EIPs can be allocated from a separate public prefix and advertised to the backbone.

BGP is preferable when:

- The backbone is routed and does not extend the external Layer 2 domain.
- EIP routes must be propagated beyond one subnet or network segment.
- You want explicit routing policy and better route visibility on the backbone.
- You need routing features such as multiple peers or graceful restart.

BGP requires coordination with the network team and matching peer configuration on the upstream routers, but it generally scales better across racks, network zones, and AZs.

!!! tip "Recommended BGP addressing"
    Use a private subnet, such as `10.81.5.0/24`, for NAT gateway and BGP speaker addresses. Use a separate public prefix for EIPs. The examples use `192.0.2.0/24`, which is reserved by RFC 5737 for documentation; replace it with a public prefix routed to your organization.

???+ example "Create a separate EIP subnet for BGP"
    Create the public EIP subnet in the same way as `external-subnet`. Unlike the existing `external-subnet` objects, these are new resources, so include their `apiVersion`, `kind`, and `metadata`.

    A network attachment definition (NAD) is still required, even though BGP-routed EIPs are not mounted on a host interface. Its macvlan `master` can therefore use a placeholder such as `fake`:

    ```yaml
    systemConfiguration:
      apps:
        misc:
          values:
            objects:
              192.0.2.0-24:
                apiVersion: kubeovn.io/v1
                kind: Subnet
                metadata:
                  name: 192.0.2.0-24
                spec:
                  protocol: IPv4
                  cidrBlock: 192.0.2.0/24
                  gateway: 192.0.2.1
                  excludeIps:
                    - 192.0.2.0..192.0.2.1
                    - 192.0.2.255
              192.0.2.0-24-nad:
                apiVersion: "k8s.cni.cncf.io/v1"
                kind: NetworkAttachmentDefinition
                metadata:
                  name: 192.0.2.0-24
                  namespace: kube-system
                spec:
                  config: '{
                      "cniVersion": "0.3.0",
                      "type": "macvlan",
                      "master": "fake",
                      "mode": "bridge",
                      "ipam": {
                        "type": "kube-ovn",
                        "server_socket": "/run/openvswitch/kube-ovn-daemon.sock",
                        "provider": "192.0.2.0-24.kube-system"
                      }
                    }'
    ```

    The placeholder interface is never used to carry EIP traffic. The BGP speaker advertises the EIPs, and the backbone routes their traffic to the NAT gateway through `external-subnet`.

## Configure NAT gateway defaults

Pass the EIP and NAT gateway defaults through the AZ's `systemConfiguration`, under `apps.superphenix-controller.values.config.productsConfig`. To use ARP announcements, set `eipDefault.externalSubnet` to `external-subnet` and omit `bgpSpeaker`, or leave it disabled.

For BGP, set `config.productsConfig.eipDefault.externalSubnet` to the separate IPAM subnet that contains the public EIP pool. This adjusts the controller so that it allocates EIPs from the public prefix instead of the private subnet used by the NAT gateways.

The following example assumes:

- `external-subnet` is `10.81.5.0/24` and provides private addresses to the NAT gateways.
- The upstream BGP router is `10.81.5.1`.
- The EIP subnet created above is named `192.0.2.0-24` and represents the example public prefix `192.0.2.0/24`.

```yaml
systemConfiguration:
  apps:
    superphenix-controller:
      values:
        config:
          productsConfig:
            eipDefault:
              externalSubnet: "192.0.2.0-24"
            natGatewayDefault:
              bgpSpeaker:
                enabled: true
                asn: 64892
                remoteAsn: 64890
                neighbors:
                  - 10.81.5.1
                enableGracefulRestart: true
                extraArgs:
                  - "-v5"
                  - "--graceful-restart"
```

Apply this configuration to each AZ that should advertise EIP routes. Values can differ by AZ to match the local routers and autonomous systems.

The BGP speaker accepts these settings under `config.productsConfig.natGatewayDefault.bgpSpeaker`:

- `enabled`: enables or disables BGP route advertisement.
- `asn`: the local ASN used by the AZ's NAT gateways.
- `remoteAsn`: the ASN expected from the upstream BGP peers.
- `neighbors`: one or more upstream BGP peer addresses.
- `holdTime`: the BGP hold time, expressed as a duration such as `"90s"`.
- `routerId`: the BGP router ID.
- `password`: the BGP session password. Store sensitive values through your normal secret-management process.
- `enableGracefulRestart`: enables BGP graceful restart.
- `extraArgs`: additional arguments passed to the BGP speaker.

Only `enabled` and the settings required by your network need to be specified. Coordinate the ASNs, neighbor addresses, authentication, timers, and graceful-restart behavior with the upstream router configuration.
