# Auto-creating resources for users on project creation

When default resources are enabled, creating a project also creates a VPC and a subnet in every availability zone that organization can see. The **default** project created for a new account at first sign-in goes through the same path. Turn the flag off when tenants should start from an empty project.

The objects are the console **VPC** and **Subnet**. What those objects do is described in [VPC](../../features/network/vpc.md) and [Subnet](../../features/network/subnet.md).

## Enable or disable

The system chart sets `enableProjectDefaultResources` to `true`. Add the override and [upgrade the release](../applying-configuration-changes.md#apply-a-change):

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            userSettings:
              enableProjectDefaultResources: false
```

The flag is read when a project is created. Projects that already have a default VPC and subnet keep them. Projects created while the flag is off stay empty.

## What gets created

For each availability zone returned for that organization, the API creates:

| Object | Name | Source |
|--------|------|--------|
| VPC | `default` | `productsConfig.defaultVpc.productName` |
| Subnet | `default` | `productsConfig.defaultSubnet.productName` |

The subnet is created inside that VPC.

The API defaults for the subnet, used when the system chart does not override them:

| Field | Default | Effect |
|-------|---------|--------|
| `protocol` | `Dual` | IPv4 and IPv6 |
| `ipv4` | `10.10.0.0/16` | IPv4 CIDR |
| `ipv6` | `fd00:10:10::/64` | IPv6 CIDR |
| `natGatewayEnabled` | `false` | No NAT gateway on the default subnet |
| `private` | `false` | The subnet stays reachable from other subnets in the VPC. `true` isolates it. See [Subnet](../../features/network/subnet.md#nat-gateway-and-fully-private-subnets). |
| `dnsV4` | `1.1.1.1` | IPv4 resolver |
| `dnsV6` | `2606:4700:4700::1111` | IPv6 resolver |

Override any of these under `config.productsConfig` in the same API values. Later projects use the new template. Existing default subnets are left as they were created.

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            productsConfig:
              defaultVpc:
                productName: default
              defaultSubnet:
                productName: default
                protocol: Dual
                ipv4: 10.20.0.0/16
                ipv6: fd00:10:20::/64
                natGatewayEnabled: false
                private: false
                dnsV4: 1.1.1.1
                dnsV6: 2606:4700:4700::1111
```

Two projects in the same availability zone each receive their own `default` VPC and subnet. The names match. The underlying networks are separate.