# Security Group

A Security Group is a distributed, stateful Layer 3/Layer 4 virtual firewall applied at the network interface and pod level. It filters **inbound (ingress)** and **outbound (egress)** traffic for compute instances within an Availability Zone (AZ).

---

## Key Parameters

| Field                 | Type               | Description                                                                              |
| :-------------------- | :----------------- | :--------------------------------------------------------------------------------------- |
| `productName`         | string             | User-friendly display name.                                                              |
| `az`                  | string             | Target Availability Zone.                                                                |
| `subnetEIds`          | string[]           | Array of subnet IDs (up to 10) bound to this Security Group.                             |
| `podSelector`         | object             | Workload label selector (`matchLabels`, `matchExpressions`) targeting specific VMs/pods. |
| `ingressRuleTemplate` | `RuleTemplateEnum` | Template for inbound traffic: `AllowAll`, `DenyAll`, or `AllowSpecific`.                 |
| `egressRuleTemplate`  | `RuleTemplateEnum` | Template for outbound traffic: `AllowAll`, `DenyAll`, or `AllowSpecific`.                |
| `ingressRules`        | array              | Custom inbound firewall rules (evaluated when template is `AllowSpecific`).              |
| `egressRules`         | array              | Custom outbound firewall rules (evaluated when template is `AllowSpecific`).             |

---

## Targeting Workloads

Security Groups determine which workloads to protect via two mechanisms:

1. **Subnet Binding (`subnetEIds`)**: Binds the Security Group to entire subnets (up to 10 per Security Group). All compute instance interfaces connected to those subnets inherit the firewall rules.
2. **Workload Selector (`podSelector`)**: Uses Kubernetes-style label selectors to match instances or pods directly:
   - `matchLabels`: Exact key-value matching (e.g., `tier: backend`, `env: prod`).
   - `matchExpressions`: Set-based matching (`In`, `NotIn`, `Exists`, `DoesNotExist`).

---

## Rule Configuration

### Rule Templates
For both Ingress and Egress, you can apply one of three templates:
- **`AllowAll`**: Permits all traffic in this direction without restriction.
- **`DenyAll`**: Blocks all traffic in this direction.
- **`AllowSpecific`**: Enforces the list of explicit rules defined below.

### Custom Rules (`AllowSpecific`)
Each custom rule specifies:

| Property      | Value          | Description                                                                   |
| :------------ | :------------- | :---------------------------------------------------------------------------- |
| `protocol`    | `TCP` \| `UDP` | Transport layer protocol.                                                     |
| `port`        | 1–65535        | Starting port number.                                                         |
| `endPort`     | 1–65535        | Optional end port for port ranges (e.g., `8000` to `8080`).                   |
| `ipBlock`     | object         | Peer CIDR block (e.g., `10.0.0.0/16`) with optional `except` CIDR exclusions. |
| `podSelector` | object         | Peer workload label selector matching other VMs or pods in the project.       |

---

## Stateful Connection Tracking

Security Groups are stateful:
- If an incoming connection is permitted by an **ingress rule**, the corresponding return traffic is automatically allowed back out, even if an egress rule would otherwise block it.
- If an outgoing connection is permitted by an **egress rule**, response packets are automatically allowed back in.

---

## Operational Constraints

- **Subnet Limit**: A single Security Group can be bound to a maximum of 10 subnets.
- **Cluster Locks**: Security Groups provisioned by Kubernetes-as-a-Service (KaaS) clusters (`isClusterSecurityGroup: true`) are locked against manual edits or deletion in the console to prevent disrupting cluster networking.
- **GitOps Tracking**: Declaratively managed security groups display synchronization status and provide direct navigation to ArgoCD applications.

---

## Create a Security Group

For a detailed walkthrough, read the [User Guide on how to create a Security Group](../../user-guides/network/create-a-security-group.md).
