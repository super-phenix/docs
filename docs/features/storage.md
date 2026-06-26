# Storage

Superphenix **storage** products cover **disks** (block volumes for VMs) and **disk snapshots**. File and object storage may exist in the platform stack; this page reflects the **disk** workflows described in the SPX console.

## Disks

A **disk** has:

| Property | Notes |
|----------|--------|
| **Size** | Grows with **online resize** (hot resize supported; the guest may take a few minutes to see the new size). |
| **Type** | Today typically **block** storage. |
| **Attachment** | May be **attached** to a VM or **unattached**. |
| **Progress** | **Ready** when usable, or a **percentage** while the volume is being **provisioned or imaged** from a source. |

### Create a disk

1. Open the **Disks** product (under Storage).
2. Use **Create** (top right).
3. Set:
   - **Name**
   - **AZ**: must match the AZ of any VM you later attach to (a disk cannot be used cross-AZ).
   - **Size**
   - **Storage class**: for example **block** or **high-speed** (names depend on your platform).
   - **Source**: how the disk gets its initial content (see below).

Wait until the disk is **Ready** before attaching it or booting from it.

### Disk sources

Disks are used either as an **OS boot disk** or as **additional** data volumes.

#### Blank (`blank`)

Empty disk with **no** data: **not bootable** until you install an OS or copy an image onto it.

#### HTTP source (`http`)

Point to a URL that serves an **`.iso`**, **`.qcow2`**, or **`.vmdk`**. Superphenix **writes** that image onto the disk for you: a simple way to build a **bootable** OS disk.

#### Snapshot

Create a new disk from an existing **disk snapshot** (clone snapshot content to a new volume).

#### Clone

Create a new disk from another **disk** (equivalent to snapshotting the source and then using the **snapshot** source, but in one flow).

#### Registry (template)

Pull a disk image from a **container (OCI) registry**: the image is stored in registry format (Docker-compatible). This path suits **golden images** maintained as registry artifacts; see your release notes for supported image layouts.

### Resize

Disks support **resize**, including **while attached** (hot). The guest OS may need a moment, or a rescan, to recognize the new size.

## Disk snapshots

Create **disk snapshots** from a disk’s **detail** page. **Instance snapshots** also **automatically** create disk snapshots for **all** disks attached to that VM.

A disk snapshot’s detail view shows the **source disk**.

### Scheduled snapshots

You can schedule **recurring snapshots** for individual volumes using a **cron** expression (or the console’s schedule builder). Use this for backup windows without manual clicks.

### Restore a volume

Restore from a disk snapshot to **clone** a new volume or **roll back** a disk, depending on your workflow and API. Pair with [Virtualization](virtualization.md) when replacing a VM’s data volume.

See [Virtualization](virtualization.md) for attaching disks to instances and instance snapshots, and [Tenancy and console](tenancy-and-console.md) for project and AZ scope.
