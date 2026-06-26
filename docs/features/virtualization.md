# Virtualization

Superphenix exposes **compute** as **instances** (VMs) and **instance snapshots**. The console lists them under **Compute** (exact labels may vary slightly per release).

## Instances (VMs)

An instance is always created in:

- One **availability zone (AZ)**: pick the location where the VM should run.
- One or more **networks**: L2 subnets with a defined IP range (see [Network](network.md)).

Resource **names do not need to be globally unique**; identify resources by ID when automating.

### Day-2 management

After creation you can change many aspects of a running VM from the console or GitOps:

| Area | Capabilities |
|------|----------------|
| **Identity** | Change **hostname**. |
| **Run strategy** | Policies such as **start on create**, **always run** / **auto-restart** on failure, or **manual** start—exact options depend on your release. |
| **CPU / memory** | Resize compute **hot** or with a short restart, per platform policy. |
| **Network interfaces** | Add interfaces **one per subnet** (each NIC sits on a single subnet). Per interface: **static** IP, **DHCP / IPAM**-allocated address, **IPv4**, **IPv6**, or **dual stack** as the subnet allows. |
| **Volumes** | Attach/detach **disks**, attach **CD-ROM** (ISO) devices, and **cloud-init** configuration disks where supported. |
| **Access** | Inject **SSH keys** (via [SSH key store](tooling.md)), edit **cloud-init** user data, open **serial** or **VNC** console. |
| **Mobility** | **Live migration** between hypervisor nodes (where the scheduler and storage policy allow). |

### Create an instance

1. Open **Compute → Instances** (or equivalent).
2. Click **Create instance** (top right).
3. Set:
   - **Name**
   - **AZ**: must match where you want the VM and any disks you attach.
   - **Run strategy**: whether the VM **starts automatically** or stays stopped until you start it.
   - **CPU and memory**: size of the VM.

### Cloud-init

**Cloud-init** can provision the guest OS at first boot (users, passwords, packages), **if the image supports it**.

Superphenix can generate a **default** cloud-init configuration that:

- Creates a user **`spx`** with a **random password**
- Configures **DNS**

You can **replace** the default with your own **cloud-init** YAML for full control.

### Disks

Use **Add disk** to attach volumes that already exist in the **same AZ**, or **create a new disk** inline (see [Storage](storage.md)). Only disks in that AZ are listed.

### SSH keys

If you added keys to the **SSH key** product, you can attach them at VM creation. When the image supports cloud-init, keys are **injected automatically** at boot.

### Networks

Attach the VM to **one or more** L2 networks (subnets). Each subnet has an IP range.

- **Static IP**: set it explicitly if required.
- **No static IP**: **IPAM** allocates an address from the subnet CIDR (see [Network](network.md)).

## Start, stop, and access

Depending on **run strategy**, the VM may start automatically after creation.

- From the instance **Details** view, use the control next to **Options** to **start** or **stop** the VM.

### Access methods

| Method | When to use |
|--------|----------------|
| **SSH** | After you configure networking and expose the VM (for example via an Elastic IP) if you need access from the Internet |
| **Serial console** | Text-only emergency access; **not supported by all images** |
| **VNC** | Graphical access (Windows, Linux desktop) |

The **Details** page shows the effective configuration (CPU, RAM, networks, disks, etc.).

## Instance snapshots

Create a snapshot from the instance **Options** menu. An instance snapshot captures:

- **VM definition**: CPU, RAM, attached disks, etc.
- **Disk data**: contents of attached volumes

### Restore

Open **Instance snapshots**, select a snapshot, and use **Restore**. If the VM still exists, restore **overwrites** it.

### Child disk snapshots

Creating an instance snapshot also creates **child resources**: **disk snapshots** for each attached volume. You can inspect those disk snapshots from the instance snapshot detail view.

### Scheduled volume snapshots

Individual **disk** snapshots can be scheduled on a **cron**-style timetable so backups happen automatically without manual action. Configure schedules on the disk or snapshot policy UI (or equivalent GitOps fields) for your release.

## Restores

| Restore type | What it does |
|--------------|----------------|
| **Restore a VM** | From an **instance snapshot**; overwrites the existing VM if it still exists. See [Instance snapshots](#instance-snapshots). |
| **Restore a volume** | From a **disk snapshot** to a new or existing disk—see [Storage](storage.md). |

## Related views on the instance

- **Storage**: Cloud-init configuration and attached disks.
- **Network**: Subnets attached to the VM and assigned **IP addresses**.
- **Instance snapshots**: List of snapshots for this VM and restore actions.

See [Storage](storage.md) for disks and disk snapshots, [Network](network.md) for VPCs, subnets, and public access, and [Tenancy and console](tenancy-and-console.md) for project and AZ context.
