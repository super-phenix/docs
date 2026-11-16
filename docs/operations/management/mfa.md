# Multi-factor authentication

Superphenix accounts can use a second factor on top of the password. Ory Kratos handles the factors, and the console renders the enrollment and login screens.

Second factors are off by default. Each method below is enabled on its own, so you can offer one, two or all three. MFA stays optional for each user: a user who enrolled nothing keeps signing in with a password.

| Method | Console label | What the user needs | Resists phishing |
|--------|---------------|---------------------|------------------|
| [TOTP](#totp) | Authenticator app | An authenticator app | No |
| [WebAuthn](#webauthn) | Security keys | A hardware key, or a device with fingerprint or face unlock | Yes |
| [Lookup secrets](#lookup-secrets) | Backup codes | A safe place to store the codes | No |

## Require the second factor

Set `required_aal` before you enable a method. Without it, Kratos never asks an enrolled user for their second factor.

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
                  settings:
                    required_aal: highest_available
              session:
                whoami:
                  required_aal: highest_available
```

`highest_available` applies to enrolled users only. They must complete a second factor to get a console session and to open **Account settings**.

The sections below show what to add under `kratos.config`. [Upgrade the release](../applying-configuration-changes.md#apply-a-change) to apply a change. The [Kratos MFA configuration](https://www.ory.sh/docs/kratos/self-hosted/mfa) lists every field.

## TOTP

TOTP generates a 6-digit code in an authenticator app, such as Google Authenticator or Aegis. The code changes every 30 seconds.

```yaml
selfservice:
  methods:
    totp:
      enabled: true
      config:
        issuer: Superphenix
```

| Field | Effect |
|-------|--------|
| `enabled` | Turns the method on |
| `config.issuer` | Name shown in the authenticator app |

The identity schema sets `credentials.totp.account_name` on `email`, so the app labels the entry with the email.

To enroll, a user opens **Authenticator app** in **Account settings**, scans the QR code or copies the secret, enters a code, and selects **Save**.

[TOTP in the Kratos documentation](https://www.ory.sh/docs/kratos/mfa/totp) describes the credential.

## WebAuthn

WebAuthn confirms a sign-in with a hardware key, such as a YubiKey, or with the device's fingerprint or face unlock. The browser only uses a key on the domain it was registered on, so a fake site cannot use it.

```yaml
selfservice:
  methods:
    webauthn:
      enabled: true
      config:
        passwordless: false
        rp:
          display_name: Superphenix
          id: <console-domain>
          origins:
            - https://<console-domain>
```

| Field | Effect |
|-------|--------|
| `enabled` | Turns the method on |
| `config.passwordless` | Keep it `false`, so a key stays a second factor |
| `config.rp.display_name` | Name shown in the browser prompt |
| `config.rp.id` | Domain that keys are bound to |
| `config.rp.origins` | Origins allowed to use the keys |

The identity schema sets `credentials.webauthn.identifier` on `email`. If you use a custom schema, keep this setting: without it, Kratos refuses to save a new key.

Browsers only allow WebAuthn on HTTPS origins, or on `localhost`.

!!! warning "Choose `rp.id` before users enroll"
    If `rp.id` changes, every registered key stops working and users must enroll again.

!!! warning "Do not set `passwordless: true`"
    The console does not support passwordless login. Users who registered a key as a second factor can no longer sign in with it, and the login page has nothing to offer them.

To enroll, a user opens **Security keys** in **Account settings**, enters a name, selects **Add security key**, and confirms on the key or device. A user can register several keys and remove each one from the same section.

[WebAuthn in the Kratos documentation](https://www.ory.sh/docs/kratos/mfa/webauthn-fido-yubikey) describes the credential.

## Lookup secrets

Lookup secrets are one-time backup codes. They are meant for users who lose access to their usual second factor.

```yaml
selfservice:
  methods:
    lookup_secret:
      enabled: true
```

The method has no other field.

To enroll, a user opens **Backup codes** in **Account settings**, selects **Generate new backup codes**, stores the 12 codes, and selects **Confirm backup codes**. Each code works once.

Enable this method alongside TOTP or WebAuthn, so users can get back in without an administrator.

## Sign in with a second factor

After the password, the console shows **Two-step verification** with every method the user enrolled. The user completes one of them. **Use a different account** signs out.

Sessions already open when a user enrolls stay valid until they expire.

When a session is older than `privileged_session_max_age`, **Account settings** asks the user to sign in again before they change a factor. The default is 15 minutes.

## Reset a second factor

If a user loses their device and backup codes, remove the factor with the Kratos admin API. The user then signs in with their password and can enroll again.

```bash
curl -X DELETE "$KRATOS_ADMIN_URL/admin/identities/<identity-id>/credentials/totp"
curl -X DELETE "$KRATOS_ADMIN_URL/admin/identities/<identity-id>/credentials/webauthn"
curl -X DELETE "$KRATOS_ADMIN_URL/admin/identities/<identity-id>/credentials/lookup_secret"
```

## Disable a method

Kratos keeps requiring a second factor from a user who enrolled one, even if you disable that method. A user whose only factors use the disabled method cannot sign in, and the console tells them to contact an administrator.

[Reset their second factors](#reset-a-second-factor) before you disable a method, or keep it enabled.

## Other Kratos methods

Kratos has other methods that the console has not been validated with, so do not enable them:

| Method | Field |
|--------|-------|
| Email code as a second factor | `selfservice.methods.code.mfa_enabled` |
| Passkeys | `selfservice.methods.passkey` |

The [one-time login code](mfa-and-recovery.md#one-time-login-codes) is a different feature: it replaces the password and is not a second factor.
