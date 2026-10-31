# kaas-essentials

Values and chart documentation for `components/dependencies/kaas-essentials` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

Installs essential utilities in a tenant cluster (HAProxy, Cilium, Kubevirt-csi).

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://coredns.github.io/helm | coredns | 1.46.* |
| https://helm.cilium.io/ | cilium | 1.19.* |
| https://kubernetes-sigs.github.io/metrics-server | metrics-server | 3.13.* |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| cilium.cni.chainingMode | string | `"portmap"` |  |
| cilium.ipam.mode | string | `"kubernetes"` |  |
| cilium.k8s.requireIPv4PodCIDR | bool | `true` |  |
| cilium.k8sServiceHost | string | `""` |  |
| cilium.k8sServicePort | int | `7443` |  |
| cilium.kubeProxyReplacement | bool | `true` |  |
| cilium.securityContext.privileged | bool | `false` |  |
| cilium.sessionAffinity | bool | `true` |  |
| cluster | object | `{"clusterID":"","friendlyName":"","kubeVersion":"","name":""}` | Specification of the target cluster These parameters cannot be overriden by the user. |
| cluster.clusterID | string | `""` | SPXID |
| controlPlane.fqdn | string | `""` |  |
| controlPlane.network.apiServer.address | string | `"10.96.0.1"` |  |
| controlPlane.network.apiServer.konnectivityPort | int | `7442` |  |
| controlPlane.network.apiServer.port | int | `7443` |  |
| controlPlane.network.apiServer.proxyPort | int | `7444` |  |
| coredns.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchLabels.k8s-app | string | `"kube-dns"` |  |
| coredns.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.topologyKey | string | `"kubernetes.io/hostname"` |  |
| coredns.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].weight | int | `1` |  |
| coredns.deployment.name | string | `"coredns"` |  |
| coredns.k8sAppLabelOverride | string | `"kube-dns"` |  |
| coredns.replicaCount | int | `2` |  |
| coredns.rollingUpdate.maxSurge | int | `0` |  |
| coredns.rollingUpdate.maxUnavailable | int | `1` |  |
| coredns.service.clusterIP | string | `"10.96.0.10"` |  |
| coredns.service.name | string | `"kube-dns"` |  |
| kubevirtCsi.snapshotclasses | object | `{}` |  |
| kubevirtCsi.storageClasses | object | `{}` |  |
| kubevirtCsi.versions."v1.35".csiDriverVersion | string | `"latest"` |  |
| kubevirtCsi.versions."v1.35".csiLivenessprobeVersion | string | `"v2.18.0"` |  |
| kubevirtCsi.versions."v1.35".nodeDriverRegistrarVersion | string | `"v2.16.0"` |  |
| kubevirtCsi.versions."v1.35".snapshotControllerVersion | string | `"v8.5.0"` |  |
| kubevirtCsi.versions."v1.36".csiDriverVersion | string | `"latest"` |  |
| kubevirtCsi.versions."v1.36".csiLivenessprobeVersion | string | `"v2.19.0"` |  |
| kubevirtCsi.versions."v1.36".nodeDriverRegistrarVersion | string | `"v2.17.0"` |  |
| kubevirtCsi.versions."v1.36".snapshotControllerVersion | string | `"v8.6.0"` |  |
| metrics-server.apiService.create | bool | `true` |  |
| metrics-server.args[0] | string | `"--kubelet-insecure-tls=true"` |  |
| metrics-server.args[1] | string | `"--kubelet-preferred-address-types=InternalIP"` |  |
| metrics-server.fullnameOverride | string | `"metrics-server"` |  |
