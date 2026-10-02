# Cluster toolbox

The Superphenix operator can deploy an optional toolbox on the management cluster. The toolbox provides a single shell from which administrators can access every Kubernetes cluster managed by the operator.

It includes `kubectl`, Helm, `k9s`, and common troubleshooting utilities. The operator builds an aggregated kubeconfig from the connection details of the managed `Cluster` resources and mounts it in the toolbox.

## Enable the toolbox

The toolbox is disabled by default. Enable it in the Helm values of the `superphenix-operator`:

```yaml
toolbox:
  enabled: true
```

Apply the values when installing or upgrading the operator. Confirm that the toolbox is ready:

```bash
kubectl --namespace superphenix-system \
  rollout status deployment/superphenix-toolbox
```

## Open a toolbox shell

Run:

```bash
kubectl --namespace superphenix-system exec --stdin --tty \
  deployment/superphenix-toolbox -- bash
```

The mounted kubeconfig is linked automatically to `~/.kube/config`, so the included Kubernetes tools use it without additional configuration.

List the available contexts:

```bash
kubectl config get-contexts
```

Each context is named after its Superphenix `Cluster` resource. Select a cluster and verify access:

```bash
kubectl config use-context <cluster-name>
kubectl get nodes
```

You can then use `kubectl`, Helm, or `k9s` against the selected cluster:

```bash
helm list --all-namespaces
k9s
```

## Kubeconfig updates

The operator maintains the `superphenix-toolbox-kubeconfig` Secret from the connection configuration of all managed clusters. Kubernetes refreshes the mounted Secret when the operator updates it, so the toolbox receives credential and connection changes without being redeployed.

Run `kubectl config get-contexts` again after adding, removing, or changing a managed cluster.

!!! warning "Administrative access"
    The toolbox kubeconfig contains credentials for every cluster managed by the operator. Anyone who can execute commands in the toolbox or read the `superphenix-toolbox-kubeconfig` Secret can use those credentials. Restrict pod execution and Secret access in the `superphenix-system` namespace to platform administrators.

## Troubleshooting

Check the toolbox pod and its events:

```bash
kubectl --namespace superphenix-system get pods \
  --selector app.kubernetes.io/component=toolbox
kubectl --namespace superphenix-system describe \
  deployment/superphenix-toolbox
```

Confirm that the aggregated kubeconfig exists:

```bash
kubectl --namespace superphenix-system get \
  secret/superphenix-toolbox-kubeconfig
```

If a cluster is missing, inspect its `Cluster` resource and referenced connection Secret. Only clusters with valid local or remote connection configuration are added to the aggregated kubeconfig.
