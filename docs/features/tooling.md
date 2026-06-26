# Tooling

Superphenix is operated through **GitOps** and a **multi-tenant web console**. Tenant-facing features (instances, disks, networks, SSH keys) are grouped as **products** in the sidebar; platform teams use GitOps to install and upgrade the stack itself.

## How resources are configured

You can manage almost all tenant resources in two ways:

| Channel | Typical use |
|---------|-------------|
| **Web console** | Interactive creation, edits, day-2 operations (snapshots, attach NICs, firewall tweaks). |
| **GitOps** | Declarative source of truth, review via merge requests, promotion across environments, drift correction. |

The same objects (VMs, disks, networks, policies) are represented in the API and in Git; pick the workflow that fits your team. See [Tenancy and console](tenancy-and-console.md) for org/project context.

## GitOps

- Declarative manifests and charts define **clusters**, **AZs**, and often **tenant resources**.
- Changes are **reviewed**, **versioned**, and **rolled back** like application code.
- The same workflow can manage **one AZ** or **many AZs** from a single repository (or a structured set of repos).

See [Architecture overview](../architecture.md) for how administration spans regions and AZs.

## Web console

The console is where users:

- Pick **organization** and **project** (see [Tenancy and console](tenancy-and-console.md)).
- Open **products**: Compute, Storage, Network, SSH keys, and (when enabled) PaaS/SaaS.
- Filter resources by **availability zone** and use **auto-refresh** timers on list views.
- Open **resource details**, **share links** for support, and run **quick actions** from row menus.

## SSH key store

The **SSH keys** product is a **key repository** you maintain for your organization. When you create a **VM**, you can attach keys from this store so cloud-init (or equivalent) can install them on first boot; see [Virtualization](virtualization.md).

**Typical workflow**

1. Import or paste a public key in **SSH keys** (name it for easy reference).
2. When creating an instance, **select** one or more stored keys.
3. Ensure the image supports cloud-init if you rely on automatic injection.

Illustrative manifest (names vary by API):

```yaml
apiVersion: compute.superphenix.example/v1alpha1
kind: SSHPublicKey
metadata:
  name: ops-team-default
spec:
  publicKey: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...
```

## Observability

Metrics, logs, and dashboards cover **platform health** and **tenant usage** (capacity, quotas, billing-related signals). Exact integrations depend on your deployment.

## Security and quotas

- **RBAC** ties console and API access to **IAM roles** (organization vs project scopes).
- **Quotas** limit CPU, memory, storage, and counts of resources per tenant or project.

## Testing and lifecycle

Platform teams often validate changes in **lab AZs** before promoting Git revisions. **Immutable** OS images (for example **Talos** on the management or workload plane) keep node configuration reproducible; see [Getting started](../installation/getting-started.md) for the operator install path.

See [Testing](../testing.md) for project testing practices and [Tenancy and console](tenancy-and-console.md) for support information to include when opening tickets.
