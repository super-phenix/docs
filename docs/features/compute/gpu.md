# GPU

Superphenix can attach a dedicated GPU to a virtual machine with **PCI passthrough**. The guest sees the physical card as its own PCI device and loads the vendor driver, for example the NVIDIA datacenter driver. This gives native performance for AI training and inference, rendering, and CUDA workloads.

## GPU classes

Users pick a **GPU class**, such as `NVIDIA RTX PRO 6000 Blackwell Server Edition`. Each AZ publishes the classes its hardware provides, so the list in the console depends on the AZ you select.

## Behavior

- **One GPU per VM**: a VM can have at most one GPU for now.
- **Create or edit**: choose the GPU in the **Compute** step when you create the VM, or change it from **Edit**.
- **Restart required**: adding, changing or removing a GPU takes effect at the next restart. Until then, the **GPU** card on the instance details page shows _(applies after restart)_.
- **Scheduling**: the VM only starts on a node with a free GPU of the requested class. If every card of that class is in use, the VM shows `ErrorUnschedulable` until one is released.
- **No live migration**: a VM with a passthrough GPU cannot be live-migrated. It must be stopped before maintenance on its node.

!!! note "Guest drivers"
    Superphenix attaches the device but does not install drivers. Install the GPU vendor's driver inside the guest operating system, for example with cloud-init.

## Related

- [Instances](instance.md)
- [Create a virtual machine](../../user-guides/virtual-machines/create-a-vm.md)
- [Enabling GPU passthrough](../../operations/compute/gpu-passthrough.md) (operators)
