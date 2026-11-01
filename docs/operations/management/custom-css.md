# Custom CSS

The console theme is a stylesheet of CSS custom properties. Set `themeOverride` to replace the built-in override file. The variables you can set, and their defaults, are in the [console theme override template](https://github.com/super-phenix/console-ui/blob/main/public/styles/theme-override.template.css). [Theming](https://github.com/super-phenix/console-ui/blob/main/docs/theming.md) describes how those variables apply to the console.

## Set the override

Add the stylesheet and [upgrade the release](../applying-configuration-changes.md#apply-a-change).

```yaml
management:
  systemConfiguration:
    apps:
      superphenix-console:
        values:
          config:
            themeOverride: |
              html {
                --primary-50: #1e88e5;
              }
```

Tokens are declared on `html`. Set only the ones you want to change.

The console tells browsers to cache CSS for one year. After a sync, reload the page so the browser fetches `theme-override.css` again.
