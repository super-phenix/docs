# Compute

Superphenix Compute manages virtual machine instances and full-state instance snapshots across availability zones.

## Services

<div class="grid cards" markdown>

-   **[:material-server: Instances](instance.md)**

    ---

    Virtual machines with configurable vCPU, memory, multi-interface networking, persistent disks, and web consoles.

    [:octicons-arrow-right-24: Instances](instance.md)

-   **[:material-camera: Instance Snapshots](instance-snapshot.md)**

    ---

    Point-in-time snapshots of virtual machine configuration and attached disks for rollbacks and state capture.

    [:octicons-arrow-right-24: Instance snapshots](instance-snapshot.md)

-   **[:material-expansion-card: GPU](gpu.md)**

    ---

    Dedicated GPUs attached to virtual machines with PCI passthrough, chosen by GPU class.

    [:octicons-arrow-right-24: GPU](gpu.md)

</div>

## Core Capabilities

- **Compute Sizing**: Allocate 1 to 32 vCPUs and 1 to 64 GB RAM, with configurable CPU topology (sockets, cores, threads).
- **Multi-Interface Networking**: Attach multiple isolated L2 subnets with automatic IPAM or static IP assignment.
- **Persistent Storage**: Attach bootable root volumes, secondary block disks, CD-ROM ISOs, or OCI container disks.
- **Access and Consoles**: Connect via SSH, or use the browser-based web serial terminal and graphical VNC console.
- **GPU Passthrough**: Attach a dedicated GPU to a VM, chosen from the GPU classes available in the AZ.
- **Firmware Options**: Support for legacy BIOS, UEFI, Secure Boot, persistent EFI variables, and vTPM 2.0.
- **Cloud-Init Initialization**: Automatic user creation, SSH key injection, and custom user data execution on first boot.

---

## User Guides

Step-by-step procedures in the web console:

- **[Create a virtual machine](../../user-guides/virtual-machines/create-a-vm.md)**: Launch a VM with boot storage, cloud-init, and network configuration.
- **[Expose a VM with an Elastic IP](../../user-guides/virtual-machines/expose-with-eip.md)**: Attach a public IP and configure SSH access.
- **[Virtual machines overview](../../user-guides/virtual-machines/index.md)**: Prerequisites, default OS images, and credentials.
