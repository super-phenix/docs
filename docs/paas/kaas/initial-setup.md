# Initial setup

For the *Kubernetes as a service* system to function, you need to pick and configure 2 DNS entries on your DNS server
for each AZ and set those entries in your configuration file. You need to define those domains for every AZ that your
*superphenix-api* deployment controlls.

```yaml
clusters:
  local:
    systemConfiguration:
      apps:
        superphenix-api:
          values:
            config:
              productsConfig:
                argoApp:
                  kubernetes:
                    azDomains:
                      # add domains for all AZs which are controlled
                      # by this superphenix-api instance
                      local:
                        external: "%s.kaas.local.example.org"
                        internal: "azs.my-region.example.org"
```

## External domain

This *wildcard* domain serves to build the URLs used to talk to KaaS controlplanes. For each new cluster an ingress is created where the `%s` part is replaced by the cluster's ID.
The DNS record needs to point to the public IP of your AZ.

!!! tip "No DNS?"
    Use **[nip.io](https://nip.io)** against your AZ's public IP, for example `%s.1.2.3.4.nip.io`.

## Internal domain

This domain is used by the kubernetes nodes to find their controlplane, even if the cluster was migrated to another AZ (in case of disaster recovery). The DNS record consists of a list containing
the public IPs of all AZs in your region. The internal proxy running on each KaaS node will check all listed AZs and forward requests to the one listening for the corresponding *external domain*.

!!! tip "No DNS?"
    You can use **[nip.io](https://nip.io)** against your AZ's public IP, for example `local.1.2.3.4.nip.io`.  
    Keep in mind that if you have multiple AZ's, the disaster recovery function will not work in this configuration.
