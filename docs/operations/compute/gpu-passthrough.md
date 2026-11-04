# Enabling GPU passthrough

This page explains how to offer [GPUs](../../features/compute/gpu.md) to users of an AZ. It takes three steps:

1. Prepare the GPU nodes so their cards can be assigned to VMs.
2. Allow KubeVirt to hand those devices to VMs.
3. Publish **GPU classes** on the AZ controller, so users can choose them in the console.

All configuration goes under `clusters.<code>.systemConfiguration` in the values of the `superphenix-operator` release, where `<code>` is the AZ code. See [Applying configuration changes](../applying-configuration-changes.md).

## Prepare the GPU nodes

Follow steps 1 to 3 of [Talos with VM-Passthrough workloads](../../installation/deployment-guide/installing-the-os/gpu-node-installation.md#2-talos-with-vm-passthrough-workloads). They enable IOMMU, bind the GPUs to `vfio-pci` and deploy the NVIDIA GPU Operator. The next section replaces the guide's _Configure Kubevirt_ step.

## Allow the devices in KubeVirt

List each permitted device in the KubeVirt configuration. `pciVendorSelector` is the vendor and device ID of the card.

```yaml
clusters:
  paris-1:
    systemConfiguration:
      apps:
        kubevirt-config:
          values:
            config:
              configuration:
                permittedHostDevices:
                  pciHostDevices:
                    - pciVendorSelector: "10DE:2BB5"
                      resourceName: "nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION"
                      # true when an external device plugin (e.g. the NVIDIA GPU Operator)
                      # advertises the resource; false to let KubeVirt advertise it.
                      externalResourceProvider: true
```

## Publish GPU classes

A **GPU class** is the name users see. Map each class to the `resourceName` you allowed above:

```yaml
clusters:
  paris-1:
    systemConfiguration:
      apps:
        superphenix-controller:
          values:
            config:
              productsConfig:
                compute:
                  deviceMapping:
                    nvidia-rtx-pro-6000-bse:
                      deviceName: "nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION"
                      displayName: "NVIDIA RTX PRO 6000 Blackwell Server Edition"
```

| Field                           | Required | Description                                                                                                                                                             |
| :------------------------------ | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| key (`nvidia-rtx-pro-6000-bse`) | Yes      | Class identifier stored on the VMs. Use **lowercase** only: the controller lowercases map keys when it loads its configuration. Do not rename a class while VMs use it. |
| `deviceName`                    | Yes      | KubeVirt resource name. It must match a `resourceName` in `permittedHostDevices`. Classes without it are ignored and logged at startup.                                 |
| `displayName`                   | No       | Label shown in the console. Defaults to the class identifier.                                                                                                           |

The classes appear in the console as soon as the controller restarts with the new configuration. An AZ without `deviceMapping` shows no GPU option.

## CPU model of GPU VMs

Superphenix gives every VM that has a GPU the **`host-model`** CPU model, instead of the cluster-wide CPU model. It does this automatically when a GPU is added, and restores the cluster model when the GPU is removed. [superphenix#245](https://github.com/super-phenix/superphenix/issues/245) explains why this model was chosen.

This matters for GPUs with a lot of memory, such as the 96 GB RTX PRO 6000, whose largest memory region is **128 GB**:

- UEFI VMs boot with OVMF firmware, which must place that region in its 64-bit PCI memory window before the guest starts. Legacy BIOS VMs are not affected.
- OVMF needs the CPU's **1 GB pages** (`pdpe1gb`) to map a large address space. A generic cluster CPU model such as `Broadwell-noTSX-IBRS` doesn't have them, so OVMF limits itself to 40 address bits, and its window is too small for the GPU.
- Without 1 GB pages, the region is left unassigned:
  - **Windows** hangs at the UEFI boot screen once the NVIDIA driver is installed.
  - **Linux** boots, but the NVIDIA driver fails with `NVRM: BAR2 is 0M @ 0x0` and `modprobe: … No such device`.
- `host-model` gives the guest the closest named CPU model to the host's (for example `EPYC-Genoa` on AMD EPYC 9365 hosts), with the host's extra features. It has 1 GB pages, so OVMF places the region and the driver works.

KubeVirt resolves `host-model` on the node that starts the VM, so the GPU nodes of a class can have different CPUs. It only refuses nodes whose CPU model it considers obsolete.

## Operational notes

- **No live migration**: VMs with a passthrough GPU cannot be live-migrated. With the platform's `LiveMigrate` eviction strategy, KubeVirt refuses to evict them, so draining a GPU node stays blocked until they are stopped. Plan GPU node maintenance with the VM owners.
- **Memory**: a VM with a passthrough device locks all of its guest memory on the host. With the default `memoryOvercommit: 200`, the node still reserves only half of it, so the scheduler can place more of these VMs than the node's memory can hold. Size GPU nodes for the full memory of their VMs.
- **Capacity**: a VM requesting a GPU shows `ErrorUnschedulable` while no card of its class is free.
