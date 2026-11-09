# Backing up your cluster with talos-backup

Superphenix includes an implementation of Siderolab's [talos-backup](https://github.com/siderolabs/talos-backup) disaster recovery tool, a periodic etcd-snapshotter designed to run on Talos-based Kubernetes clusters.

A CronJob is deployed on your cluster and periodically runs a job that takes an **etcd snapshot** and pushes it to **S3 storage**.

Backups are compressed (with `zstd`) and encrypted (with `age`).

To recover a cluster from an etcd snapshot, refer to the [official Talos documentation](https://docs.siderolabs.com/talos/v1.13/build-and-extend-talos/cluster-operations-and-maintenance/disaster-recovery#recovery).


## Prerequisites
Before enabling `talos-backup`, you will need to:

- Have access to an S3 bucket. Your snapshots will be stored there.
- Have a pair of public/private **age** keys, used for snapshot encryption. You can [install age here](https://github.com/FiloSottile/age#installation) and run `age-keygen` to generate your pair of keys.
- Apply the following patch to your Talos **controlplane nodes** to allow Pod access to the Talos API:
    ```yaml
    # Talos machine configuration patch
    spec:
      machine:
        features:
          kubernetesTalosAPIAccess:
            enabled: true
            allowedRoles:
            - os:etcd:backup
            allowedKubernetesNamespaces:
            - talos-backup # Namespace in which talos-backup is deployed
    ```

## Enable `talos-backup`
Enable the tool from the Superphenix system configuration, using base64-encoded credentials for your S3 bucket:

```yaml
systemConfiguration:
  apps:
    talos-backup:
      enabled: true
      values:
        cronjob:
          clusterName: "" # The name of your cluster (optional)
          agePubKey: "" # Your age public key
        s3:
          endpointUrl: "" # Base64-encoded S3 endpoint
          bucket: "" # Base64-encoded bucket name
          accessKey: "" # Base64-encoded S3 access key
          secretKey: "" # Base64-encoded S3 secret key
```

### Schedule
The CronJob is configured to run **every day at 07:00 UTC** by default. You can adjust this schedule by overriding the `cronjob.schedule` value.

### Snapshot encryption
Snapshots are encrypted with **age** using your public key; it needs to be stored in the  `cronjob.agePubKey` value.

You can then decrypt your backups with your private key by running the following command:
```sh
age --decrypt -i <private-key-text-file> <file>.snap.zst.age > <file>.snap.zst
```
!!! note "Don't lose your keys"
    Make sure to keep your keys safe to avoid losing access to your backups.

### Compression
Before encryption, snapshots are compressed with the **ztsd** algorithm. After decrypting a backup, decompress it with the following command:
```sh
zstd --decompress ./<file>.snap.zst
```

You can turn off compression by switching the `cronjob.enableCompression` value to `false`.