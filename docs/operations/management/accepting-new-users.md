# Accepting new users automatically

With automatic acceptance, a person who can open the registration page receives an active account and can sign in immediately. To hold accounts until an administrator approves them, use [Validating users manually](validating-users.md).

The login page and the public registration warning are in [Accessing Superphenix](../accessing-superphenix.md).

## Leave new accounts active

`userIsActiveOnCreate` is `true` in the system chart by default.

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            userSettings:
              userIsActiveOnCreate: true
```

The flag applies to accounts created after the API reloads it. Accounts that are already inactive stay inactive until you set `is_active` in the database, as described in [Validating users manually](validating-users.md#activate-an-account).

## What registration creates

On the first successful sign-in, the API stores the Kratos identity and creates:

- A user row with `is_active` set from `userIsActiveOnCreate`.
- A personal organization named **Personal Org**, owned by that user.
- A project named **default** in that organization.

When [default project resources](default-project-resources.md) are enabled, that project also receives a default VPC and subnet in each availability zone the organization can see.

Anyone who can reach `https://<console-domain>/auth/registration` can complete this flow. On a console that is reachable from the internet, restrict the network or switch to manual validation.
