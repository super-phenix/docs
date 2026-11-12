# Changing the ingress class

The console, the API, Kratos, and Argo CD publish their HTTP routes with no ingress class name. Kubernetes sends those routes to the IngressClass marked default on the management cluster.

On an availability zone, Traefik creates that class. The name is `traefik`, and the class is the cluster default. A dedicated management cluster uses the default class of the controller you installed there. [Configuring the management stack](../../installation/deployment-guide/installing-management/full-configuration.md) is the rest of the management values.

## Name a class {#name-a-class}

Set the same class on every route, then [upgrade the release](../applying-configuration-changes.md#apply-a-change). The class has to exist on the cluster before the routes answer.

```yaml
config:
  argocd:
    values:
      server:
        ingress:
          ingressClassName: <ingress-class>

management:
  systemConfiguration:
    apps:
      superphenix-console:
        values:
          ingress:
            className: <ingress-class>
      superphenix-api:
        values:
          ingress:
            className: <ingress-class>
      kratos:
        values:
          ingress:
            public:
              className: <ingress-class>
```

| Route | Value |
|-------|-------|
| Console | `apps.superphenix-console.values.ingress.className` |
| API | `apps.superphenix-api.values.ingress.className` |
| Kratos | `apps.kratos.values.ingress.public.className` |
| Argo CD | `config.argocd.values.server.ingress.ingressClassName` |

Read the class names with `kubectl get ingressclass`. The one marked default is the class these routes use while the fields above are empty.
