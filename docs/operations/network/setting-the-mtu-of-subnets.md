# Setting the MTU of subnets

The maximum transmission unit (MTU) controls the largest packet that a network interface can send without fragmentation. A consistent MTU across the complete path improves efficiency by carrying more data in each frame and reducing per-packet processing. It also allows Path MTU Discovery (PMTUD) to select a packet size that every hop can forward.

An incorrect MTU can cause fragmentation, reduce performance, or create a PMTU black hole when the ICMP messages required by PMTUD are filtered.

!!! tip "Recommended platform MTU: 9000"
    Configure an MTU of **9000** end to end on the platform links and network fabric. Jumbo frames improve throughput and reduce CPU overhead, particularly for storage and east-west traffic.

## Automatic MTU detection

The Superphenix software-defined network uses GENEVE encapsulation. Superphenix reserves **100 bytes** for the overlay overhead, so the MTU presented to VMs and containers is the platform MTU minus 100 bytes.

For example, a node MTU of `9000` results in an MTU of `8900` inside VMs and containers.

Automatic MTU detection is enabled by default. It currently detects the link MTU (used to egress from the node) but does **not** cap the detected value at `1500` for Internet-bound traffic. A maximum-MTU cap is planned for a future release. Until then, explicitly configure `1500` for Internet-facing subnets when the platform link MTU is greater than `1600`. If you do not, you risk fragmentation and blackholes for traffic heading to the Internet.

## Configure the MTU of user-created subnets

It is possible to set a specific MTU for **subnets** created within an AZ.

If you wish to force the MTU, disable `mtuAutodetection` on the controller of the AZ. Then, set your desired MTU:

```yaml
systemConfiguration:
  apps:
    superphenix-controller:
      values:
        config:
          productsConfig:
            subnets:
              mtuAutodetection: false
              mtu: 9000
```

Use a value supported end to end by every physical link, VLAN, bond, and switch port in the path.

!!! warning "Internet-facing workloads"
    Internet paths generally support an MTU of `1500`. When the platform links use an MTU greater than `1600`, pods and VMs can send packets larger than the Internet path supports after accounting for the 100-byte GENEVE overhead. This can cause fragmentation or PMTU black holes.

    For subnets whose pods or VMs access the Internet, force **`config.productsConfig.subnets.mtu` to `1500`**.
