# Disaster recovery

Depending on the criticity of your workloads, you may want to be able to restore your cluster in case of catastrophic failure, or have the option to migrate it to a different AZ in case of a major outage.

## Enabling disaster recovery

Follow this guide to enable the disaster recovery option on your cluster. This makes it possible to include it in project-scoped backups.

!!! warning "Backup creation"
    Enabling the disaster recovery option will not automatically create a corresponding backup schedule. You have to manually create a project-wide backup or backup schedule.

=== "Console"

    1. Access your cluster's page under **PaaS → Kubernetes**.
    2. Click **Options → Edit** (top right).
    3. Under **General Information**, enable the **Disaster Recovery** switch.
    4. Navigate to the last tab (**Network Configuration**) and click **Update** (bottom right).

=== "GitOps"

    1. Enable and configure the dedicated datastore option under `<cluster-name>.controlPlane.dataStore`:
        - **dedicated**: Set to `true` to enable the disaster recovery option.
        - **storageClassName:** Storage type to use, as etcd clusters are latency sensitive, SSD-backed storage classes are best suited for this usecase.
        - **storage**: Size of the PVCs for the etcd members (Default value is `8Gi`).

    Example:
    ```yaml
    my-cluster:
      controlPlane
        dataStore:
          dedicated: true
          storageClassName: default
          storage: 8Gi
    ```

    Full chart values: [sfs-kaas](https://github.com/super-phenix/superphenix/blob/main/components/dependencies/sfs-kaas/values.yaml).

Enabling this functionality will create a dedicated etcd cluster and migrate the controlplane data to it. During the migration process the controlplane will become read-only, a migration typically only takes a few minutes.

!!! note "Post migration"
    Once the controlplane is migrated to the dedicated datastore, complete the operation by rebooting your worker nodes via the console.

## Restoring or migrating a cluster

!!! info "Performing a DR"
    Cluster migration and restoration can currently only be performed by Superphenix admins.
