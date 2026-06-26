# Tenancy and console

Superphenix separates work into **organizations** and **projects**. The **web console** is where you pick that context, manage access, and open each **product** (compute, storage, network, and more).

## Organizations and projects

### Organizations

- **Groups projects**: An organization is the top-level container for one or more **projects**.
- **Administrators**: Organization-level admins manage settings, users, IAM, and billing for that tenant.
- **Billing**: Usage and billing can be tracked at **organization** scope (exact metering depends on your deployment).

### Projects

- **Contains resources**: All IaaS objects (VMs, disks, VPCs, subnets, snapshots, etc.) belong to a **project**. This is the main workspace boundary.
- **Users and RBAC**: Projects are where **role-based access** applies: you assign **custom roles** (defined in IAM) so users can create, view, or manage resources only where allowed.
- **Billing**: Usage can also be attributed at **project** level for chargeback or internal allocation.
- **Replication (roadmap)**: **Cross-site or cross-AZ replication** for a project is planned to be coordinated at **project** level (not yet universally available in all releases).

At a glance:

| | Organization | Project |
|---|--------------|---------|
| **Purpose** | Tenant / customer boundary | Resource and access boundary |
| **Contains** | Projects, org admins, org settings | VMs, networks, disks, snapshots, … |
| **Access** | Org-wide IAM, invitations | Per-project permissions via roles |

### Isolation and networking

- Resources in **different projects** cannot talk to each other **except via the Internet** (no private peering between projects by default).
- Inside **one project**, you can attach resources to **shared networks** (VPCs and subnets). At the network level, a **project is an isolation boundary**.

### Disaster recovery

**DR (disaster recovery) is scoped to a project.** In a failover scenario, the **entire project** is switched over.

### Working context

Your user account can belong to **several organizations** and see different projects. Use the **organization** and **project** dropdowns at the top of the console to switch context. By default, new accounts get an organization named **My organization** and a project named **default**.

## Organization settings

Open **Settings** on the organization to manage structure and access. Tabs:

| Tab | Purpose |
|-----|---------|
| **General** | Organization ID, customer contacts (free-form: phone, name, address, etc.), **transfer ownership**, **delete organization** |
| **Projects** | Create, edit, delete projects; view project IDs |
| **Users** | Invite users and assign roles (roles are defined under **IAM**) |
| **IAM** | Create and edit **roles** and their permissions |

### General

- **Organization ID**: Technical identifier (useful for support and automation).
- **Contacts**: Optional fields to store how to reach the customer (any text you find useful).
- **Transfer ownership**: The organization always has a **primary owner** (super-admin). Transfer moves that ownership to another user.
- **Delete organization**: Triggers **recursive** deletion of all resources in all projects. For safety, deletion is **soft**: consuming resources are stopped and **marked** for deletion; a garbage collector **permanently** removes them after **about two days**, which gives you time to recover if the delete was a mistake.

### Projects

Create projects from this tab and read their **IDs**. Project deletion follows the **same soft-delete rules** as organization deletion.

### Users

To add someone, ask for their **invitation code** from their user profile (see [Account](#account)). You can assign **multiple roles** cumulatively; roles are maintained in **IAM**.

### IAM (roles and permissions)

IAM manages **roles**. Default roles often include **admin**, **billing**, and **developer** (exact names may vary).

Each role has:

- A **name**
- **Permissions** on two **scopes**:
  - **Organization**: Managing roles, organization settings, inviting users, etc.
  - **Project**: Create/read/update/delete **resources** inside projects (many fine-grained permissions).

Project permissions can apply to **specific projects** or **all projects** in the organization.

## Account

Your account has a name, email, and password. Open the **account** entry (top-right of the console) to:

- View and edit profile information (you may be redirected to the account management UI).
- Copy your **invitation code**: give this code to organization admins who should add you to their organization.
- **Organizations**: List organizations you belong to and create new ones.

## Products and the resource list

**Products** are the main Superphenix capabilities. They appear in the **left sidebar**. Each product corresponds to **billable or non-billable resources** for your customers, grouped by category.

### Mental model: Organization → Project → Product → AZ

Most resources are deployed in a specific **availability zone (AZ)**. Without extra configuration, **two AZs are isolated**: a VM in one AZ cannot use a disk from another, and networks in different AZs do not communicate privately. Keep **organization**, **project**, **product**, and **AZ** in mind when you create resources.

### Browsing resources

When you open a product, you see a **table** of resources:

- Columns depend on the resource type for **relevant** information.
- Rows are filtered by the **organization and project** selected at the top.
- Use **Location** to filter by **AZ**.
- Enable **automatic refresh** to poll on a timer.
- Use the **row menu** (⋮) to **edit** the resource or run **quick actions** (for example, stop a VM).

Example AZ identifiers (as of the internal SPX 101 guide): `FR01-AGC01`, `FR01-ALS01`: your deployment may use different names.

## Getting help (support)

When reporting an issue, include:

1. What went wrong (error message or unexpected behavior).
2. What you expected instead.
3. **Steps to reproduce**.
4. A **link to the resource** (use **Share** on the resource detail page).

See also [Tooling](tooling.md) for GitOps and platform operations.
