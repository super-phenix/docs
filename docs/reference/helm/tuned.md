# tuned

Values and chart documentation for `components/dependencies/tuned` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

Deploys the tuned daemon as a DaemonSet on every node. Profiles are provided via a ConfigMap and the active profile is selected per-node through a configurable node label.

## How it works

The chart deploys a privileged DaemonSet that runs on every node in the cluster (including control-plane nodes). At startup, each pod:

1. Reads the profiles provided via the `profiles` ConfigMap and installs them into `/etc/tuned/`.
2. Queries the Kubernetes API to read the profile label on its own node.
3. Calls `tuned-adm profile <name>` to activate the selected profile.
4. Starts the `tuned` daemon in the foreground so the profile stays active.

If the node has no profile label, the daemon falls back to `tuned.defaultProfile`.

## Selecting a profile per node

Profiles are selected through a Kubernetes node label. The label key is controlled by `tuned.profileLabelKey` (default: `performance.superphenix.net/profile`).

To assign a profile to a node:

```bash
kubectl label node <node-name> performance.superphenix.net/profile=latency-performance
```

!!! note
    The label value **must** match one of the profile names defined in `.Values.profiles` or a profile already present on the node image.
    If the label is absent or the value does not match any installed profile, the pod falls back to the default profile.

To remove an explicit profile assignment and revert to the default:

```bash
kubectl label node <node-name> performance.superphenix.net/profile-
```

## Configuring profiles

Profiles are declared under the `profiles` key. Each key becomes a profile name; the value is the raw content of `tuned.conf` for that profile.

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

!!! warning
    Profile names **must** be unique within the `profiles` map.
    If two entries share the same name, only one will be installed and the result is undefined.

!!! note
    Profile names **must** begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores.

---

## Values

<h3>Image</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>image.pullPolicy</td>
			<td>string</td>
			<td><pre lang="json">
"IfNotPresent"
</pre>
</td>
			<td>Image pull policy.</td>
		</tr>
		<tr>
			<td>image.repository</td>
			<td>string</td>
			<td><pre lang="json">
"ghcr.io/super-phenix/tuned"
</pre>
</td>
			<td>Container image repository for the tuned daemon.</td>
		</tr>
		<tr>
			<td>image.tag</td>
			<td>string</td>
			<td><pre lang="json">
"latest"
</pre>
</td>
			<td>Container image tag.</td>
		</tr>
	</tbody>
</table>
<h3>Scheduling</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>priorityClassName</td>
			<td>string</td>
			<td><pre lang="json">
"system-node-critical"
</pre>
</td>
			<td>Priority class for the DaemonSet pods. Ensures the tuned pods are not evicted under node pressure.</td>
		</tr>
		<tr>
			<td>tolerations</td>
			<td>list</td>
			<td><pre lang="json">
[
  {
    "effect": "NoSchedule",
    "operator": "Exists"
  },
  {
    "effect": "NoExecute",
    "operator": "Exists"
  },
  {
    "key": "CriticalAddonsOnly",
    "operator": "Exists"
  }
]
</pre>
</td>
			<td>Tolerations applied to the DaemonSet pods. Defaults tolerate all taints so the daemon runs on every node, including tainted control-plane and infra nodes.</td>
		</tr>
	</tbody>
</table>
<h3>Profiles</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>profiles</td>
			<td>string</td>
			<td><pre lang="json">
null
</pre>
</td>
			<td>Additional tuned profiles provided as a ConfigMap. Each key becomes a profile name; the value is the content of `tuned.conf` for that profile. Those profiles are complementing the default tuned profiles. See https://tuned-project.org/docs/manual.html#tuned-profiles_getting-started-with-tuned</td>
		</tr>
	</tbody>
</table>
<h3>Resources</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>resources.limits.cpu</td>
			<td>string</td>
			<td><pre lang="json">
"100m"
</pre>
</td>
			<td>CPU limit for the tuned container</td>
		</tr>
		<tr>
			<td>resources.limits.memory</td>
			<td>string</td>
			<td><pre lang="json">
"64Mi"
</pre>
</td>
			<td>Memory limit for the tuned container</td>
		</tr>
		<tr>
			<td>resources.requests.cpu</td>
			<td>string</td>
			<td><pre lang="json">
"10m"
</pre>
</td>
			<td>CPU request for the tuned container</td>
		</tr>
		<tr>
			<td>resources.requests.memory</td>
			<td>string</td>
			<td><pre lang="json">
"8Mi"
</pre>
</td>
			<td>Memory request for the tuned container</td>
		</tr>
	</tbody>
</table>
<h3>Service Account</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>serviceAccount.annotations</td>
			<td>object</td>
			<td><pre lang="json">
{}
</pre>
</td>
			<td>Annotations to add to the ServiceAccount</td>
		</tr>
		<tr>
			<td>serviceAccount.create</td>
			<td>bool</td>
			<td><pre lang="json">
true
</pre>
</td>
			<td>Create a ServiceAccount for the DaemonSet pods</td>
		</tr>
		<tr>
			<td>serviceAccount.name</td>
			<td>string</td>
			<td><pre lang="json">
""
</pre>
</td>
			<td>Override the ServiceAccount name. Defaults to the chart fullname when empty.</td>
		</tr>
	</tbody>
</table>
<h3>Tuned configuration</h3>
<table>
	<thead>
		<th>Key</th>
		<th>Type</th>
		<th>Default</th>
		<th>Description</th>
	</thead>
	<tbody>
		<tr>
			<td>tuned.defaultProfile</td>
			<td>string</td>
			<td><pre lang="json">
"throughput-performance latency-performance network-latency"
</pre>
</td>
			<td>Profile applied when the node has no profile label. Profiles can be separated by spaces to aggregate them into a single profile.</td>
		</tr>
		<tr>
			<td>tuned.profileLabelKey</td>
			<td>string</td>
			<td><pre lang="json">
"performance.superphenix.net/profile"
</pre>
</td>
			<td>Node label key whose value determines the active tuned profile. Example: `kubectl label node <node> performance.superphenix.net/profile=latency-performance`</td>
		</tr>
	</tbody>
</table>
