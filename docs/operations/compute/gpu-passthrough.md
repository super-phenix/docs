# Enabling GPU passthrough

This page explains how to offer [GPUs](../../features/compute/gpu.md) to users of an AZ. It takes three steps:

1. Prepare the GPU nodes so their cards can be assigned to VMs.
2. Allow KubeVirt to hand those devices to VMs.
3. Publish **GPU classes** on the AZ controller, so users can choose them in the console.

All configuration goes under `systemConfiguration` on the `Cluster` resource of the AZ (or through the `superphenix-operator` Helm chart).

## Prepare the GPU nodes

Each GPU node must:

- Have **IOMMU** (Intel VT-d or AMD-Vi) enabled in the firmware and on the kernel command line.
- Bind the GPU to the `vfio-pci` driver, so the host does not use it.

Get the PCI vendor and device IDs of the card. You need them for the next step:

```bash
lspci -nn | grep -i nvidia
# 81:00.0 3D controller [0302]: NVIDIA Corporation ... [10de:xxxx]
```

The pair in brackets, for example `10de:xxxx`, is the vendor and device ID.

!!! tip "NVIDIA GPU Operator"
    Instead of binding cards to `vfio-pci` by hand, you can deploy the NVIDIA GPU Operator with sandbox workloads enabled. It binds the cards and runs a device plugin that exposes them as resources named like `nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION`. In that case, set `externalResourceProvider: true` in the next step.

## Allow the devices in KubeVirt

Enable the `HostDevices` feature gate and list each permitted device in the KubeVirt configuration.

```yaml
systemConfiguration:
  apps:
    kubevirt-config:
      values:
        config:
          configuration:
            permittedHostDevices:
              pciHostDevices:
                - pciVendorSelector: "10DE:XXXX"
                  resourceName: "nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION"
                  # true when an external device plugin (e.g. the NVIDIA GPU Operator)
                  # advertises the resource; false to let KubeVirt advertise it.
                  externalResourceProvider: true
            developerConfiguration:
              featureGates:
                - BlockVolume
                - ExpandDisks
                - Snapshot
                - HotplugVolumes
                - HostDevices
```

!!! warning "Keep the existing feature gates"
    Helm replaces lists instead of merging them. Your `featureGates` list replaces the default one, so it must repeat every gate already enabled on the platform, plus `HostDevices`.

## Publish GPU classes

A **GPU class** is the name users see. Map each class to the `resourceName` you allowed above:

```yaml
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

| Field | Required | Description |
| :--- | :--- | :--- |
| key (`nvidia-rtx-pro-6000-bse`) | Yes | Class identifier stored on the VMs. Use **lowercase** only: the controller lowercases map keys when it loads its configuration. Do not rename a class while VMs use it. |
| `deviceName` | Yes | KubeVirt resource name. It must match a `resourceName` in `permittedHostDevices`. Classes without it are ignored and logged at startup. |
| `displayName` | No | Label shown in the console. Defaults to the class identifier. |

The classes appear in the console as soon as the controller restarts with the new configuration. An AZ without `deviceMapping` shows no GPU option.

!!! note "GitOps deployments"
    VMs deployed with the `sfs-iaas` chart use their own `deviceMapping` value, a flat `class: deviceName` map. Use the same class identifiers in both places.

## CPU model of GPU VMs

Superphenix gives every VM that has a GPU the **`host-passthrough`** CPU model, instead of the cluster-wide CPU model. It does this automatically when a GPU is added, and restores the cluster model when the GPU is removed.

This matters for GPUs with a lot of memory, such as the 96 GB RTX PRO 6000:

- VMs boot with UEFI firmware (OVMF), which reserves a 64-bit PCI memory window sized from the CPU's **physical address width**.
- A generic cluster CPU model such as `Broadwell-noTSX-IBRS` reports a small address width. The window then stays around **32 GB**, while the GPU needs a **128 GB** region.
- Without `host-passthrough`, the region is left unassigned:
    - **Windows** hangs at the UEFI boot screen once the NVIDIA driver is installed.
    - **Linux** boots, but the NVIDIA driver fails with `NVRM: BAR2 is 0M @ 0x0` and `modprobe: … No such device`.
- With `host-passthrough`, the guest sees the host's real address width and OVMF sizes the window correctly.

`host-passthrough` prevents live migration between hosts with different CPUs. GPU VMs cannot be live-migrated anyway, so this has no extra cost.

!!! note "VMs created before this change"
    The CPU model is set when the GPU is attached. For a GPU VM created before this change, edit it to remove the GPU and save, edit it again to add the GPU back and save, then restart it. Linux guests that used the `pci=realloc,nocrs` kernel parameter as a workaround no longer need it.

## Operational notes

- **No live migration**: VMs with a passthrough GPU cannot be live-migrated. Draining a GPU node stops these VMs, and they restart on another node only if a GPU of the same class is free there. Plan GPU node maintenance with the VM owners.
- **Memory**: a VM with a passthrough device locks all of its guest memory on the host. The platform's memory overcommit therefore does not apply to these VMs. Size GPU nodes for the full memory of their VMs.
- **Capacity**: a VM requesting a GPU stays `Pending` while no card of its class is free.
