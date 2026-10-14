# Installing hyperconverged

In a **hyperconverged** AZ, **storage** and **workload** run on the same Superphenix cluster. Compute and storage share the same nodes. This is the simplest model and fits single-AZ deployments, labs, and proofs of concept.

## Prerequisites

- The [management plane is installed](../installing-management/index.md).
- Talos is installed on the AZ nodes ([Manual OS installation](../installing-the-os/manual-os-installation.md) or [Automated OS installation](../installing-the-os/automated-os-installation.md)).
- Hardware sized for **combined** Ceph and hypervisor needs. See [Hardware requirements](../../../architecture/hardware-requirements.md).

## AZ on the management cluster

When this hyperconverged AZ runs on the same Kubernetes cluster as the management plane, the operator chart key is **`local`**. The API already lists that AZ. See [The default local AZ](../installing-management/index.md#the-default-local-az). Do not add a second `clusters` entry for that same cluster.

## Install with the operator chart

Add the AZ to the operator values file you used to install management, then upgrade the release. The chart embeds the cluster settings; you do not apply a separate manifest.

```bash
OPERATOR_VERSION="$(curl -fsSL -o /dev/null -w '%{url_effective}' https://github.com/super-phenix/superphenix/releases/latest | sed 's#.*/v##')"

helm upgrade superphenix-operator \
  "oci://ghcr.io/super-phenix/charts/superphenix-operator:${OPERATOR_VERSION}" \
  --namespace superphenix-system \
  -f values.yaml
```

### Common options

These are the fields to set for a hyperconverged AZ. The key under `clusters` becomes the AZ code.

```yaml
clusters:
  local: # "local" only when the AZ runs on the management cluster
    deploymentTopology: Hyperconverged
    region: europe-west
    availabilityZone: paris-1
    # Optional. Empty inherits the operator's system chart version.
    version: v0.1.0
    connection:
      # Local: the operator installs the AZ on its own cluster.
      mode: Local
    lifecycle:
      # Set true to hold autosync until Kube-OVN and storage are healthy.
      manual: false
    systemConfiguration:
      apps:
        kubeovn:
          values:
            # Comma-separated IPs of the control-plane nodes.
            masterNodes: "192.168.1.10,192.168.1.11,192.168.1.12"
        misc:
          values:
            objects:
              external-subnet:
                spec:
                  protocol: IPv4
                  cidrBlock: 192.168.1.0/24
                  gateway: 192.168.1.254
                  excludeIps:
                    - 192.168.1.0..192.168.1.200
                    - 192.168.1.254
              external-subnet-nad:
                spec:
                  config: '{
                      "cniVersion": "0.3.0",
                      "type": "macvlan",
                      "master": "ext0",
                      "mode": "bridge",
                      "ipam": {
                        "type": "kube-ovn",
                        "server_socket": "/run/openvswitch/kube-ovn-daemon.sock",
                        "provider": "external-subnet.kube-system"
                      }
                    }'
```

| Option | Purpose |
|--------|---------|
| `deploymentTopology: Hyperconverged` | Storage and workloads on this cluster. |
| `region`, `availabilityZone` | Geography stored on the cluster. |
| `connection.mode` | `Local` on the management cluster. `Remote` on any other cluster, with `url` and `credentials` (or `secretRef`). |
| `version` | Superphenix version for this AZ. |
| `lifecycle.manual` | Holds GitOps sync until you turn it off. |
| `apps.kubeovn.values.masterNodes` | Control-plane IPs for Kube-OVN. |
| `apps.misc.values.objects` | External subnet and the interface (`master`) used by NAT gateways and Elastic IPs. |

For an AZ on another cluster, use a key other than `local` and point the connection at that cluster:

```yaml
clusters:
  paris-1:
    deploymentTopology: Hyperconverged
    region: europe-west
    availabilityZone: paris-1
    connection:
      mode: Remote
      url: https://192.168.2.10:6443
      credentials:
        caData: ""
        certData: ""
        keyData: ""
```

After the stack is installed, register that AZ with the console. The `local` entry is already registered. Every other AZ needs an API and controller entry: [Add an availability zone](../../../operations/adding-an-az.md).

The full field list is in [Configure a cluster](configuring-a-cluster.md) and the [operator chart values](https://github.com/super-phenix/superphenix/blob/main/components/system/superphenix-operator/values.yaml).

## Related

- [Accessing Superphenix](../../../operations/accessing-superphenix.md): open the console and monitor the deployment in ArgoCD.
- [Installing an AZ](index.md): overview of AZ installation paths.
- [Deployment topology](../../../architecture/deployment-topology.md): fully integrated vs other deployment types.
