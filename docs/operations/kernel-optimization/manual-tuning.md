# Manual tuning

Optimizations at this layer are configured where [Talos Linux](https://talos.dev/) runs your nodes. The Talos guide [Performance tuning](https://docs.siderolabs.com/talos/v1.13/configure-your-talos-cluster/system-configuration/performance-tuning) is a good starting point for CPU scaling governors, processor sleep states, and related kernel command-line parameters.

Typical changes include `cpufreq.default_governor=performance` and limits on C-states (for example `intel_idle.max_cstate=0` on Intel, or `amd_pstate=active` on AMD). See the Talos guide for your hardware.

!!! warning "Reboot required"
    Kernel parameters applied through Talos machine configuration (for example `.machine.install.extraKernelArgs`) take effect after a node **reboot** or a no-op upgrade to the same Talos version. Plan a maintenance window when tuning production nodes this way.

These settings are static. To change profiles at runtime, use [Automated tuning](automated-tuning.md).
