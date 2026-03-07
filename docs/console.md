# Web console

Superphenix can be operated in two main ways: **GitOps** (for operators and automation) and a **web console** (for tenants and interactive use). Both are designed to work together.

## Role of the console

- **Self-service** — Tenants create and manage VMs, networks (VPCs, subnets), and storage without editing Git or YAML by hand.
- **Visibility** — View resources, usage, and basic billing-related information.
- **Access** — Serial and VNC console access to VMs through a **proxy** that enforces permissions and logs user actions.
- **Consistency with GitOps** — Resources created in the console can be re-imported or reflected in Git; resources defined in Git appear in the console. Collision-free naming (e.g. UUIDv5 + user-defined IDs) allows both flows to coexist.

## Main features

- **VM lifecycle** — Create, start, stop, restart; attach disks and networks; use templates (e.g. from a container registry).
- **Networking** — Create VPCs and subnets; attach VMs to subnets; configure NAT and (where exposed) firewall rules.
- **Console access** — Serial console and VNC for graphical VMs (e.g. Windows), with access control and audit.
- **Projects and quotas** — Organise resources by project; enforce quotas and limits (via Kubernetes and custom policies).

## Security and multi-tenancy

- **Authentication** — Typically integrated with an IdP or Kubernetes auth (e.g. OIDC).
- **Authorization** — RBAC and project/tenant scoping so users only see and act on their resources.
- **Audit** — Logging of console access and sensitive actions for compliance and debugging.

## Relation to GitOps

- **Reconciliation** — The platform can be configured so that console-created resources are represented in Git (e.g. via controllers or export jobs), and Git-defined resources are visible and manageable in the console.
- **IDs** — Pseudo-randomised names (e.g. UUIDv5) and labels avoid collisions and allow automation (billing, monitoring) to work regardless of whether a resource was created from the UI or from Git.

For more detail, see the project’s console repository or documentation.
