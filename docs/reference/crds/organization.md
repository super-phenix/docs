# Organization

An **Organization** is a tenant organization onboarded through GitOps. It mirrors an organization created in the Superphenix console.

| | |
|--|--|
| **Group** | `operator.superphenix.net` |
| **Version** | `v1alpha1` |
| **Kind** | `Organization` |
| **Plural** | `organizations` |
| **Scope** | Namespaced |

Projects point at an Organization with `spec.organizationRef`. See [Project](project.md).

## Spec

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `organizationID` | string | Yes | Organization UUID issued by Superphenix. Must be a UUIDv4. |
| `name` | string | No | Overrides the organization name. When empty, the metadata name is used. At most 63 characters, and it must be a Kubernetes label value: letters, digits, `-`, `_`, and `.`, starting and ending with a letter or digit. |

## Status

| Field | Type | Description |
|-------|------|-------------|
| `displayName` | string | Effective name: `spec.name` when set, otherwise the metadata name. |
| `conditions` | list | Standard Kubernetes conditions. |
| `observedGeneration` | integer | Generation most recently observed. |

`kubectl get organizations` prints the organization ID, display name, the `Bound` condition, and age.

### Conditions

| Type | Reasons | Meaning |
|------|---------|---------|
| `Bound` | `Found` | The organization already exists in the Superphenix database. |
| `Bound` | `Created` | The operator created the organization record. |
| `Bound` | `Failed` | Binding the resource failed. |

## Example

```yaml
apiVersion: operator.superphenix.net/v1alpha1
kind: Organization
metadata:
  name: docs-demo-org
  namespace: superphenix-system
spec:
  organizationID: 11111111-1111-4111-8111-111111111111
  name: docs-demo-org
```
