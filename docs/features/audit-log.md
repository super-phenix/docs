# Audit Log

The audit log is the record of who changed what in an organization. The API gateway writes one event per request that can change state: the user behind it, the resource it targeted, the address it came from, the outcome and the HTTP status code. Organization admins read the log in the console under **Audit log**. Each user reads their own sign-ins and API token operations under **My account → Security activity**, whatever their role.

---

## Event Lifecycle

The gateway records events on its own. Nothing runs inside your VMs, and no resource setting turns the log on or off.

1. A request reaches an audited route and passes authentication. The gateway stores the event with status `attempted`.
2. The handler runs.
3. On the way out, the gateway completes the event: `success` when the HTTP status is below 400, `failed` otherwise. A crash inside the handler counts as `failed` with status 500.

An event that stays `attempted` means the gateway never wrote the outcome, for example because the process stopped mid-request. The console shows it as **Attempted**.

Audited routes are the write requests: create, update, delete and the action endpoints of each product, plus sign-ins, API tokens, invitation codes, memberships, IAM groups, projects, organizations and the retention setting itself. Reads leave no event. A request refused before authentication leaves no event either, so a wrong password never shows up: Kratos rejects it before the gateway sees the request.

A failed write to the log never blocks the request. The gateway logs the error, increments a Prometheus counter and completes the request as usual.

---

## Event Fields

| Field                     | Description                                                                                                                  |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------- |
| `id`                      | UUID of the event.                                                                                                           |
| `organizationId`          | Organization the request was scoped to. Empty for user-scoped events such as sign-ins.                                       |
| `projectId`               | Project from the request path, when there was one.                                                                           |
| `eventType`               | `<resource>.<action>`, for example `instance.stop`.                                                                          |
| `resourceType`            | The resource part of the event type.                                                                                         |
| `resourceId`              | ID of the resource the request targeted. Empty on a creation that failed.                                                    |
| `userId`, `userEmail`     | Who sent the request. The email is the one on file when the event was written.                                               |
| `authType`                | How the caller authenticated: `JwtBearer`, `ApiTokenAuth` or `KratosSession`.                                                |
| `sourceIp`                | Client address, read from `CF-Connecting-IP`, then the first hop of `X-Forwarded-For`, then `X-Real-IP`, else the TCP peer. |
| `status`                  | `attempted`, `success` or `failed`.                                                                                          |
| `statusCode`              | HTTP status returned to the caller.                                                                                          |
| `requestId`               | Request ID assigned by the gateway, the same one you find in its logs.                                                       |
| `startedAt`, `completedAt` | When the request passed authentication and when the response left.                                                          |

The event holds no request body, no response body and no user agent.

---

## Event Types

The **Event** filter in the console lists the types your platform version declares, grouped by resource. As of this release:

| Resource                                                                                   | Actions                                                                                                               |
| :----------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `instance`                                                                                 | `create`, `update`, `delete`, `start`, `stop`, `stop-force`, `restart`, `container-disk.mount`, `container-disk.unmount` |
| `vmSnapshot`                                                                               | `create`, `delete`, `restore`, `clone`                                                                                |
| `disk`                                                                                     | `create`, `update`, `delete`, `unmount`                                                                               |
| `snapshot`, `baas`, `bucket`, `vpc`, `subnet`, `eip`, `loadBalancer`, `securityGroup`     | `create`, `update`, `delete`                                                                                          |
| `kaas`                                                                                     | `create`, `update`, `delete`, `reinstall-essentials`                                                                  |
| `ssh`                                                                                      | `create`, `delete`                                                                                                    |
| `organization`                                                                             | `create`, `update`, `delete`, `transfer`                                                                              |
| `project`                                                                                  | `save`, `delete`                                                                                                      |
| `iam.group`                                                                                | `save`, `duplicate`, `delete`                                                                                         |
| `iam.member`                                                                               | `invite`, `remove`                                                                                                    |
| `audit-log.retention`                                                                      | `update`                                                                                                              |
| `session`                                                                                  | `login` (user-scoped)                                                                                                 |
| `api-token`                                                                                | `create`, `delete` (user-scoped)                                                                                      |
| `user.invite-code`                                                                         | `regenerate` (user-scoped)                                                                                            |

User-scoped events carry no organization. They show up in each user's **Security activity** tab and never in the organization log.

Events whose type a later version no longer declares stay in the table until retention removes them. Pick **Retired event types** in the **Event** filter to list them.

---

## Retention

Retention is a number of days per organization. A sweeper inside the gateway hard-deletes older events every hour, in batches, and a Postgres advisory lock keeps a single replica sweeping at a time. Nothing archives deleted events.

Platform operators set the bounds in the `auditLog` block of the superphenix-api chart values:

```yaml
auditLog:
  enabled: true
  retention:
    defaultDays: 90   # organizations without an override
    minDays: 1        # bounds of the per-organization override
    maxDays: 365
    userDays: 90      # user-scoped events: sign-ins, tokens
  garbageCollection:
    enabled: true
    interval: 1h
    timeout: 10m
    batchSize: 5000
```

An organization admin overrides `defaultDays` for their organization from the **Edit** button next to **Retention** in the console, within `minDays` and `maxDays`. Lowering the value deletes the events beyond the new limit at the next sweep. Resetting to default removes the override. User-scoped events follow `userDays`, and the console offers no way to change that.

With `enabled: false` the gateway records nothing.

---

## Permissions

Both permissions are organization-scoped. There is no project-level audit permission.

| Permission                  | Grants                         | Held by                                                          |
| :-------------------------- | :----------------------------- | :--------------------------------------------------------------- |
| `OrganizationAuditLogRead`  | Read the log and the retention | Organization owner, `AuditLogFullAccess`, `AuditLogReadOnly`     |
| `OrganizationAuditLogWrite` | Change the retention           | Organization owner, `AuditLogFullAccess`                         |

`AuditLogFullAccess` and `AuditLogReadOnly` are permission sets you attach to IAM groups. The predefined **Admin** group ships with `AuditLogFullAccess`. Give auditors a group with `AuditLogReadOnly` so they read the log without touching retention. The **Audit log** entry in the sidenav appears only for users who hold the read permission.

For the console walkthrough, read [Read the audit log](../user-guides/organization/audit-log.md).
