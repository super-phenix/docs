# Superphenix: Build Your Own Cloud on Kubernetes

![Superphenix](assets/SPX_black.svg){ .index-logo }

<div class="justify" markdown>

**Superphenix** (SPX) is an open-source, **cloud-native** project to build a **Cloud Service Provider (CSP)** on your own infrastructure using **Kubernetes**.

It turns Kubernetes into a platform capable of handling **virtual machines, networking, storage, and software** in the same way cloud providers do.

**Superphenix** gives you a full IaaS, PaaS, and SaaS platform built from open-source and cloud-native components. It can be deployed across multiple datacenters to form **availability zones** and **regions**.

</div>

## A few examples of what SPX has to offer

- **Hypervisor** — VMs, live migration, snapshots, node autoscaling
- **Storage** — Block, file and S3 storage with replication and disaster recovery
- **Software-defined network** — VPCs, NAT gateways, BGP, load balancers, QoS, firewalling
- **PaaS** — Kubernetes as a Service
- **SaaS** — Databases, Harbor, Gitlab, Nextcloud
- **GitOps** — Installs, upgrades, and resource provisioning via GitOps
- **Web Console** — Multi-tenant console to manage multiple AZs from one place
- **Backup and disaster recovery** — Cross-AZ mirroring, disk, VM and metadata backups, automated disaster recovery

## Philosophy

<div class="justify" markdown>

Superphenix was initially built at a **cloud service provider** that wanted more control over its own infrastructure, without having to rely on **proprietary** software and hardware with expensive licenses.

That is why the project aims to provide all the features a CSP needs to serve its customers with the **highest level** of availability and redundancy. Superphenix is designed to be deployed across multiple **datacenters** spread geographically over multiple **continents**.

The project authors chose to make it **open source** because we believe it can benefit **organizations of all sizes** that want to build their own cloud platform.

</div>

## Quick links

- [**Introduction**](introduction.md) — Goals, architecture, and design choices
- [**Features**](components/virtualization.md) — Virtualization, network, storage, and tooling
- [**Contributing**](contributing.md) — How to contribute code, docs, and feedback
