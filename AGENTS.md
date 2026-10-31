# AGENTS.md

This repository is the Superphenix documentation site ([docs.superphenix.net](https://docs.superphenix.net)). It is a Zensical site, not an application. Change Markdown, navigation, and theme assets. Leave product behavior undescribed when you cannot confirm it from an existing page.

## Repository

| Path | Role |
|------|------|
| `docs/` | Page source. `zensical.toml` sets `docs_dir = "docs"`. |
| `zensical.toml` | Site name, `nav`, Markdown extensions, theme, redirects, blog. |
| `docs/stylesheets/extra.css` | Global styles (justified body text, logos, card tweaks). |
| `overrides/main.html` | Theme override. It only extends `base.html`. |
| `docs/assets/` | Logos and screenshots. |
| `docs/sketch/` | Diagram sources (`.drawio`) and the SVGs pages embed. |
| `docs/blog/` | Blog posts and `.authors.yml`. |
| `site/` | Build output. Gitignored. CI publishes it. Never edit it. |

Local preview:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install zensical
zensical build -f zensical.toml
zensical serve -f zensical.toml   # http://localhost:8000
```

After a content change, build or serve and open the affected pages. Confirm the nav entry, internal links, admonitions, tabs, tables, and images. A page missing from `nav` is not reachable, except blog posts picked up by the blog plugin.

CI on `main` runs `zensical build --config-file zensical.toml` and publishes `site/`. The custom domain comes from `docs/CNAME`.

## Where a page belongs

Match the section. Do not put a console click-path in Features, or a concept essay in User guides.

| Section | Job | Shape |
|---------|-----|--------|
| Home (`home.md`) | What Superphenix is, who it is for, where to go next. | Short sections, bold terms, links into the rest of the site. |
| Architecture | How the platform is organized: clusters, AZs, regions, organizations, projects, topology, hardware, network. | Concept first. Open with what the page decides. Comparison tables. No console steps. |
| Installation | How to install. Getting started is the 3-node lab. The deployment guide is the full path (management plane, OS, AZ). | Numbered procedures, prerequisites, Linux and Windows command tabs. |
| Features | What a product does, its fields, and its constraints. | Definition, behavior, tables, a link to the user guide. |
| User guides | Console walkthroughs a tenant can follow. | Sidenav path, numbered steps, one screenshot per meaningful step, `docs-demo-*` names. |
| Operations | Day-2 work for operators| Procedure or constraint, with the failure mode stated. |
| Blog | Narrative posts. | YAML frontmatter (`date`, `authors`, optional `links`). Authors live in `docs/blog/.authors.yml`. |
| Contributing, Enterprise support | Short standalone pages already in `nav`. | Do not expand them into guides. |

A new page needs a `nav` entry in `zensical.toml` next to its siblings. A rename or move needs an entry under `[project.plugins.redirects.redirect_maps]` from the old path to the new one (`"index.md" = "home.md"` is the existing example). Internal links are relative Markdown links. When another page should land on a subsection, give that heading an explicit anchor (`## Hardware requirements {#hardware-requirements}`).

Section indexes use a card grid:

```markdown
<div class="grid cards" markdown>

-   :lucide-server:{ .lg .middle } **Compute**

    ---

    One sentence on what the reader will find.

    [:octicons-arrow-right-24: Compute](compute/index.md)

</div>
```

Icons already in use include `lucide-server`, `lucide-hard-drive`, `lucide-network`, `lucide-layers`, `lucide-terminal`, `lucide-bot`, `lucide-cloud`, `lucide-split`, `lucide-users`, and `:octicons-arrow-right-24:`.

## Voice

Write American English, in complete sentences, for someone who will follow the page on real hardware or in the console. You're writing for the users and for the administrators of the platform.

- Define a term in bold the first time a page uses it, then use the short form.
- Architecture and operations speak in the declarative ("An availability zone is…"). Procedures speak to the reader ("Click **Create**").
- Open every page with one paragraph that says what the page is for and links to the pages that sit beside it.
- State the constraint and the consequence together. Hardware and network pages do this with `!!! warning` and `!!! important`.
- Prefer the words already on the site. Use **Instance** when describing the console product, and **virtual machine** in user guides and in prose about the guest.
- Mark work that is not shipped yet with *Soon*, as the home page does for file storage, databases, and inference.
- Link upstream for Talos, Ceph, Helm, and Kubernetes instead of restating their manuals. Ceph's hardware and network docs are the authority for storage-node sizing.

Do not invent CLI flags, CRD fields, API names, UI labels, versions, default CIDRs, or support claims. If a page does not already state the fact, leave a gap or ask. Do not copy command output or screenshots from memory.

## Terminology

Use these names. They are the platform's, not generic cloud synonyms.

- **Superphenix** (SPX). The project name has no accent. The French plant Superphénix may keep the accent when the home page explains the name.
- **Superphenix cluster**: a Kubernetes cluster, typically Talos Linux, registered with a `Cluster` custom resource.
- **Availability zone (AZ)**: failure and placement domain for tenant resources. A stretched AZ stays near **2 ms** RTT. A **region** is only a label; it does not define peering or storage reach.
- **Hyperconverged**: storage and virtualization on the same cluster. **Decoupled**: separate storage and workload clusters. The management plane is either **inside an AZ** or on a **dedicated management cluster**.
- **Organization** and **project**: tenancy. Users belong to organizations and have roles on projects. Resources belong to a project and are placed in an AZ. One project may span AZs.
- **VPC**, **subnet**, **NAT gateway**, **Elastic IP (EIP)**, **security group**, **load balancer**. Each AZ ships with a `default` VPC and a `default` subnet; that subnet has no NAT gateway.
- **Disk**, **snapshot**, **backup**, **object storage**. Block and S3 are current; file is *Soon*.
- **Instance** / virtual machine on **KubeVirt**. **Kubernetes as a Service (KaaS)** for managed clusters.
- **Talos Linux** is the only officially supported OS. Getting started pins **Talos 1.12.6 or older** because newer versions hit a kernel bug that breaks the SDN. Do not bump that pin unless asked.
- **GitOps** (Argo CD) is how installs, upgrades, and many resources are applied. The **web console** is the tenant and operator UI.
- Networking stack names already used in Features: **Kube-OVN**, **Multus**, **Cilium**. Storage is **Ceph**.

Lab conventions, when a page needs an example: bootstrap host on the node switch, external interface `ext0` (same name on every node), network `192.168.1.0/24`, gateway `192.168.1.254`, demo objects prefixed `docs-demo-` (`docs-demo-vm`, `docs-demo-subnet`, `docs-demo-disk`). User-guide CIDRs already used include `10.20.0.0/24` against a `default` subnet of `10.10.0.0/16`.

## Markdown on this site

Zensical is configured for admonitions, details, content tabs, superfences, attr_list, emoji (Twemoji), and snippets. Write pages that use those extensions the way neighboring pages do.

- One `#` title, then `##` sections. Sentence case (`Hardware requirements`, `Create a virtual machine`). A feature page that already uses title-case section labels (`Run Strategies`) stays that way when you edit it.
- Admonition bodies are indented four spaces. Types in use: `note`, `tip`, `info`, `warning`, `important`, `example`. Optional title in quotes: `!!! warning "Choose your disks carefully"`.
- Collapsed details use `???`. Open-by-default details use `???+`, as getting started does for the `controlplane.yaml` example.
- Shell steps that differ by OS use tabs: `=== "Linux"` with `bash`, `=== "Windows"` with `powershell`. Sizing tables use `=== "Minimal"`, `=== "Recommended"`, and `=== "Optimal"`.
- Comparison and specification tables start with a bold **Aspect** or equivalent first column. Keep numeric columns specific (`≥ **32 GiB**`, `10 Gb/s`).
- Long reference pages may separate major sections with `---`.
- Code fences declare a language. Placeholders use angle brackets (`<node-ip>`, `<api-endpoint>`). Comments inside YAML say what the reader must change.
- Images use a descriptive alt string. Screenshots live in `docs/assets/screenshots/<area>/`. Diagrams are SVG from `docs/sketch/`, referenced by relative path. Attribute classes with attr_list (`{ .index-logo }`, `{ .rayshift-logo }`).

```markdown
!!! warning "NAT gateway traffic to a node"
    State what breaks, then what to do instead. Link the longer explanation.
```

```markdown
=== "Linux"

    ```bash
    talosctl kubeconfig .
    ```

=== "Windows"

    ```powershell
    talosctl kubeconfig .
    ```
```

## Editing rules

- Stay inside the task. A hardware-page edit does not need a new user guide, and a typo fix does not need a nav rewrite.
- When a heading that other pages link to changes, keep the `{#anchor}` or update every inbound link.
- Cross-link the pair: Features describe the object, User guides operate it, Architecture defines the scope, Operations cover cluster-level consequences.
- Limitations get a heading, the cause, who it affects, and the workaround. See `docs/operations/limitations.md`.
- Theme and CSS changes are global. Justified paragraphs and the dark-mode logo invert are intentional.
- Do not add dependencies beyond `zensical`. Do not commit `.venv/`, `site/`, or editor directories.
- Secrets stay out of pages. Document how to retrieve a credential; do not paste one.

## Knowledge retrieval

When a page needs a field, a default, or a behavior this site does not already state, read the product repo [super-phenix/superphenix](https://github.com/super-phenix/superphenix). A local checkout is often the sibling directory `../superphenix`. Issues and pull requests explain intent. The paths below are the reference for CRDs, chart values, and shipped defaults.

| Path | Read it for |
|------|-------------|
| `api/` | CRD shape. `api/operator/v1alpha1/` holds the Go types for `Cluster`, `Organization`, and `Project` (`*_types.go`). Rendered CRD YAML for those types is `components/system/superphenix-operator/crds/`. |
| `components/` | Helm chart values. Every chart has a `values.yaml`. `components/system/` is the platform (operator, API, controller, system chart). `components/dependencies/` is the bundled charts (CDI, Multus, KaaS, storage, GitOps, and the rest). Comments on each key are the contract for what an operator can set. |
| `config.go` | Hardcoded default configuration. `loadDefaults()` reads the `defaultConfig` YAML in that file, and user config overrides it. Controller defaults: `internal/superphenix-controller/pkg/config/config.go`. API defaults: `internal/superphenix-api/pkg/config/config.go`. |

Document a default only when `defaultConfig` or a chart `values.yaml` sets it. Leave credentials and internal addresses out of the page.

## Tests

If a CI is present, make sure the changes to the documentation are going to pass it.