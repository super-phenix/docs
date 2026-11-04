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
> The first occurrence is replaced with a random password for each instance, which users read on the instance details page.

## What changes for existing instances

The new default applies to instances created after the upgrade. Existing instances keep the cloud-init they already have.

## Upgrading from 0.9.x

The default cloud-init can only be changed in versions after 0.9.x. These versions also change how the API and the controllers exchange cloud-init, so when you upgrade from 0.9.x or earlier, upgrade the API and the controller of every availability zone together:

- With an API newer than 0.9.x and a controller on 0.9.x or earlier, instances receive the controller's built-in default. The zone default and users' custom cloud-init are ignored.
- With an API on 0.9.x or earlier and a controller newer than 0.9.x, creating an instance without a custom cloud-init fails.
