# Account recovery and login codes

Kratos emails a code to users who forgot their password, and can email a one-time code to sign in without it. Both are enabled in the management chart and delivered by the Kratos courier, so set [Sending emails](sending-emails.md) first. Second factors are covered in [Multi-factor authentication](mfa.md).

The console serves the Kratos flows at these paths:

| Flow | URL |
|------|-----|
| Login | `https://<console-domain>/auth/login` |
| Registration | `https://<console-domain>/auth/registration` |
| Recovery | `https://<console-domain>/auth/recovery` |
| Settings | `https://<console-domain>/auth/settings` |

Email verification is disabled by default (`selfservice.flows.verification.enabled: false`). Recovery does not wait for a verified address.

## Account recovery

The login page links **Forgot password** to `/auth/recovery`. The user enters the account email. Kratos emails a code and the console asks for that code. The code method lifespan is **15 minutes** by default.

After a successful recovery, Kratos runs the `revoke_active_sessions` hook, so other sessions for that identity are signed out.

A password change from `/auth/settings` asks the user to sign in again when the session is older than **15 minutes** (`privileged_session_max_age`).

To stop self-service recovery, set the flow off and [upgrade the release](../applying-configuration-changes.md#apply-a-change). The login page then reports that recovery is disabled.

```yaml
management:
  systemConfiguration:
    apps:
      kratos:
        values:
          kratos:
            config:
              selfservice:
                flows:
                  recovery:
                    enabled: false
```

## One-time login codes

`selfservice.methods.code` is enabled with a **15-minute** lifespan. The login page shows a code step when Kratos offers that method. The code is emailed through the same courier as recovery. That code signs the user in on its own. It is not a second factor.
