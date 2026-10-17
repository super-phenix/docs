---
date: 2026-10-14
authors:
  - arthur-meyer
links:
  - Documentation:
      - Getting started: installation/getting-started.md
      - Architecture: architecture/index.md
      - Features: features/index.md
---

# Why we created Superphenix

![Superphenix](../../assets/spx.svg){ .index-logo }

At the end of 2023, a small cloud provider in France, Agora Calycé, decided to rebuild its infrastructure. Almost everything customers ran on sat on software the company did not own: VMware, NetApp, Veeam, Microsoft, and others. Those products work. The problem was depending on them for the whole business.

We wanted more autonomy and less dependence on foreign actors. The Broadcom situation and the rising prices were not helping.

A small provider does not have Amazon's or Google's budget. What it does have is proximity to its customers. The operational problems are still the same as the large clouds: automation, reliability, fast delivery, and a price that leaves a margin. Buying the stack from a few suppliers was the fast way to start. After years of that, there was no realistic way to leave. When VMware's prices jumped in 2024, most of the workload was still on VMware, and the margin was being set by companies thousands of times larger.

The other way to run a cloud is to own the software that sits on the hardware. The hardware is not the product. The product is what you can do with it, repeatedly, for customers. Reselling someone else's platform forever was not the plan Agora Calycé wanted to keep.

We knew we had the knowledge and the skills to go this way. Being at KubeCon in Chicago inspired us to start the work.

That is how we started working on Superphenix in January 2024.

## Why Kubernetes

Kubernetes was already in daily use. Internal applications ran on it, and customers bought Kubernetes clusters that the provider installed and maintained. GitOps, declarative configuration, and the usual monitoring stack were familiar. Extending that to the rest of the cloud was the interesting part: networks across datacenters, storage for large amounts of data, and hypervisors running virtual machines.

That last point is the awkward one. A cloud provider sells virtual machines. Kubernetes was built to run containers. The two are often described as opposites. The bet was that the API, the automation, and the projects around Kubernetes were more useful than starting from a traditional hypervisor and trying to bolt automation on afterwards.

The first design notes, written as a short manifest, set two rules. The platform would be built from open source projects, and work done on those projects would go back upstream: code, bug reports, and time spent with the maintainers. The same notes listed the gaps. Kubernetes does not, by itself, give you a hypervisor, a cloud network, or a storage system you can sell. It does not bill virtual machines, and it does not move a customer's workload from one availability zone to another. Those gaps are why Superphenix exists as a project, rather than as a pile of upstream charts installed side by side.

By building on Kubernetes, we could develop the project inside an ecosystem that already existed and was thriving. Instead of rebuilding everything from scratch, we could use Kubernetes-compatible projects and bring them into Superphenix easily.

## Giving the changes back

Several of the hard parts were missing upstream in the projects we had selected to build Superphenix. In theory we had everything we needed to build our cloud provider on Kubernetes, and yet we kept running into bugs and missing features, because what we were building was not common at all.

We decided to contribute in many ways to the projects we used, mainly by building features directly into the upstream projects.

## Where that left the project

The rule we used was to iterate quickly, break the lab often, and run our own services on the result.

The old platform did not disappear. Moving off it takes time, and some of it cannot be invisible: virtual machines have to be converted from VMware's format onto Superphenix, and data has to move. The first production piece was storage. New arrays, full of NVMe, running Talos, Rook, and Ceph, were serving block storage to the existing infrastructure about four months after the hardware arrived. Parts of that work were merged into Ceph.

A year later, we put the workload clusters into production to start moving VMs and Kubernetes clusters. That is also when we started open-sourcing the project. Until then it had been closed source, because we were not sure ourselves where we were going.

On 15 September 2026, we finally released Superphenix. Much had happened by then, and Agora Calycé was no longer the only user of the project. Other companies had taken it up, seeing the potential it had.

Now, we simply wish for the project to take off. And if you want to help us to that, try [installing Superphenix](../../installation/getting-started.md) and give us a star [on GitHub](https://github.com/super-phenix/superphenix) !
