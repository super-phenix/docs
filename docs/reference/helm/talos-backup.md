# talos-backup

Values and chart documentation for `components/dependencies/talos-backup` in the [Superphenix repository](https://github.com/super-phenix/superphenix). Defaults are the chart defaults.

Based on [talos-backup](https://github.com/siderolabs/talos-backup) :

> talos-backup is a dead simple backup tool for Talos Linux-based Kubernetes clusters. The goal is simple: run this as a cronjob in a desire cluster, take an etcd snapshot, push said snapshot to s3.

Jobs run every day at 8:00 AM.  
Backups are compressed (with `zstd`) and encrypted (with `age`).  

## How to access backups

```sh
# Store S3 credentials as environment variables
export AWS_ACCESS_KEY_ID='***'
export AWS_SECRET_ACCESS_KEY='***'
export AWS_REGION='***'
export S3_ENDPOINT_URL='***'

# List files and directories
s5cmd ls s3://<bucket>/talos-backup/

# Copy file to working directory
s5cmd cp s3://<bucket>/talos-backup/<file> .

# Decrypt backup file with AGE secret key
age --decrypt -i <secret-key-txt-file> <file>.snap.zst.age > <file>.snap.zst

# Decompress decrypted file
zstd --decompress ./<file>.snap.zst
```

## How to restore etcd from snapshot

Follow [this documentation](https://docs.siderolabs.com/talos/v1.12/build-and-extend-talos/cluster-operations-and-maintenance/disaster-recovery).
