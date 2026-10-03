# Configuring the management stack

The management plane is configured once, through the `superphenix-operator` Helm values, whether it runs [inside an AZ](management-inside-az.md) or [outside an AZ](management-outside-az.md). Both install procedures use the file described here.

The operator installs two things on the management cluster:

- **Argo CD**, from the operator chart, which synchronizes every Superphenix application.
- A `Cluster` of type `Management` (connection mode `Local`). Its `systemConfiguration` is passed to the [superphenix-system](https://github.com/super-phenix/superphenix/tree/main/components/system/superphenix-system) chart, which renders one Argo CD `Application` per management component.

Full upstream values:

- [superphenix-operator `values.yaml`](https://github.com/super-phenix/superphenix/blob/main/components/system/superphenix-operator/values.yaml)
- [superphenix-system `values.yaml`](https://github.com/super-phenix/superphenix/blob/main/components/system/superphenix-system/values.yaml)

## What the management cluster must provide

The management applications expect a **storage class** and an **ingress controller** on the cluster where they run.

| Need | Used by | Where it comes from |
|------|---------|---------------------|
| Persistent volume | PostgreSQL (default **8Gi**) | A default `StorageClass` on the management cluster |
| HTTP on ports 80 and 443 | Console, API, Kratos, and Argo CD | An ingress controller. Superphenix AZs use Traefik from the system chart |

On a dedicated management cluster, provide both before you rely on the console. When management runs inside an AZ, Rook and Traefik are installed with that AZ, so the console stays unavailable until the AZ is installed. See [Installing inside an AZ](management-inside-az.md#console-availability).

## Values file

Create `values.yaml` and pass it to Helm from the placement guide you are following. Replace every example secret and hostname.

```yaml
# Set to true only while the management cluster has no CNI yet.
# Required for Installing inside an AZ until Kube-OVN is healthy.
# Leave false when the management cluster already has a CNI.
installOnClusterWithoutCNI: false

config:
  argocd:
    ha:
      enabled: false
    values:
      server:
        ingress:
          hostname: argocd.example.org # or argocd.192.168.1.10.nip.io

management:
  # Optional. Defaults to "management". Not shown to end users.
  region: management
  availabilityZone: management
  lifecycle:
    # Set true to disable autosync of every management application.
    manual: false
    pause: false
    cleanupOnDeletion: false
  systemConfiguration:
    apps:
      superphenix-console:
        values:
          # Public domain for the console, the API, and Kratos.
          domain: console.example.org # or console.192.168.1.10.nip.io
      kratos:
        values:
          # Random string, at least 16 characters. Set before the first sync.
          globalSecret: "replace-with-a-random-string-at-least-16-characters"
      postgres:
        values:
          auth:
            # Shared by the API, Kratos, and Permify. Replace before the first sync.
            password: "replace-with-a-unique-password"
          persistence:
            size: 8Gi
```

`management.systemConfiguration` is copied onto the management `Cluster` and becomes the Helm values of `superphenix-system`. Per-application overrides live under `apps.<name>`, matching the keys in the system chart.

## DNS

The console domain and the Argo CD hostname must resolve to the management cluster.

On a Superphenix AZ, Traefik listens on **every node** on ports **80** and **443**, so DNS only needs to point at **one** node. For high availability, use a load balancer or DNS round-robin.

!!! tip "No DNS?"
    Use [nip.io](https://nip.io) against a node address, for example `console.192.168.1.10.nip.io`. Use the same pattern for the Argo CD hostname.

!!! warning "NAT gateway traffic to a node"
    Due to a macvlan limitation, traffic from a NAT gateway is blackholed when its destination is an address on the node hosting that gateway. VMs and Kubernetes as a Service clusters can therefore lose access to the console when DNS points directly at a node. Put a load balancer in front of the nodes and point DNS at the load balancer. See [Limitations](../../../operations/limitations.md#nat-gateway-traffic-to-its-host-node).

One hostname serves the whole console stack. The system chart publishes:

| Path | Component | TLS secret |
|------|-----------|------------|
| `/` | Web console | `superphenix-console-tls` |
| `/api` | API | `superphenix-api-tls` |
| `/accounts` | Kratos (login, registration, recovery) | `kratos-public-tls` |

The API URL, Kratos base URL, session cookies, and CORS allowed origins are all rendered from `apps.superphenix-console.values.domain`. Argo CD uses `config.argocd.values.server.ingress.hostname` and is a separate name. The chart's built-in Argo CD ingress hostname is `argocd.superphenix.net`; override it.

Ingress TLS annotations for cert-manager (`cert-manager.io/cluster-issuer: letsencrypt`) are present in the chart and commented out. cert-manager is installed with an AZ (hyperconverged, storage, or workload), not with the management components.

## Management components

The system chart deploys an application on a cluster only when that cluster's effective mode is listed in the application's `modes`. The management `Cluster` has effective mode `Management`. These are the applications selected for that mode.

| Application | Role | Default |
|-------------|------|---------|
| `superphenix-console` | Web UI for operators and tenants | Enabled, chart `0.6.1` |
| `superphenix-api` | Backend for the console and CLI. Stores organizations, projects, and API state in PostgreSQL. Delegates authentication to Kratos and authorization to Permify | Enabled, version follows the Superphenix release |
| `kratos` | [Ory Kratos](https://www.ory.sh/kratos/) identity, sessions, and self-service flows | Enabled, chart `0.43.1` |
| `permify` | Authorization. The API calls it for permission checks | Enabled, chart `0.3.*` |
| `postgres` | Shared PostgreSQL for the API, Kratos, and Permify | Enabled, chart `0.19.12` |
| `talos-operator` | Bare-metal Talos: PXE boot and machine configuration | Disabled |
| `idrac-exporter` | Prometheus exporter for Dell iDRAC baseboard management controllers | Disabled |

### Console

`apps.superphenix-console.values.domain` is the public name of the console. Ingress is enabled and serves `/` on that host.

### API

The API ingress is enabled on the console domain at `/api`. It connects to PostgreSQL with the password from the `postgres` application:

- Host `postgres.<namespace>.svc`, port `5432`
- Database, username: `superphenix`

`userIsActiveOnCreate` defaults to `true`, so a self-service registration can sign in immediately. [Accessing Superphenix](../../../operations/accessing-superphenix.md) describes the login page and how to restrict registration on a public deployment.

The chart's local AZ entry (`azs.local`) points the API at an in-cluster Superphenix controller named "Local AZ". That controller is installed with the AZ, not with the management components.

### Kratos

`apps.kratos.values.globalSecret` derives the default, cookie, and cipher secrets. Use a random string of at least 16 characters and set it before the first sync. Rotating it invalidates existing sessions.

Kratos stores identities and sessions in the `kratos` database on the same PostgreSQL instance. The DSN is rendered from `apps.postgres.values.auth.password`.

Defaults that matter at install time:

- Code-based login is enabled (15-minute lifespan). Account recovery is enabled. Email verification is disabled.
- Courier SMTP is required by Kratos even when you are not sending mail. The chart default is a placeholder (`smtps://dummy@example.org` on localhost). To send recovery mail, set `apps.kratos.values.kratos.config.courier.smtp` (`connection_uri`, `from_address`, `from_name`).
- The public listener is `https://<console-domain>/accounts`. The ingress strips the `/accounts` prefix before the request reaches Kratos.
- Database migrations run automatically on upgrade (`automigration.enabled: true`).

### Permify

Permify stores relation tuples in the `permify` database. The connection URI uses the same PostgreSQL user and password. The default is a single replica with distributed mode disabled. The API reaches it at `permify.<namespace>.svc:3478`.

### PostgreSQL

One instance backs the three databases. On first start, an init script creates `kratos` and `permify` and grants them to the user `superphenix`. The API uses the database named `superphenix`.

Override `apps.postgres.values.auth.password`. The chart default is a public placeholder. The same value is substituted into the API, Kratos, and Permify configuration, so it only needs to be set on the `postgres` application.

`apps.postgres.values.persistence.size` defaults to `8Gi`, which the chart describes as enough for most deployments. The volume uses the cluster default storage class. No storage class name is set in the chart.

The operator connects to this database itself when `config.database.autoConnect` is `true` (the default): it reads the `postgres` secret. To point the operator at another database, set `config.database.host`, `port`, `user`, `password`, and `name`, and set `autoConnect` to `false`.

### Talos operator

Disabled by default (`apps.talos-operator.enabled: false`). Enable it when this management cluster should run the Talos operator for PXE boot and machine configuration. The chart turns on `featureFlags.enablePxeBootStack`. How an AZ is provisioned through BMC is covered in [Automated OS installation](../installing-the-os/automated-os-installation.md).

### iDRAC exporter

Disabled by default (`apps.idrac-exporter.enabled: false`). Enable it to scrape Dell iDRAC metrics. The chart ships empty Helm values; add the exporter's own settings under `apps.idrac-exporter.values`.

## Argo CD

Argo CD is installed by the operator chart, not by a `Management`-mode application. `config.argocd.values` is merged into the Argo CD Helm values. The setting you need at install time is the ingress hostname, under `server.ingress.hostname`, as in the example above.

`config.argocd.ha.enabled: true` turns on Redis HA and autoscaling for the server and repo server.

`config.argocd.chart.url` and `config.argocd.chart.version` override the Argo CD chart location. Leave them empty to use the chart built into the operator.

After the ingress controller is serving traffic, sign in as described in [Accessing Superphenix](../../../operations/accessing-superphenix.md). The initial admin password is in the `argocd-initial-admin-secret` secret in `superphenix-system`.

## Operator lifecycle

These fields are copied onto the management `Cluster`:

| Field | Effect |
|-------|--------|
| `management.lifecycle.manual` | Disables autosync of every application on the management cluster. Applications stay in place until you sync them in Argo CD or set this back to `false`. |
| `management.lifecycle.pause` | Pauses synchronization of the management stack. |
| `management.lifecycle.cleanupOnDeletion` | Cascade-deletes managed resources when the management cluster object is removed. |
| `management.region`, `management.availabilityZone` | Labels stored on the management cluster. Default `management`. End users do not see this cluster as an AZ. |
| `management.systemLocation` | Overrides `repoURL`, `chartName`, or `version` of the system chart used for management. Empty values keep the operator defaults (`ghcr.io/super-phenix/charts`, chart `superphenix-system`, version aligned with the operator). |

`installOnClusterWithoutCNI` is an operator-chart flag, not a system-chart value. When `true`, the operator and Argo CD tolerate `NotReady` nodes and use the host network, so they can run before a CNI exists. [Installing inside an AZ](management-inside-az.md) sets it to `true` until Kube-OVN is healthy, then back to `false`. A management cluster that already has a CNI leaves it `false`.
