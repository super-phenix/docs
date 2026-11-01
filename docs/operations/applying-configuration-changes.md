# Applying configuration changes

Changes to the management plane and to an availability zone are values on the `superphenix-operator` release. The operator writes those values onto a `Cluster` resource, and Argo CD syncs the applications on that cluster.

## Management plane

Management applications (the console, the API, Kratos, Permify, and PostgreSQL) are set under `management.systemConfiguration`. That object is copied onto the management `Cluster`.

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

Wait until the application you changed is **Synced** and **Healthy** in Argo CD before you test. [Accessing Superphenix](accessing-superphenix.md) covers opening Argo CD.
