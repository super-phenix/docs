# Add an organization quota

An **organization quota** is the pool of CPU, memory, and disk that organization may consume. Platform administrators set it on the admin API. Organization administrators then split it across projects, as described in [Quotas](../features/multi-tenancy/quotas.md).

The admin listener is port `7000` (`admin-http`) on the Service `superphenix-api` in `superphenix-system`. It is separate from the public API.

## Set the admin API secret {#set-the-admin-api-secret}

The listener accepts a request whose `Secret` header matches `adminHttp.authSecret`. The API default for that secret is empty. A missing header is refused, and a header sent with an empty value matches that default, so set a secret before you call the route. Add it and [upgrade the release](applying-configuration-changes.md#apply-a-change):

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            adminHttp:
              authSecret: "<admin-api-secret>"
```

Keep the value with the other platform secrets. The pages below send it only in the `Secret` header.

## Find the organization id

Organization ids are the `id` column of `organizations`. [Open the API database](management/validating-users.md#open-the-api-database), then:

!!! info
    We are working on scripts in the [cluster toolbox](accessing-superphenix.md#use-the-cluster-toolbox) for these queries.

```sql
SELECT id, name
FROM organizations
WHERE deleted_at IS NULL
ORDER BY name;
```

Copy the `id` of the organization that should receive the pool.

## Set the quota

Forward the admin port:

```bash
kubectl --namespace superphenix-system port-forward service/superphenix-api 7000:7000
```

Send the pool as JSON. The keys are `cpu`, `memory`, and `disk`. Quantities use Kubernetes syntax (`16`, `1500m`, `64Gi`, `1Ti`). Leave a key out to leave that resource unlimited. `"0"` is a hard limit of zero.

```bash
curl --silent --show-error --request PUT \
  --header "Secret: <admin-api-secret>" \
  --header "Content-Type: application/json" \
  --data '{"cpu":"16","memory":"64Gi","disk":"1Ti"}' \
  "http://127.0.0.1:7000/quota/organization/<organization-id>"
```

A successful call returns the saved limit:

```json
{
  "organizationId": "<organization-id>",
  "limit": {
    "cpu": "16",
    "memory": "64Gi",
    "disk": "1Ti"
  }
}
```

When no project of the organization has a project quota yet, this call also divides the pool across the live projects and their availability zones. [Quotas](../features/multi-tenancy/quotas.md#how-the-pool-is-split) describes that split. Projects that already have a project quota keep it, and the new organization quota has to cover what they hold.

| Status | Meaning |
|--------|---------|
| 200 | The quota is saved and pushed. |
| 400 | The body is not a valid quota, or the new limit is below what the projects already hold. Lower the project and availability-zone quotas first, then retry. |
| 401 | The `Secret` header does not match `adminHttp.authSecret`. |
| 404 | No organization has that id. |
| 502 | The quota is saved, and at least one availability zone did not apply it. The message names those zone codes. Send the same request again. The API also retries every 10 minutes. |

CPU and memory quotas require every pod in the project namespace to declare limits. See [Quotas](../features/multi-tenancy/quotas.md#where-a-quota-applies).

## Read it back

```bash
curl --silent --show-error \
  --header "Secret: <admin-api-secret>" \
  "http://127.0.0.1:7000/quota/organization/<organization-id>"
```

The response has `unlimited`, `limit`, `allocated` (what the projects hold), `remaining`, and `projectQuotas`.

## Remove the organization quota

```bash
curl --silent --show-error --request DELETE \
  --header "Secret: <admin-api-secret>" \
  "http://127.0.0.1:7000/quota/organization/<organization-id>"
```

A successful call returns no body. Project quotas are kept and stay enforced.
