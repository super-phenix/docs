# Tooling

Superphenix is operated through **GitOps** and a **web console**. Together they let you deploy, upgrade, and manage the whole platform and all availability zones from a single place.

## What you get

- **GitOps** — The stack and tenant resources are defined in Git and applied automatically. Deploy or update an entire AZ (or many AZs) from charts and manifests. Changes are tracked, reviewable, and rollbackable. Full AZ deployment in a short time on real or virtualized hardware.
- **Web console** — Multi-tenant console to create and manage VMs, networks, and storage across multiple AZs. Access serial and VNC consoles through a proxy with permissions and audit logging. View usage and billing-related information. Resources created in the console can be reflected in Git, and resources defined in Git appear in the console.
- **Observability** — Metrics and logs for the whole platform: VMs, storage, and network. Dashboards for health and capacity. Usage data for billing and planning.
- **Security and quotas** — Admission rules and quotas (CPU, memory, storage) per tenant or namespace. RBAC for API and console access. Firewall and network policies for tenant isolation.
- **Testing** — Run the full stack in virtualized or physical labs. Test changes in branches and promote via merge requests. Optional chaos engineering to simulate failures.
- **OS and cluster lifecycle** — Immutable OS and cluster lifecycle driven by configuration and GitOps, so the platform is declarative from the OS up.

## Central administration

GitOps and the console provide a **single control plane** over all AZs: one Git repo (or hierarchy) and one console to deploy, configure, and operate the platform. Each AZ remains an independent cluster for isolation and resilience.

See [Architecture](../architecture.md) for AZs, regions, and central administration, and [Testing](../testing.md) for the testing approach.
