# Accessing Superphenix

After Superphenix is deployed, use the web console for day-to-day resource management, ArgoCD to monitor the platform deployment, and the cluster toolbox for `kubectl`, Helm, and `k9s` on every managed cluster.

!!! info "Administration UI in development"
    We are working on a dedicated administration UI. Until it is available, use Argo CD and `kubectl`/`k9s` from the [cluster toolbox](#use-the-cluster-toolbox) to monitor and troubleshoot the platform.

You need:

- Network access to the console and ArgoCD hostnames configured during installation.
- A working `kubectl` context for the management cluster, to retrieve the initial ArgoCD password and to open the cluster toolbox.

## Open the web console

Open the URL configured for the Superphenix console, for example:

```text
https://console.example.org
```

The URL redirects you to the console login page. By default, self-service registration is enabled: anyone who can reach the page can create an account and sign in. [Validating users manually](management/validating-users.md) holds new accounts until an administrator activates them.

!!! warning "Secure public deployments"
    Restrict network access to the console if you do not want to allow public registration. Mail, second factors, and super-admins are covered in [Sending emails](management/sending-emails.md), [MFA and recovery](management/mfa-and-recovery.md), and [Setting super-admins](management/super-admins.md).

After signing in, use the console to create and manage tenant resources such as virtual machines, networks, and storage.

## Open ArgoCD

Open the ArgoCD hostname configured during installation, for example:

```text
https://argocd.example.org
```

Sign in with the username `admin`. Retrieve the generated initial password from the management cluster:

```bash
kubectl --namespace superphenix-system get secret argocd-initial-admin-secret \
  --output jsonpath='{.data.password}' | base64 --decode
echo
```

!!! note
    If ArgoCD was installed in a different namespace, replace `argocd` in the command with that namespace.

Change the initial password after your first login.

## Use the cluster toolbox

The Superphenix operator can deploy an optional toolbox on the management cluster. The toolbox is a single shell from which administrators access every Kubernetes cluster managed by the operator.

It includes `kubectl`, Helm, `k9s`, and common troubleshooting utilities. The operator builds an aggregated kubeconfig from the connection details of the managed `Cluster` resources and mounts it in the toolbox.

### Enable the toolbox

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

### Open a toolbox shell

From the management cluster, run:

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

### Kubeconfig updates

The operator maintains the `superphenix-toolbox-kubeconfig` Secret from the connection configuration of all managed clusters. Kubernetes refreshes the mounted Secret when the operator updates it, so the toolbox receives credential and connection changes without being redeployed.

Run `kubectl config get-contexts` again after adding, removing, or changing a managed cluster.

!!! warning "Administrative access"
    The toolbox kubeconfig contains credentials for every cluster managed by the operator. Anyone who can execute commands in the toolbox or read the `superphenix-toolbox-kubeconfig` Secret can use those credentials. Restrict pod execution and Secret access in the `superphenix-system` namespace to platform administrators.

### Check the toolbox

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

## Monitor deployment and synchronization

ArgoCD is the primary place to follow Superphenix deployment activity. The applications shown there represent the platform components managed through GitOps.

Use ArgoCD to:

- Check whether applications are **Synced** or **OutOfSync**.
- Check whether applications and their resources are **Healthy**, **Progressing**, **Degraded**, or **Missing**.
- Inspect synchronization history and failed sync operations.
- View the Kubernetes resources that belong to an application and the events reported for them.

All application deployments and synchronizations are performed through ArgoCD. Avoid making persistent manual changes to resources managed by ArgoCD, because a later synchronization can overwrite them.

## Troubleshoot a deployment

Start with ArgoCD when an application does not deploy or synchronize:

1. Open the affected application.
2. Check its synchronization and health status.
3. Open failed or unhealthy resources.
4. Review the synchronization result, resource events, and reported errors.

Then inspect the corresponding resources directly on the cluster:

```bash
kubectl get pods --all-namespaces
kubectl describe <resource-type> <resource-name> --namespace <namespace>
kubectl logs <pod-name> --namespace <namespace>
```

For remote managed clusters, run these commands from the [cluster toolbox](#use-the-cluster-toolbox) on the management cluster.

For multi-container pods, add `--container <container-name>` to the logs command. The resource status, events, and container logs usually show whether the problem is in Argo CD synchronization or in the deployed workload itself.
