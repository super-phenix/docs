# CRDs

Superphenix registers three namespaced custom resources in the group **`operator.superphenix.net/v1alpha1`**. The Go types live in `api/operator/v1alpha1/` of the [Superphenix repository](https://github.com/super-phenix/superphenix). The operator chart installs the rendered CRDs from `components/system/superphenix-operator/crds/`.

| Kind | Plural | Namespaced | Role |
|------|--------|:----------:|------|
| [Cluster](cluster.md) | `clusters` | ✓ | One Superphenix cluster: topology, geography, connection, and lifecycle. |
| [Organization](organization.md) | `organizations` | ✓ | A tenant organization onboarded through GitOps. |
| [Project](project.md) | `projects` | ✓ | A project inside an organization, including the availability zones where it may run. |

All three are namespaced, and all three expose a `status` subresource. Create them in the namespace where the operator runs, typically `superphenix-system`.
