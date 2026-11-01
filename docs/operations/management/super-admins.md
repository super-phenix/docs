# Setting super-admins

A **super-admin** is a user id on the API's `superAdmins` list. Permission checks on the API succeed for those ids, and the console is told that the user holds every permission it asked about. The list is empty by default, so nobody has that bypass until you add an id.

The id is the `id` column of the `users` table. Copy it from the database as described below. [Open the API database](validating-users.md#open-the-api-database) first.

## Choose the user

The account must already exist and be active. A user row is created at the first sign-in.

!!! info
    We are working on scripts in the [cluster toolbox](../accessing-superphenix.md#use-the-cluster-toolbox) for these queries.

```sql
SELECT id, email
FROM users
WHERE email = 'admin@example.org'
  AND deleted_at IS NULL;
```

## Add the id

Set the list and [upgrade the release](../applying-configuration-changes.md#apply-a-change):

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            superAdmins:
              - "00000000-0000-0000-0000-000000000000"
```

Replace the example with the `id` from the query. Add one list entry per user. An empty list, or removing the key so the chart default `[]` applies again, turns the bypass off after the API reloads.

## What the bypass allows

For a signed-in user whose id is on the list:

- Organization, project, quota, audit, and product permission checks succeed.
- The permission list returned to the console is the full set for the object they opened, so the console shows every action.
- An organization response includes every project in that organization.
- A project summary includes every product type.

While the list is non-empty, the API also mounts these routes. A caller who is not on the list receives **404**.

| Method and path | Returns |
|-----------------|---------|
| `GET /api/v1/project-manager/users` | Every user |
| `GET /api/v1/project-manager/organizations` | Every organization |
| `GET /api/v1/project-manager/projects` | Every project |
| `GET /api/v1/project-manager/products` | Every product |

Send the user's access token in `Authorization: Bearer`. The routes are not registered at all when `superAdmins` is empty.

!!! warning "Platform-wide access"
    A super-admin passes permission checks in every organization and project the API evaluates. Keep the list to operators who already administer the management cluster, and remove an id when that person should return to ordinary membership.
