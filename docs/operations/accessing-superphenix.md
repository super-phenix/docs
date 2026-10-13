# Accessing Superphenix

After Superphenix is deployed, use the web console for day-to-day resource management and Argo CD to monitor the platform deployment.

!!! info "Administration UI in development"
    We are working on a dedicated administration UI. Until it is available, use Argo CD and `kubectl/k9s` to monitor and troubleshoot the platform.

You need:

- Network access to the console and Argo CD hostnames configured during installation.
- A working `kubectl` context for the management cluster to retrieve the initial Argo CD password and inspect cluster resources.

## Open the web console

Open the URL configured for the Superphenix console, for example:

```text
https://console.example.org
```

The URL redirects you to the console login page. By default, self-service registration is enabled: anyone who can reach the page can create an account and sign in.

!!! warning "Secure public deployments"
    Restrict network access to the console if you do not want to allow public registration. Configuring authentication and pre-created accounts is covered separately.

After signing in, use the console to create and manage tenant resources such as virtual machines, networks, and storage.

## Open Argo CD

Open the Argo CD hostname configured during installation, for example:

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
    If Argo CD was installed in a different namespace, replace `argocd` in the command with that namespace.

Change the initial password after your first login.

## Monitor deployment and synchronization

Argo CD is the primary place to follow Superphenix deployment activity. The applications shown there represent the platform components managed through GitOps.

Use Argo CD to:

- Check whether applications are **Synced** or **OutOfSync**.
- Check whether applications and their resources are **Healthy**, **Progressing**, **Degraded**, or **Missing**.
- Inspect synchronization history and failed sync operations.
- View the Kubernetes resources that belong to an application and the events reported for them.

All application deployments and synchronizations are performed through Argo CD. Avoid making persistent manual changes to resources managed by Argo CD, because a later synchronization can overwrite them.

## Troubleshoot a deployment

Start with Argo CD when an application does not deploy or synchronize:

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

For remote managed clusters, you can run these commands from the [cluster toolbox](cluster-toolbox.md) on the management cluster.

For multi-container pods, add `--container <container-name>` to the logs command. The resource status, events, and container logs usually show whether the problem is in Argo CD synchronization or in the deployed workload itself.
