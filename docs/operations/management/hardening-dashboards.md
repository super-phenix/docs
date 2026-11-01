# Hardening of exposed HTTP dashboards

The Ceph dashboard and Argo CD are published through Ingress on the cluster that runs them. Both authenticate their own users. Both become reachable by anyone who can open the hostname, as soon as DNS points that name at the cluster. Keep those hostnames on a network that only platform administrators can reach, and change the generated passwords after the first login.

Day-to-day sign-in for Argo CD is in [Accessing Superphenix](../accessing-superphenix.md). Argo CD will recreate an Ingress you delete by hand. Change the values below and [upgrade the release](../applying-configuration-changes.md#apply-a-change) so the sync keeps the hardened settings.

## Ceph dashboard

On a hyperconverged cluster and on a decoupled storage cluster, the system chart enables the Rook dashboard and an Ingress for it.

Sign in as `admin`. Rook stores the generated password in the `rook-ceph-dashboard-password` Secret in `spx-storage`:

```bash
kubectl --namespace spx-storage get secret rook-ceph-dashboard-password \
  --output jsonpath='{.data.password}' | base64 --decode
echo
```

Change that password in the dashboard after the first login. Rook documents the user and the Secret in the [Ceph dashboard guide](https://rook.io/docs/rook/v1.16/Storage-Configuration/Monitoring/ceph-dashboard/).

### Choose a hostname

Set `host.name` to a name you control, on the cluster that runs Ceph. The key under `clusters` is the AZ code.

```yaml
clusters:
  local:
    systemConfiguration:
      apps:
        rook-local-cluster:
          values:
            ingress:
              dashboard:
                host:
                  name: ceph.admin.example.org
                  path: /
                tls:
                  - hosts:
                      - ceph.admin.example.org
                    secretName: ceph-dashboard-tls
```

Publish `ceph.admin.example.org` only where administrators sit. The chart default `ceph.example.org` is a placeholder. If that name, or your replacement, resolves to a node and cert-manager can complete the HTTP challenge, the dashboard is on the internet with the `admin` password as the gate.

The Ingress is rendered whenever `ingress.dashboard.host` is set, and the system chart sets it. Leaving the placeholder in place keeps an Ingress object for `ceph.example.org`.

### Disable the Ingress

Set `host` to `null` on the cluster that runs Ceph. Helm drops a null key, so the chart default hostname is removed and Rook does not render the Ingress.

```yaml
clusters:
  local:
    systemConfiguration:
      apps:
        rook-local-cluster:
          values:
            ingress:
              dashboard:
                host: null
```

The key under `clusters` is the AZ code. The dashboard Service `rook-ceph-mgr-dashboard` stays in `spx-storage`, so the dashboard is still reachable from inside that cluster.

## Argo CD

The operator installs Argo CD with an Ingress enabled, `server.insecure: true`, and TLS terminated on the Ingress. The hostname you set at install time is `config.argocd.values.server.ingress.hostname`, described in [Configuring the management stack](../../installation/deployment-guide/installing-management/full-configuration.md#argocd). The initial `admin` password and the sign-in URL are in [Accessing Superphenix](../accessing-superphenix.md#open-argocd). Change the password after the first login.

### Remove the public Ingress

```yaml
config:
  argocd:
    values:
      server:
        ingress:
          enabled: false
```

User values are merged on top of the operator's Argo CD defaults, so `enabled: false` overrides the built-in Ingress. Reach the API with `kubectl` from the [cluster toolbox](../accessing-superphenix.md#use-the-cluster-toolbox) instead.

### Turn off the UI shell and status badges

Keep the Ingress, and still remove the two features that go beyond reading application status:

```yaml
config:
  argocd:
    values:
      configs:
        cm:
          exec.enabled: false
          statusbadge.enabled: false
```

With `exec.enabled` false, the UI no longer offers a pod shell. Administrators still have the cluster toolbox for `kubectl` and `k9s`.
