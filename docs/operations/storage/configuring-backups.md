# Configuring backups

A **backup** is a copy of a project stored in S3. It includes the project's metadata and its data, so the project can be rebuilt from an empty availability zone. Backups can be partial (a VM, an application) or full (the entire content of the project).

Users can create backups by **themselves**, and set schedules to do periodic backups with a custom retention.
Configure a backup location on **every AZ**. Until that location exists, backups on the AZ fail.


Backups are the recovery copy used in two cases:

- **Disaster recovery across availability zones.** One AZ fails, and another AZ restores the project from the backups it has been receiving.
- **A restore on the AZ that created the backup**, using the remote copy.

[Snapshots](../../features/storage/snapshot.md) stay on the cluster and protect disks locally. Backups leave the cluster. For a shorter recovery of the disks themselves, [enable block pool replication](adding-a-storage-pool.md#replication). Starting from the latest replicated export is faster than restoring a backup.

## Where the backups go

The destination is an S3 bucket. It can be:

- An object store on **another Superphenix cluster**. Place it far from the AZ that produces the backups, on a path that stays fast when many backups run at once.
- An **S3 endpoint outside Superphenix**.
- An object store on the **same cluster**. Prefer a remote bucket. Snapshots already cover local data protection, and a bucket on the same cluster is lost with the cluster.

With two AZs, cross the destinations: AZ A writes to a bucket on AZ B, and AZ B writes to a bucket on AZ A.

The location marked as the default is where this AZ's backups are written. Add further locations when this AZ should restore from backups that another AZ produced. How to run that restore will be covered in a disaster recovery article. That article is not published yet.

!!! info "Where to apply this configuration"
    Set the backup location on the cluster that **runs workloads**:

    - **Hyperconverged**: the AZ cluster.
    - **Decoupled**: the **workload** cluster (not the storage cluster).

## Configuration

Add the location under `systemConfiguration` on the `Cluster` resource (or via the `superphenix-operator` Helm chart), using the **`velero`** chart.

```yaml
systemConfiguration:
  apps:
    velero:
      values:
        configuration:
          # S3 bucket that receives this AZ's backups.
          backupStorageLocation:
            - name: "[location name]"
              # Only one location can have this property.
              # This is where Superphenix will send the backups.
              default: true
              provider: aws
              bucket: "[bucket name]"
              prefix: velero
              config:
                # Identifier for the bucket's region. When AZs cross backups,
                # use the name of the AZ that hosts the bucket.
                region: "[az name]"
                s3Url: https://s3.example.org
                s3ForcePathStyle: true
            # Restore source only. Backups are written to the default location above.
            # - name: "[remote az]"
            #   default: false
            #   accessMode: ReadOnly
            #   provider: aws
            #   bucket: "[bucket name]"
            #   prefix: velero
            #   config:
            #     region: "[az name]"
            #     s3Url: https://s3.other.example.org
            #     s3ForcePathStyle: true
        # Credentials for the S3 bucket. The secretContents key is "cloud".
        # The profile heading matches backupStorageLocation.name.
        credentials:
          secretContents:
            cloud: |
              [location name]
              aws_access_key_id=[access key]
              aws_secret_access_key=[secret key]
            # [remote az]
            # aws_access_key_id=[access key]
            # aws_secret_access_key=[secret key]
```

- **`backupStorageLocation[].name`**: name of this location
- **`default`**: set on the location backups are written to. One location on the AZ is the default.
- **`bucket`** and **`prefix`**: bucket name, and the path inside it (`velero`).
- **`config.region`**: region identifier sent to S3. For a bucket on the opposite AZ, use that AZ's name.
- **`config.s3Url`**: S3 endpoint, for example the object store hostname from [Adding an object store](adding-an-object-store.md).
- **`secretContents.cloud`**: credentials file for the backup location. The profile heading, `[location name]`, is the backup location `name`. The keys need read and write access to the bucket.
- **`accessMode: ReadOnly`**: use this on extra locations. Those locations are restore sources and do not receive this AZ's backups.

For advanced options, see the [Velero](https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero) Helm chart values.
