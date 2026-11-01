# Validating users manually

Manual validation lets people register, then keeps the account out of the console until an administrator marks it active. The system default leaves `userIsActiveOnCreate` at `true`, so a registration can sign in immediately until you change it here.

## Hold new accounts inactive

Set `userIsActiveOnCreate` to `false` and [upgrade the release](../applying-configuration-changes.md#apply-a-change):

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            userSettings:
              userIsActiveOnCreate: false
```

Registrations that complete after the API reloads this value are stored with `is_active` false. The API still creates the personal organization **Personal Org** and the project **default** at first sign-in. The console session is refused until the row is active.

The user can authenticate with Kratos and then lands on **Inactive Account**. That page says the account cannot open the console and offers the address in `config.supportEmail`. The console chart default for that address is `support@example.org`. Set a mailbox you read:

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-console:
        values:
          config:
            supportEmail: platform@example.org
```

`environment.js` is served with `Cache-Control: no-cache`, so a reload shows the new address.

Existing active users stay active. The flag is written only when the user row is created.

## Open the API database {#open-the-api-database}

User and organization rows live in the `superphenix` database on the management PostgreSQL instance. The pod has the password in `POSTGRES_PASSWORD`.

```bash
kubectl --namespace superphenix-system exec --stdin --tty \
  statefulset/postgres --container postgres -- \
  bash -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"'
```

## Activate an account {#activate-an-account}

!!! info
    We are working on scripts in the [cluster toolbox](../accessing-superphenix.md#use-the-cluster-toolbox) for these queries.

List accounts that are waiting:

```sql
SELECT id, email, is_active, created_at
FROM users
WHERE is_active = false
  AND deleted_at IS NULL
ORDER BY created_at;
```

Activate the one you have checked:

```sql
UPDATE users
SET is_active = true
WHERE email = 'user@example.org'
  AND deleted_at IS NULL;
```

Ask the user to sign in again. The next session request reads `is_active` and issues console tokens.

To close an account later, set `is_active` back to `false`. An access token that was already issued stays valid until it expires. The API default for that lifetime is **1 hour**. A refresh after that is refused, and API tokens for the user are refused as soon as the row is inactive.
