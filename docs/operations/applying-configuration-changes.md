# Applying configuration changes

Changes to the management plane and to an availability zone are values on the `superphenix-operator` release. Add them to the values file, then upgrade the release. Argo CD applies the applications.

## Management plane

Management applications (the console, the API, Kratos, Permify, and PostgreSQL) are set under `management.systemConfiguration`.

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            userSettings:
              userIsActiveOnCreate: true
```

The pages under Configuring the management components detail all the settings available in here.

Argo CD itself is installed by the operator chart, so its settings live beside `management`, under `config.argocd.values`.

## Availability zone

Applications that run on an availability zone are set under `clusters.<code>.systemConfiguration`. The key is the AZ code: `local` when the zone runs on the management cluster, and the code you chose in [Add an availability zone](adding-an-az.md) otherwise.

```yaml
clusters:
  paris-1:
    systemConfiguration:
      apps:
        rook-local-cluster:
          values:
            ingress:
              dashboard:
                host:
                  name: ceph.admin.example.org
```

## Lifecycle {#lifecycle}

`lifecycle` decides whether an upgrade is applied on its own. The same three switches exist for the management plane (`management.lifecycle`) and for each availability zone (`clusters.<code>.lifecycle`). All three default to `false`. [Configure a cluster](../installation/deployment-guide/installing-an-az/configuring-a-cluster.md#lifecycle) is the same list on an availability-zone entry.

```yaml
management:
  lifecycle:
    pause: false
    manual: false
    cleanupOnDeletion: false
clusters:
  paris-1:
    lifecycle:
      pause: false
      manual: false
      cleanupOnDeletion: false
```

| Field | Effect |
|-------|--------|
| `pause` | Synchronization stops. Automatic and manual sync both wait until you set it back to `false`. The cluster is reported as **Paused**. |
| `manual` | Automatic sync is off. The applications stay as they are until you sync them in Argo CD, or set this back to `false`. |
| `cleanupOnDeletion` | Removing this cluster also deletes the applications it installed. Leave it `false` unless you intend to remove the stack. |

Set `manual` to `true` when the values should be saved and the applications left untouched until you sync them. Set `pause` to `true` when nothing should sync, including a sync you start by hand. Set the switch back to `false` and upgrade again to resume.

## Upgrade the release {#apply-a-change}

Add the keys to the values file you already pass for this release, then upgrade:

```bash
OPERATOR_VERSION="$(curl -fsSL -o /dev/null -w '%{url_effective}' https://github.com/super-phenix/superphenix/releases/latest | sed 's#.*/v##')"

helm upgrade superphenix-operator \
  "oci://ghcr.io/super-phenix/charts/superphenix-operator:${OPERATOR_VERSION}" \
  --namespace superphenix-system \
  -f values.yaml
```

Replace `OPERATOR_VERSION` by your vesion of Superphenix or use the latest to upgrade your version.

Helm merges that file with the chart defaults. A later upgrade still needs the same `-f` file, or the keys you added are dropped.

With `pause` and `manual` left at `false`, wait until the application you changed is **Synced** and **Healthy** in Argo CD before you test. While `manual` is `true`, sync that application yourself. While `pause` is `true`, the sync waits until you turn it off. [Accessing Superphenix](accessing-superphenix.md) covers opening Argo CD.
