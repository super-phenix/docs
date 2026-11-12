# Configuring Postgres storage

PostgreSQL stores the API, Kratos, and Permify databases on one volume. Set the size and the storage class in the operator values, then [upgrade the release](../applying-configuration-changes.md#apply-a-change). [Configuring the management stack](../../installation/deployment-guide/installing-management/full-configuration.md) is the rest of the management values.

## Set the size {#set-the-size}

The chart default is **8Gi**. The chart comment calls that enough for most deployments.

```yaml
management:
  systemConfiguration:
    apps:
      postgres:
        values:
          persistence:
            size: 8Gi
```

`apps.postgres.values.persistence.size` is the volume size. Raise it to give the database more room, then upgrade the release. A value smaller than the volume that already exists is rejected.

## Name a storage class {#name-a-class}

The chart leaves the storage class empty, so the volume uses the cluster's default StorageClass.

On a hyperconverged availability zone, Rook creates that default when the AZ is installed. The class name is `spx-rbd-3x`. A dedicated management cluster uses the default class you installed there. This setting is the class for the database volume. Tenant disks use [Adding a storage class](../storage/adding-a-storage-class.md).

Set the class before PostgreSQL creates the volume:

```yaml
management:
  systemConfiguration:
    apps:
      postgres:
        values:
          persistence:
            storageClass: <storage-class>
```

`apps.postgres.values.persistence.storageClass` is the class name. Read the names with `kubectl get storageclass`. The one marked default is the class the volume uses while this field is empty.

Set the class before the first sync. Kubernetes keeps the storage class of a volume that already exists and rejects a change to that claim.
