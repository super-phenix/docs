# MFA and recovery

Account recovery is enabled in the management chart. TOTP and backup codes stay off until you enable them in [Second factors](#second-factors). Recovery codes and one-time login codes are delivered by the Kratos courier, so set [Sending emails](sending-emails.md) first.

The console serves the Kratos flows at these paths:

| Flow | URL |
|------|-----|
| Login | `https://<console-domain>/auth/login` |
| Registration | `https://<console-domain>/auth/registration` |
| Recovery | `https://<console-domain>/auth/recovery` |
| Settings | `https://<console-domain>/auth/settings` |

Email verification is disabled by default (`selfservice.flows.verification.enabled: false`). Recovery does not wait for a verified address.

## Password recovery

The login page links **Forgot password** to `/auth/recovery`. The user enters the account email. Kratos emails a code and the console asks for that code. The code method lifespan  is **15 minutes** by default.

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

`selfservice.methods.code` is enabled with a **15-minute** lifespan. The login page shows a code step when Kratos offers that method. The code is emailed through the same courier as recovery. That code signs the user in on its own. A second factor is the TOTP method below.

## Second factors

TOTP, backup codes, and WebAuthn are off by default.

You can enable with the following configuration.
Field names are the [Kratos self-hosted MFA configuration](https://www.ory.sh/docs/kratos/self-hosted/mfa).

```yaml
management:
  systemConfiguration:
    apps:
      kratos:
        values:
          kratos:
            config:
              selfservice:
                methods:
                  totp:
                    enabled: true
                    config:
                      issuer: Superphenix
                  lookup_secret:
                    enabled: true
                  webauthn:
                    enabled: true
                    config:
                      passwordless: false
                      rp:
                        display_name: Superphenix
                        # Parent domain of the console host.
                        id: example.org
                        # Scheme and host of the page that starts the WebAuthn prompt.
                        origin: https://console.example.org
```

`issuer` is the name shown in the authenticator app. [TOTP](https://www.ory.sh/docs/kratos/mfa/totp) and [WebAuthn](https://www.ory.sh/docs/kratos/mfa/webauthn-fido-yubikey) describe the credentials. `origin` has to match the scheme and host of that page. The chart's registration flow already includes a `webauthn` hook that shows the verification UI. The method stays disabled until this block sets `enabled: true`.

The shipped identity schema marks `email` as the password identifier and as the recovery address. It has no `credentials.totp.account_name`, so the authenticator app has no account label from that schema.
