# Instance

An **Instance** is a virtual machine running within a selected Availability Zone (AZ). Instances run on KubeVirt virtualization infrastructure, providing dedicated vCPU, memory, persistent block storage, and private network interfaces.

---

## Provisioning and User Guides

Instances can be provisioned through the Superphenix web console, the API, or GitOps.

For step-by-step console workflows, refer to the user guides:

- **[Create a virtual machine](../../user-guides/virtual-machines/create-a-vm.md)**: Sizing vCPU/RAM, provisioning boot storage, injecting SSH keys, and configuring subnets.
- **[Expose a VM with an Elastic IP](../../user-guides/virtual-machines/expose-with-eip.md)**: Assigning an Elastic IP (EIP) and connecting over SSH.
- **[Virtual machines overview](../../user-guides/virtual-machines/index.md)**: Default images, cloud-init credentials, and prerequisites.

---

## Run Strategies

The **Run Strategy** controls the power state and restart policy of the virtual machine:

| Run Strategy         | Description                                                                                                             | Typical Use                           |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| **`Always`**         | Keeps the instance running. If the guest stops or crashes, the platform restarts it automatically.                      | Production services, databases.       |
| **`Manual`**         | Power state is controlled manually. The instance starts only on explicit start commands and remains off when shut down. | Development, staging, maintenance.    |
| **`RerunOnFailure`** | Restarts the instance if the guest process exits with an error or crashes.                                              | Batch jobs, processing pipelines.     |
| **`Once`**           | Starts the instance once and does not restart it upon termination, even on failure.                                     | Single-run tasks, migration jobs.     |
| **`Halted`**         | Keeps the instance powered off until the strategy is changed.                                                           | Decommissioned or archived instances. |

---

## Compute Sizing and CPU Topology

- **vCPU**: 1, 2, 4, 8, 16, or 32 virtual cores.
- **RAM**: 1, 2, 4, 8, 16, 32, or 64 GB.
- **CPU Topology**: By default, cores are allocated as single-threaded virtual sockets. In advanced settings, you can define explicit socket, core, and thread counts to optimize guest NUMA or multithreading behavior.

---

## Storage and Media

Instances support persistent disks, removable media, and container disks:

- **Root and Secondary Disks**: Persistent block storage volumes (Disks) located in the same Availability Zone.
- **CD-ROM**: Mounts an ISO image for manual OS installation or rescue utilities.
- **Container Disks**: Mounts an immutable root filesystem directly from an OCI container registry.

### Storage Bus Options

| Bus Interface | Description                                                                      | Compatibility                                                    |
| :------------ | :------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **`virtio`**  | Paravirtualized driver with direct hypervisor I/O. Delivers maximum performance. | Modern Linux distributions and Windows with VirtIO drivers.      |
| **`sata`**    | Emulated Serial ATA controller.                                                  | Legacy operating systems or rescue media lacking VirtIO drivers. |
| **`auto`**    | Platform selects the bus interface automatically based on guest OS type.         | Default configuration.                                           |

!!! warning "Detaching Disks"
Stop the virtual machine before detaching persistent disks to avoid guest filesystem corruption and ensure write caches are flushed.

---

## Networking

Instances connect to private virtual networks through project subnets:

- **Subnet Attachments**: Connect an instance to one or more project subnets. Each attachment generates an interface (`eth0`, `eth1`, etc.).
  - **Primary Interface**: The first interface (`eth0`) is the primary interface (marked with a star in the console). Disabling it requires confirmation to prevent accidental loss of connectivity.
- **IP Assignment**:
  - **Automatic (IPAM)**: An available IP address is leased dynamically from the subnet CIDR.
  - **Static IP**: Assign a specific IPv4 or IPv6 address within the subnet range.
- **Static MAC Address**: Assign a custom MAC address using colon notation (`52:54:00:12:34:56`). Hyphen-separated formats (`52-54-00-12-34-56`) are rejected.
- **Interface Model**:
  - **`virtio`** (default): Paravirtualized driver offering the best performance. Supported natively by Linux and via VirtIO drivers on Windows.
  - **`e1000`**: Emulated Intel Gigabit controller for older operating systems lacking VirtIO support.
- **Link State**:
  - **Desired State**: Administrative state (`Up` or `Down`) set in the instance specification.
  - **Carrier State**: Operational link status reported by the hypervisor and guest (`Link Up`, `Link Down`, or `Instance stopped`).
    You can toggle an interface's link state in the console using the link button.
- **Public Access**: Associate an Elastic IP (EIP) with the instance's private IP to route inbound and outbound Internet traffic. See [Expose a VM with an Elastic IP](../../user-guides/virtual-machines/expose-with-eip.md).

---

## Cloud-Init and SSH Keys

Instances can be initialized at first boot via **cloud-init**:

- **Default Configuration**: Creates a default `spx` user with `sudo` permissions, generates a random initial password, injects selected project SSH keys, and configures default DNS resolvers.
- **Custom User Data**: Pass custom `#cloud-config` scripts to install packages, configure services, run commands, or create users.
- **SSH Key Injection**: Public keys stored in the project SSH key catalog are written to `~/.ssh/authorized_keys` for the default user during initialization.

---

## Firmware and Security

Advanced hardware and boot settings include:

- **Bootloader**: Select legacy BIOS or UEFI. UEFI is required for modern operating systems and GPT boot partitions.
- **Secure Boot**: Enforces signature checks on bootloaders and kernel binaries (requires UEFI).
- **Persistent EFI**: Preserves NVRAM variables across instance reboots, maintaining boot order and custom EFI keys.
- **vTPM 2.0**: Provides a virtual Trusted Platform Module for cryptographic storage, BitLocker support on Windows, and guest attestation.

---

## Connecting to an Instance

### SSH

Connect using the default user and an authorized SSH key:

```bash
ssh spx@<instance-ip>
```

If an SSH key was not configured, retrieve the generated one-time password from the **Storage** > **UserData** view on the instance details page.

### Browser Consoles

When network connectivity is unavailable or during early boot:

- **Serial Console**: Interactive text terminal accessible from **Options** > **Serial**.
- **VNC Console**: Graphical console accessible from **Options** > **Console**, including a virtual keyboard for combinations such as `Ctrl+Alt+Delete`.

---

## Guest Agent (`qemu-guest-agent`)

Installing `qemu-guest-agent` inside the guest operating system (`apt install qemu-guest-agent` on Debian/Ubuntu) enables:

- Accurate reporting of guest IP addresses in the web console.
- Guest memory and resource utilization metrics.
- Filesystem freezing (`fsfreeze`) during instance snapshots to ensure consistent backups.

---

## Power Operations

Power actions available on the instance details page:

- **Start**: Powers on a stopped or halted instance.
- **Shutdown (ACPI)**: Sends an ACPI shutdown signal to the guest OS for a clean shutdown.
- **Force Shutdown**: Immediately cuts power to the virtual machine. Use when the guest OS is unresponsive.
- **Restart**: Signals the operating system to perform a reboot.
