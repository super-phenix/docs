# Default cloud-init

Instances created without a custom cloud-init receive the **default cloud-init**. The built-in one creates a `spx` user with passwordless `sudo`, sets a generated password that expires at first login, enables SSH password authentication, and points DNS at `1.1.1.1`.

You can replace it for every availability zone, for a single zone, or both. The console shows the default of the selected zone in the **CloudInit Configuration** card.

## Choose where to set it

The API picks the first value it finds:

1. `defaultCloudInit` on the zone entry, in `azs`.
2. `defaultCloudInit` at the top of the API configuration.

The top-level value has a built-in default. It cannot be empty: the API refuses to start if you set it to an empty string.

## Set the default

Add the keys and [upgrade the release](../applying-configuration-changes.md#apply-a-change). The example below sets a default for every zone, then overrides the DNS servers of the `paris-1` zone from [Add an availability zone](../adding-an-az.md). Repeat the keys that zone already has so the upgrade keeps them.

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-api:
        values:
          config:
            defaultCloudInit: |
              #cloud-config
              ssh_pwauth: true
              users:
                - name: spx
                  groups: sudo
                  sudo: ['ALL=(ALL) NOPASSWD:ALL']
                  shell: /bin/bash
              chpasswd:
                expire: true
                users:
                  - {name: spx, password: "<generated_password>", type: text}
            azs:
              paris-1:
                name: "Paris 1"
                controllerUrl: "https://controller.paris-1.example"
                authSecret: "replace-with-a-shared-secret"
                destination: "paris-1"
                defaultCloudInit: |
                  #cloud-config
                  ssh_pwauth: true
                  users:
                    - name: spx
                      groups: sudo
                      sudo: ['ALL=(ALL) NOPASSWD:ALL']
                      shell: /bin/bash
                  chpasswd:
                    expire: true
                    users:
                      - {name: spx, password: "<generated_password>", type: text}
                  write_files:
                    - path: /etc/systemd/resolved.conf.d/dns_servers.conf
                      content: |
                        [Resolve]
                        DNS=10.0.0.53
                      permissions: '0644'
                  runcmd:
                    - systemctl restart systemd-resolved
```

> **Important**  
> Keep the `<generated_password>` placeholder if users should sign in with a generated password.  
> Every occurrence is replaced with the same random password for each instance, which users read on the instance details page.

## Limitation: curly braces

The `superphenix-system` chart passes these values through the Helm `tpl` function, so Helm evaluates every `{{ }}` it finds. A `defaultCloudInit` that contains `{{ }}`, such as a cloud-init [Jinja template](https://cloudinit.readthedocs.io/en/latest/explanation/instancedata.html), makes the chart fail to render, and the upgrade stops with an error like `error calling tpl: cannot parse template`.

### Workaround: escape the braces

Wrap each `{{ }}` expression in a Helm raw string so Helm writes it unchanged:

```yaml
defaultCloudInit: |
  ## template: jinja
  #cloud-config
  hostname: {{`{{ v1.local_hostname }}`}}
```

The instance then receives `hostname: {{ v1.local_hostname }}`.

### Jinja templates and the generated password

With `## template: jinja` as the first line, cloud-init runs Jinja on the whole configuration when the instance boots, after the controller has inserted the generated password. The password can contain `{`, `%` and `#`, so a password that includes `{{`, `{%` or `{#` breaks the template, and the instance starts without its user. Protect the placeholder with a Jinja `raw` block:

```yaml
password: "{% raw %}<generated_password>{% endraw %}"
```

Configurations without `## template: jinja` are not affected.

## What changes for existing instances

The new default applies to instances created after the upgrade. Existing instances keep the cloud-init they already have.

## Upgrading from 0.9.x

The default cloud-init can only be changed in versions after 0.9.x. These versions also change how the API and the controllers exchange cloud-init, so when you upgrade from 0.9.x or earlier, upgrade the API and the controller of every availability zone together:

- With an API newer than 0.9.x and a controller on 0.9.x or earlier, instances receive the controller's built-in default. The zone default and users' custom cloud-init are ignored.
- With an API on 0.9.x or earlier and a controller newer than 0.9.x, creating an instance without a custom cloud-init fails.
