# Hardware requirements

<div class="justify" markdown>

Hardware planning for Superphenix starts from how you deploy availability zones and storage relative to compute, as described in [Deployment topology](deployment-topology.md). The same **cluster** can imply very different server counts and configurations depending on whether you run a **hyperconverged** stack (storage and virtualization together) or a **decoupled** stack (dedicated storage and dedicated virtualization clusters).

- **[Hyperconverged](#hyperconverged-setup)** — Storage and virtualization on the same nodes. Size hosts for combined Ceph and hypervisor needs, plus headroom for failure and recovery.
- **[Decoupled](#decoupled-setup)** — Requirements are split by role:
    - **[Storage node](#storage-node-setup)** — Dedicated Ceph / storage tier in a decoupled topology. Same hardware floors as hyperconverged storage roles, sized for OSD throughput and replication.
    - **[Virtualization nodes](#virtualization-nodes-setup)** — Dedicated hypervisor tier in a decoupled topology. Same CPU, RAM, and boot-disk expectations as hyperconverged compute roles, sized for VM density and migration.

!!! important "Choose your topology first"

    Decide which **deployment topology** you want (hyperconverged or decoupled) **before** sizing hardware. The [hardware requirements](#hardware-requirements) tabs below depend on that choice.

Deployment topology is the main factor that influences the requirements:

- **Hyperconverged** — Each node contributes to both storage and virtualization. Disk, CPU, and memory requirements are **combined** on the same machines: size hosts for the sum of what the Ceph storage and the hypervisor need, plus headroom for failure and recovery
- **Decoupled** — Requirements **split by role**. The storage tier must satisfy Ceph expectations for OSD throughput, replication, and recovery; the virtualization tier is sized separately for VM density, live migration, and control-plane overhead. You plan distinct footprints for storage hosts, for hypervisor hosts, and for the **management cluster** that runs the platform control plane (see [Management cluster (decoupled)](#management-cluster-decoupled))

!!! warning "Multi-AZ and disaster recovery"

    If you deploy **multiple availability zones** and expect **disaster recovery** between them, plan **additional capacity** on each AZ beyond steady-state workload. You need room for **cross-AZ backup and replication** traffic and retention. When an AZ is impaired, you also need room for **absorbing or restarting workloads** that you fail over or relocate from another zone. Without that margin, a zone sized only for its local peak can become overloaded during recovery or when it must temporarily carry part of a neighbor’s load.

---

## Alignment with Ceph

Superphenix relies on Ceph for block and distributed storage. Treat the official documentation as authoritative for storage nodes:

- [Ceph Hardware Recommendations](https://docs.ceph.com/en/latest/start/hardware-recommendations/) — CPU per OSD (especially with NVMe), RAM and `osd_memory_target` headroom, OS vs data devices, enterprise-class SSDs/NVMe and endurance, minimum OSD sizes, and network bandwidth so replication and client I/O do not contend
- [Ceph network configuration reference](https://docs.ceph.com/en/latest/rados/configuration/network-config-ref/) — **Public** vs **cluster** networks, separating client traffic from OSD heartbeat, replication, and recovery

For production performance, prefer **enterprise-tier** SSDs or NVMe suitable for sustained writes and failure handling, consistent with Ceph’s guidance to avoid consumer-grade drives under heavy or mixed workloads.

!!! warning "Choose your disks carefully"

    Deploying Ceph on **consumer-grade SSDs** can lead to reduced performance and high latency. Ceph is very **sensitive** to how disks acknowledge writes.
    Always make sure the disks you select are **fit** for intensive storage usage. Running high-I/O workloads on consumer SSDs can also wear them out quickly.

---

## Hardware requirements {#hardware-requirements}

Use the **Minimal**, **Recommended**, and **Optimal** tabs below to compare tiers.

- **Minimal** — Floor for labs and early validation; not a long-term production target on its own
- **Recommended** — Default production-oriented sizing for typical deployments
- **Optimal** — More headroom, higher-bandwidth networking, for when you expect dense storage, large VM counts, aggressive recovery SLAs, or rapid growth

### Hyperconverged setup {#hyperconverged-setup}

=== "Minimal"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Physical servers with **disks integrated** in the chassis |
    | **Node count** | 1 |
    | **RAM** | ≥ **32 GiB** per server |
    | **CPU cores** | ≥ **8** |
    | **CPU architecture** | **x86-64** with **Intel VT-x** or **AMD-V** enabled in firmware on hypervisor nodes |
    | **Disks (storage)** | ≥ **1** raw disk per node where storage services run; this can't be the boot disk |
    | **NIC / link speed** | **10 Gb/s** Ethernet |
    | **Boot / OS** | Fast enterprise SSD acceptable |
    | **Storage media** | **Enterprise** SSD or NVMe |
    | **MTU** | 1500 |

=== "Recommended"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Physical servers with **disks integrated** in the chassis |
    | **Node count** | 3 |
    | **RAM** | On the order of **512 GiB** for nodes with a lot of VMs; also plan roughly **1 GiB RAM per 1 TiB** of **Ceph-managed** capacity (plus Ceph OSD/daemon RAM per upstream guidance) |
    | **CPU cores** | ≥ **32** |
    | **CPU architecture** | **x86-64** with **Intel VT-x** or **AMD-V** enabled in firmware on hypervisor nodes |
    | **Disks (storage)** | ≥ **3** raw disks per node |
    | **NIC / link speed** | **2x25Gb/s** through active/active bonding |
    | **Boot / OS** | **2× NVMe in RAID 1** for OS |
    | **Storage media** | Enterprise disks, NVMe for VM storage, and HDDs for backups |
    | **MTU** | 9000 |

=== "Optimal"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Redundant PSUs and clear **failure-domain** separation (rack/row) where possible |
    | **Node count** | 6 |
    | **RAM** | Extra headroom for growth, peak recovery, and large OSD counts; align with Ceph guidance for **mon/mgr** RAM as the cluster grows |
    | **CPU cores** | **≥ 96** on nodes with very high VM density; favor **higher clock** |
    | **CPU architecture** | **x86-64** with **Intel VT-x** or **AMD-V** enabled in firmware on hypervisor nodes |
    | **Disks (storage)** | ≥ **8** raw disks per node |
    | **NIC / link speed** | 2 NICs with **dual 25Gb/s ports** (active/active bonding), with 2 ports dedicated to the storage and 2 dedicated to the data |
    | **Boot / OS** | **2× NVMe in RAID 1** for OS |
    | **Storage media** | Enterprise disks, NVMe for VM storage, and HDDs for backups, with high DWPD |
    | **MTU** | 9000 |

### Decoupled setup {#decoupled-setup}

#### Storage node {#storage-node-setup}

=== "Minimal"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Physical servers with **disks integrated** in the chassis |
    | **Node count** | 3 |
    | **RAM** | ≥ **80 GiB** per server |
    | **CPU cores** | ≥ **16** |
    | **Disks (storage)** | ≥ **8** raw disk per node |
    | **NIC / link speed** | **10 Gb/s** Ethernet |
    | **Boot / OS** | Fast enterprise SSD acceptable |
    | **Storage media** | **Enterprise** SSD or NVMe |
    | **MTU** | 1500 |

=== "Recommended"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Physical servers with **disks integrated** in the chassis |
    | **Node count** | 6 |
    | **RAM** | ≥ **128 GiB** per server |
    | **CPU cores** | ≥ **32** |
    | **Disks (storage)** | ≥ **16** raw disk per node |
    | **NIC / link speed** | **2x25Gb/s** through active/active bonding |
    | **Boot / OS** | Fast enterprise SSD acceptable |
    | **Storage media** | **Enterprise** SSD or NVMe |
    | **MTU** | 9000 |

=== "Optimal"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Physical servers with **disks integrated** in the chassis |
    | **Node count** | 12 |
    | **RAM** | ≥ **128 GiB** per server |
    | **CPU cores** | ≥ **32** |
    | **Disks (storage)** | ≥ **16** raw disk per node |
    | **NIC / link speed** | 2 NICs with **dual 25Gb/s ports** (active/active bonding), with 2 ports dedicated to the storage and 2 dedicated to the data |
    | **Boot / OS** | Fast enterprise SSD acceptable |
    | **Storage media** | **Enterprise** SSD or NVMe |
    | **MTU** | 9000 |

#### Virtualization nodes {#virtualization-nodes-setup}

=== "Minimal"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Physical servers |
    | **Node count** | 1 |
    | **RAM** | ≥ **32 GiB** per server |
    | **CPU cores** | ≥ **8** |
    | **CPU architecture** | **x86-64** with **Intel VT-x** or **AMD-V** enabled in firmware on hypervisor nodes |
    | **NIC / link speed** | **10 Gb/s** Ethernet |
    | **Boot / OS** | Fast enterprise SSD acceptable |
    | **MTU** | 1500 |


=== "Recommended"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Physical servers |
    | **Node count** | 3 |
    | **RAM** | On the order of **1 TiB** for nodes with a lot of VMs; also plan roughly **1 GiB RAM per 1 TiB** of **Ceph-managed** capacity (plus Ceph OSD/daemon RAM per upstream guidance) |
    | **CPU cores** | ≥ **32** |
    | **CPU architecture** | **x86-64** with **Intel VT-x** or **AMD-V** enabled in firmware on hypervisor nodes |
    | **NIC / link speed** | **2x25 Gb/s** (or faster) for inter-node traffic and storage access |
    | **Boot / OS** | **2× NVMe in RAID 1** for OS |
    | **MTU** | 9000 |

=== "Optimal"

    | Aspect | Specification |
    |--------|---------------|
    | **Chassis** | Redundant PSUs and clear **failure-domain** separation (rack/row) where possible |
    | **Node count** | 6 |
    | **RAM** | Extra headroom for growth, peak recovery, and large OSD counts; align with Ceph guidance for **mon/mgr** RAM as the cluster grows |
    | **CPU cores** | **≥ 96** on nodes with very high VM density; favor **higher clock** |
    | **CPU architecture** | Same as recommended |
    | **NIC / link speed** | 2 NICs with **dual 25Gb/s ports** (active/active bonding), with 2 ports dedicated to the storage and 2 dedicated to the data |
    | **Boot / OS** | Enterprise disks, NVMe for VM storage, and HDDs for backups |
    | **MTU** | 9000 |

### Management cluster (decoupled) {#management-cluster-decoupled}

In a **decoupled** topology, the **management cluster** is the small **Kubernetes** cluster that hosts the Superphenix control-plane and operational services **separate** from your storage and workload virtualization nodes. It does not replace sizing for Ceph or hypervisors; it is an additional slice of machines sized for API controllers, GitOps, monitoring, and related components at modest density.

=== "Minimal"

    | Aspect | Specification |
    |--------|---------------|
    | **Node count** | **1** |
    | **CPU cores** | **4** per node |
    | **RAM** | **16 GiB** per node |

=== "Recommended"

    | Aspect | Specification |
    |--------|---------------|
    | **Node count** | **3** |
    | **CPU cores** | **4** per node |
    | **RAM** | **16 GiB** per node |

### Recommendations {#recommendations}

Plan capacity with horizontal growth in mind: Superphenix scales by **adding nodes**, so when compute nodes or storage nodes become overloaded, expanding the cluster with additional nodes is often the safest and most predictable way to recover headroom. 

How large **virtualization** nodes are should still depend on **how many VMs** (and other workloads, such as databases, web servers, and inference services) you run and what each VM requests. **KSM** can reduce effective RAM usage, but treat it as an optimization rather than a sizing baseline. It is enabled by default on all nodes to deduplicate memory between VMs.

Node fleets also do not need to be perfectly uniform: you can safely operate clusters with **mixed node configurations**, as long as overall capacity and failure-domain planning are respected.

You do not need to get the exact sizing of your clusters right the first time. Superphenix uses the Kubernetes scheduling engine to place workloads across available CPU and RAM on each node as efficiently as possible.

</div>
