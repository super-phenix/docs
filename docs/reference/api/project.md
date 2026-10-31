# Project

A **Project** is a Superphenix project onboarded through GitOps. It belongs to one [Organization](organization.md) and can be placed on one or more [Cluster](cluster.md) resources.

| | |
|--|--|
| **Group** | `operator.superphenix.net` |
| **Version** | `v1alpha1` |
| **Kind** | `Project` |
| **Plural** | `projects` |
| **Scope** | Namespaced |

## Spec

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `projectID` | string | Yes | Project UUID issued by Superphenix. Must be a UUIDv4. |
| `name` | string | No | Overrides the project name. When empty, the metadata name is used. At most 63 characters, and it must be a Kubernetes label value. |
| `organizationRef` | object | Yes | Organization this project belongs to. See below. |
| `availabilityZones` | list | No | Clusters where this project may exist. See below. |
| `gitops` | object | No | Git repository overrides for this project's manifests and values. See below. |

### `organizationRef`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the Organization resource. |
| `namespace` | string | No | Namespace of that Organization. Empty uses the Project's namespace. |

### `availabilityZones[]`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the Cluster resource. |
| `namespace` | string | No | Namespace of that Cluster. Empty uses the Project's namespace. |

### `gitops`

| Field | Type | Description |
|-------|------|-------------|
| `manifestLocation.repoURL` | string | Overrides the default repository URL for manifests. |
| `manifestLocation.path` | string | Overrides the default manifest path. |
| `manifestLocation.targetRevision` | string | Overrides the default manifest revision. |
| `valuesLocation.repoURL` | string | Overrides the default repository URL for values. |
| `valuesLocation.path` | string | Overrides the default values path. |
| `valuesLocation.targetRevision` | string | Overrides the default values revision. |
| `valuesLocation.credentials.username` | string | Username for the values repository. |
| `valuesLocation.credentials.password` | string | Password for the values repository. Supply it from a secret store. Do not commit it. |
| `valuesLocation.credentials.insecure` | boolean | Allow an insecure Git connection. |
| `valuesLocation.credentials.forceHttpBasicAuth` | boolean | Force HTTP basic authentication. |
| `valuesLocation.credentials.enableLfs` | boolean | Enable Git LFS. |
| `valuesLocation.credentials.sshPrivateKey` | string | Private key for SSH authentication. Supply it from a secret store. Do not commit it. |

## Status

| Field | Type | Description |
|-------|------|-------------|
| `displayName` | string | Effective name: `spec.name` when set, otherwise the metadata name. |
| `availableZones` | list | Availability zones where the project is available. |
| `availableZones[].name` | string | Minimized name, `region-az`. |
| `availableZones[].clusterName` | string | Full name of the cluster. |
| `availableAZsCount` | integer | Number of available availability zones. |
| `conditions` | list | Standard Kubernetes conditions. |
| `observedGeneration` | integer | Generation most recently observed. |

`kubectl get projects` prints the organization, project ID, display name, the `Bound` condition, the available AZ count, and age.

### Conditions

| Type | Reasons | Meaning |
|------|---------|---------|
| `Bound` | `Found` | The project already exists in the Superphenix database. |
| `Bound` | `Created` | The operator created the project record. |
| `Bound` | `Failed` | Binding the resource failed. |
| `AvailabilityZonesReady` | `Valid` | Every referenced availability zone is valid. |
| `AvailabilityZonesReady` | `Invalid` | One or more availability zones are invalid. |

## Example

```yaml
apiVersion: operator.superphenix.net/v1alpha1
kind: Project
metadata:
  name: docs-demo-project
  namespace: superphenix-system
spec:
  projectID: 22222222-2222-4222-8222-222222222222
  name: docs-demo-project
  organizationRef:
    name: docs-demo-org
  availabilityZones:
    - name: az-paris-1
  gitops:
    manifestLocation:
      repoURL: https://github.com/example/project-manifests
      path: manifests
      targetRevision: main
    valuesLocation:
      repoURL: https://github.com/example/project-values
      path: values
      targetRevision: main
```
