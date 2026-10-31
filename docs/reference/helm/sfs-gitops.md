# sfs-gitops

Values for `components/dependencies/sfs-gitops` in the [Superphenix repository](https://github.com/super-phenix/superphenix). The chart identifies the organization and project for a self-service GitOps application, including where that project's values repository lives.

Leave `password` and `sshPrivateKey` empty in Git. Supply them from a secret store.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `organization.organizationID` | string | `""` | Organization ID. Does not include the `spx` prefix. |
| `organization.name` | string | `""` | Name of the organization. |
| `project.projectID` | string | `""` | Project ID. Does not include the `spx` prefix. |
| `project.name` | string | `""` | Name of the project. |
| `project.availabilityZones` | list | `[]` | Availability zones as defined in the Project status. Each entry has `name` (minimized `region-az`) and `cluster` (full cluster name). |
| `project.gitops.valuesLocation.repoURL` | string | `""` | Repository URL for values. |
| `project.gitops.valuesLocation.path` | string | `""` | Path inside that repository. Not used by the secret template. |
| `project.gitops.valuesLocation.targetRevision` | string | `""` | Git revision. Not used by the secret template. |
| `project.gitops.valuesLocation.credentials.username` | string | `""` | Username for the values repository. |
| `project.gitops.valuesLocation.credentials.password` | string | `""` | Password for the values repository. |
| `project.gitops.valuesLocation.credentials.insecure` | boolean | `false` | Allow an insecure Git connection. |
| `project.gitops.valuesLocation.credentials.forceHttpBasicAuth` | boolean | `false` | Force HTTP basic authentication. |
| `project.gitops.valuesLocation.credentials.enableLfs` | boolean | `false` | Enable Git LFS. |
| `project.gitops.valuesLocation.credentials.sshPrivateKey` | string | `""` | Private key for SSH authentication. |
