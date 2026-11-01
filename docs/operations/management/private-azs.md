# Private availability zones

A **private availability zone** is visible only to the organizations listed on its `whitelist`. Every other organization is treated as if the zone does not exist: it is omitted from their zone list, and API calls that name it return not found. An empty whitelist, which is the default, leaves the zone visible to every organization.

Register the zone first. [Add an availability zone](../adding-an-az.md) covers the controller URL, shared secret, destination, and `azDomains` entry. This page only adds the whitelist.

## Find the organization id

Organization ids are the `id` column of `organizations`. [Open the API database](validating-users.md#open-the-api-database), then:

!!! info
    We are working on scripts in the [cluster toolbox](../accessing-superphenix.md#use-the-cluster-toolbox) for these queries.

```sql
SELECT id, name
FROM organizations
WHERE deleted_at IS NULL
ORDER BY name;
```

Copy the `id` values of the organizations that should see the zone.

## Set the whitelist

Add `whitelist` on the zone entry and [upgrade the release](../applying-configuration-changes.md#apply-a-change). The example below is the `paris-1` zone from [Add an availability zone](../adding-an-az.md). Repeat the keys that zone already has so the upgrade keeps them, and add `whitelist`.

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            azs:
              paris-1:
                name: "Paris 1"
                controllerUrl: "https://controller.paris-1.example"
                authSecret: "replace-with-a-shared-secret"
                destination: "paris-1"
                whitelist:
                  - "00000000-0000-0000-0000-000000000000"
```

To make a zone public again, set `whitelist` to `[]`.

## What members and non-members see

An organization on the list sees the zone in the console and can create resources there. An organization that is absent does not see it.

Put every organization that must keep using the zone on the list before you apply it. A zone that already holds a project's resources disappears from that project's console when its organization is left off the whitelist. The resources remain in the zone.
