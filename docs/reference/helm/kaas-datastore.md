# kaas-datastore

Values and chart documentation for `components/dependencies/kaas-datastore` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

Deploys datastores (etcd clusters) for Kamaji controlplanes through etcd-operator.

## Values

### Datastore default parameters

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| dataStoreDefaults | object | `{"replicas":3,"storage":"10Gi"}` | Defines default values for datastores |

### Other Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| dataStores | object | {} | Defines datastore resources for the controlplanes. Each key defines a datastore and should be unique See values.yaml for the complete syntax. |
| location | string | `""` |  |
