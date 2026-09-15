# Elastic IP (EIP)

An **Elastic IP (EIP)** is a static, publicly routable IPv4 or IPv6 address allocated from an external network pool. It maps **public** addresses to **private** addresses in your subnet, providing public internet ingress and egress for private compute instances without coupling the public address to any specific VM.

It requires a **NAT gateway** on the subnet where you expose workloads. That NAT gateway handles traffic toward your private instances.

---

## Operating Modes

An Elastic IP operates in one of three NAT modes:

### Floating IP (FIP) — 1:1 NAT
- Maps the public IP directly to a single private IP (`internalIP`) in a local subnet.
- Bidirectional: Inbound packets targeting the public IP are translated to the private IP; outbound packets from the private IP present the public IP as their source.
- Best for single-instance public services (e.g., VPN gateways, reverse proxies, bastion hosts).

### Source NAT (SNAT) — Outbound Masquerading
- Associates the public IP with one or more internal CIDRs (`internalCIDR` / `snat`).
- Outbound-only: Instances in the specified CIDRs share this public IP to communicate with external internet services.
- Inbound connections initiated from the internet are not forwarded to private instances.

### Destination NAT (DNAT) — Port Forwarding
- Forwards specific external ports to internal private endpoints using configurable rules:

| Rule Property  | Description                                        |
| :------------- | :------------------------------------------------- |
| `externalPort` | Listening port on the public Elastic IP (1–65535). |
| `protocol`     | `TCP` or `UDP`.                                    |
| `internalIP`   | Private destination IP in the local subnet.        |
| `internalPort` | Destination port on the target instance (1–65535). |

Multiple DNAT rules can share the same Elastic IP, allowing different ports to route to different internal VMs.

---

## Quality of Service (QoS)

Attaching a `qosPolicy` applies rate-limiting to the Elastic IP. This enforces bandwidth ceilings (Mbps/Gbps) and burst tolerances on inbound and outbound traffic to prevent bandwidth exhaustion.

---

## Operational Details

- **IP Retention**: Detaching an Elastic IP from an instance does not release the IP address. The address remains reserved in your project until explicitly deleted.
- **Failover**: An Elastic IP can be detached from one instance and reattached to another in seconds, providing rapid service recovery without public DNS propagation delays.
- **GitOps Tracking**: EIPs managed via GitOps manifests display reconciliation state and links to ArgoCD applications.

---

## Create and attach an EIP

For a detailed walkthrough, read the [User Guide on how to expose a VM with an EIP](../../docs/user-guides/virtual-machines/expose-with-eip.md).
