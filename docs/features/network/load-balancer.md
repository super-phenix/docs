# Load Balancer

A **Load Balancer** is a Layer 3/Layer 4 (TCP/UDP) reverse proxy and traffic distributor. It exposes a dedicated **Virtual IP (VIP)** within an Availability Zone (AZ) and forwards incoming connections to pools of backend VMs or pods using **TCP**, **UDP**, or **SCTP** (protocol availability may vary by release). Listeners can reference **named ports** for clarity in larger configs.

## Virtual IP range

- The front **virtual IP** is chosen by you from **`198.18.0.0/16`** (IPv4 only at the time of writing).
- **Do not** reuse the same virtual IP on two load balancers.

A load balancer is tied to a **subnet**; routing inside the **VPC** lets **any VM in that VPC** reach the VIP when the VPC routes to the subnet that owns it. The **subnet** is inferred from **load balancer mapping** (see below).

## Mapping (backends)

**Mapping** defines where traffic is sent:

| Mode               | Behavior                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **IP backends**    | Target backends by **raw IP** (static list).                                                  |
| **Label backends** | Target VMs matching a **label selector**; backends update **dynamically** when new VMs match. |

You then define **ports** (for example **80** / **443**) for forwarding.

**Health checks** probe backends; failing members are removed. Health check **source** addresses come from the **subnet** attached to the load balancer.

!!! warning "Same subnet for all backends"

    Selector or endpoint configuration must resolve to backends on a **single subnet**. Only the **first network interface** of each VM participates in load balancing: **secondary NICs** are not used. **All VMs behind one load balancer should sit in the same subnet.**

---

## Backend Pool Strategies

### Dynamic Selector Mode (`type: Selector`)
- Discovers backends automatically using workload labels (e.g., `app=web`, `role=api`).
- When new VMs or pods are created or terminated with matching labels, the load balancer updates its backend routing table without manual reconfiguration.
- Recommended for auto-scaling workloads and microservices.

### Static Endpoint Mode (`type: Endpoint`)
- Routes traffic to an explicit list of private IPv4 addresses.
- Useful for legacy systems, fixed-IP instances, or external appliances that do not use platform workload labels.

---

## Port Rules and Protocols

Each Load Balancer supports multiple independent port mapping rules:

| Property     | Value          | Description                                              |
| :----------- | :------------- | :------------------------------------------------------- |
| `port`       | 1–65535        | Ingress listening port exposed on the VIP.               |
| `targetPort` | 1–65535        | Destination port listening on backend instances or pods. |
| `protocol`   | `TCP` \| `UDP` | Layer 4 transport protocol.                              |

### Session Affinity
When session affinity is enabled, incoming connections from the same client IP address are consistently routed to the same backend member for the duration of the affinity window.

---

## Operational Constraints

- **AZ Scoping**: The Virtual IP and its target backends must reside within the same Availability Zone.
- **Cluster Locks**: Load balancers created and managed by Kubernetes-as-a-Service (KaaS) clusters (such as Ingress controller LBs) are protected against destructive manual modifications in the console.
- **GitOps Tracking**: Load Balancers managed declaratively display synchronization status and links to their associated ArgoCD applications.
