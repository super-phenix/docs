# Automated tuning

Superphenix ships a [TuneD](https://tuned-project.org/)-based daemon that applies performance-oriented settings at **runtime**. Enable it from the system configuration:

```yaml
systemConfiguration:
  apps:
    tuned:
      enabled: true
```

A privileged DaemonSet runs on every node (including control-plane nodes). At startup, each pod reads a **per-node label** to choose the active profile, runs `tuned`, and reloads if the default profile changes. If the node has no label, it uses the default profile which optimizes for **throughput**, **compute latency**, and **network latency**.

## Per-node profile selection

Assign a profile with the node label (default key: `performance.superphenix.net/profile`):

```bash
kubectl label node <node-name> performance.superphenix.net/profile=latency-performance
```

Remove the label to revert to the default:

```bash
kubectl label node <node-name> performance.superphenix.net/profile-
```

The label value must match a profile name defined in chart values (or already present on the node image).

!!! note "Restart required after label changes"
    Updating the profile label on a node does **not** cause the running tuned pod to pick up the new value. **Restart the tuned DaemonSet pod on that node manually** so it reads the label again at startup.

## Custom profiles

Declare additional or replacement profiles under the `profiles` key in the tuned chart values. Each key is a profile name; the value is the raw `tuned.conf` content:

```yaml
profiles:
  my-custom-profile: |
    [main]
    summary=My custom tuning profile

    [cpu]
    governor=performance

    [sysctl]
    vm.swappiness=10
```

Profile names must be unique, start with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores. Use custom profiles when you need workload-specific sysctl, CPU, or network tuning beyond the defaults.

Boot-time kernel parameters, such as C-state limits, are set with [Manual tuning](manual-tuning.md).
