# Sending emails

Kratos sends password-recovery codes and one-time login codes through its courier. This page sets the SMTP server those messages use. Account recovery itself is covered in [MFA and recovery](mfa-and-recovery.md).

The management chart always sets a courier block. The default connection is a placeholder, `smtps://dummy@example.org:password@localhost:465/`, so a fresh install does not deliver mail. Replace it before anyone depends on recovery or a login code.

## Set the SMTP server

Add the courier settings to the operator values and [upgrade the release](../applying-configuration-changes.md#apply-a-change). The `kratos` application must be **Synced** and **Healthy** before you send a test message.

```yaml
management:
  systemConfiguration:
    apps:
      kratos:
        values:
          kratos:
            config:
              courier:
                smtp:
                  connection_uri: smtps://mailer:replace-with-a-password@smtp.example.org:465/
                  from_address: no-reply@example.org
                  from_name: Superphenix
```

| Field | Role |
|-------|------|
| `connection_uri` | SMTP server. `smtps://` opens TLS on connect. The chart default uses port **465**. |
| `from_address` | Address recipients see as the sender. |
| `from_name` | Display name on the message. The chart default is `Superphenix Console`. |

Percent-encode reserved characters in the username and password. A password that contains `@`, `:`, or `/` will otherwise be parsed as part of the URI.

Kratos stores the identity and the recovery code in the `kratos` database. The message itself leaves the cluster only through this URI. A firewall that blocks the management pods from the mail server leaves the code in Kratos and the user with an empty inbox.

## Confirm delivery

Open the console login page and choose **Forgot password**, or start a recovery from `https://<console-domain>/auth/recovery`. Kratos responds that a code was sent when the address matches an account. The message arrives only when the courier can open `connection_uri`.

If nothing arrives, read the `kratos` pod logs for the courier error, then check that the management cluster can reach the SMTP host and port. The placeholder host `localhost` fails this check on purpose.
