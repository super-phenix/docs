# Introduction

## About the name

The project is named **Superphenix** (SPX) after the [Superphénix](https://en.wikipedia.org/wiki/Superph%C3%A9nix) nuclear power plant in France. The name is a nod to building something ambitious and innovative on open, sovereign infrastructure. We spell the project Superphenix (without the accent) so it works on all keyboard layouts.

## What is Superphenix?

Superphenix is an **open-source, cloud-native** stack to run a **Cloud Service Provider (CSP)** on your own infrastructure. It was designed to rebuild a CSP platform from scratch using **Kubernetes** as the orchestrator.

A CSP delivers on-demand, scalable compute, storage, and applications. The usual layers are:

- **IaaS**: Infrastructure as a Service (VMs, block storage, networks...)
- **PaaS**: Platform as a Service (e.g. Kubernetes, databases)
- **SaaS**: Software as a Service (applications)

Superphenix focuses on all those layers to provide **high resiliency**, **high availability**, **high performance** services to the end customers of the platform.

To install a first cluster, see [Getting started](installation/getting-started.md). For complete and advanced deployment paths (all installation modes and operating patterns), see the [deployment guide](installation/deployment-guide.md).

## Summary of features

Superphenix delivers a full cloud stack with the following capabilities:

- **Hypervisor**: Virtual machines with live migration, snapshots, and node autoscaling
- **Storage**: Block, file, and S3-compatible storage with replication and disaster recovery
- **Software-defined network**: VPCs, NAT gateways, BGP, load balancers, QoS, and firewalling
- **PaaS**: Kubernetes as a Service (KaaS) for tenant clusters
- **SaaS**: Ready-to-run services such as databases, Harbor, GitLab, Nextcloud
- **GitOps**: Installation, upgrades, and resource provisioning driven by Git
- **Web console**: Multi-tenant console to manage resources across multiple AZs from a single interface
- **Backup and disaster recovery**: Cross-AZ mirroring, disk and VM backups, and automated disaster recovery

For more detail, see the [Features](features/index.md) section.

## Why Kubernetes?

Kubernetes is a container orchestrator, not a VM orchestrator. Using it as the core of a **cloud-native** CSP brings:

- **Automation**: Declarative APIs, GitOps, and a single control plane
- **Unified operations**: Same tooling for scheduling, monitoring, and upgrades
- **Ecosystem**: **CNI** and **CSI** plugins and operators from the **CNCF** ecosystem already solve many integration problems
- **Expertise**: Teams that already run Kubernetes can operate the CSP stack with the same mindset

The trade-off is adapting Kubernetes to VMs, storage, and CSP-style networking. Superphenix does that by combining a multitude of **open source projects** into one coherent, cloud-native platform.

## Who is Superphenix for?

Superphenix can be used for very different use cases:

- **At scale**: For **actors willing to build their own cloud platform** across **multiple datacenters and regions**. Deploy several AZs, group them into regions, mirror data and backups between AZs, and operate everything from a single interface.
- **Single datacenter**: Run one or more AZs in **one datacenter**. Ideal for MSPs, enterprises, or labs that want a full CSP stack without multi-site complexity.
- **Single rack**: Superphenix can run in a **single rack** for small actors, labs, or even **at home**. Evaluate the stack, learn the platform, or host a small private cloud on minimal hardware.

If your need is **independence** and **total control** of your infrastructure to do **SaaS, PaaS and IaaS**, Superphenix should cover most of your use cases. And if it doesn't, feel free to share why with us so we can improve the project!

## Do I need to know Kubernetes to install Superphenix?

Superphenix uses Kubernetes under the hood, but you **do not** need Kubernetes knowledge to install or run a standard deployment. 

With that said, it isn't useless to be knowledgeable about Kubernetes. Operators who already know Kubernetes can go further: extending the platform, debugging issues, and operating Superphenix in more advanced ways.