# Installing GPU nodes

Installing Talos Linux on **GPU nodes** is similar to the regular OS installation, with the exception of a few extra steps to ensure hardware compatibility. Depending on the usage you will make of your GPUs, you will need to setup the underlying Talos OS accordingly.

This guide covers the configuration of Talos with the **NVIDIA GPU Operator** (and/or the **NVIDIA Device Plugin for Kubernetes**).


## GPU workload configs
There are currently **3 main ways** of making an NVIDIA GPU available to workloads:

- **`container`**: GPU is used by ordinary **Kubernetes containers**.
- **`vm-passthrough`**: an entire physical GPU is assigned to **one KubeVirt VM**.
- **`vgpu`**: one physical GPU is partitioned into multiple virtual GPUs and assigned to **multiple VMs**.

Read more about these workload configs in the [official NVIDIA documentation](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-operator-kubevirt.html#configure-worker-nodes-for-gpu-operator-components).

Choosing how you make your GPUs available will determine the way you configure your Talos nodes. Below is a simplified summary of the steps needed to take for each GPU mode.

### `Container`
- Include the **NVIDIA OSS drivers** in your Talos installation image;
- Expose the GPU hardware to your overlaying Kubernetes cluster by deploying either:
    - the NVIDIA **k8s-device-plugin** (fewer features, container mode only, works out of the box)
    - or the NVIDIA **gpu-operator** (more features, extra components, supports all 3 modes, but needs a patch to work with Talos in container mode).

This guide covers the **Device Plugin** variant for container mode.

### `VM-Passthrough`
- Configure the **OS** and **rebind drivers**;
- Deploy the **GPU Operator** in `vm-passthrough` mode;
- Configure the **Kubevirt** CRD to set your GPUs as permitted devices.

### `vGPU`
- Similar to `VM-Passthrough`, but includes the building and hosting of your own NVIDIA vGPU image; requires an **NVIDIA Enterprise account** with a subscription and license.
- Support for the Talos operating system is unknown; this section is still in development.


## 1. Talos with Container workloads
### Step 1: Include NVIDIA drivers in Talos
1. Include the following 2 system extensions in your Talos image:
      - `nvidia-open-gpu-kernel-modules`
      - `nvidia-container-toolkit`
  
    You can do so either during installation, or through an Image Factory schematic upgrade.

2. Apply this patch to your GPU node's Talos machine configuration:
    ```yaml
    # Talos machine configuration patch
    machine:
      kernel:
        modules:
          - name: nvidia
          - name: nvidia_uvm
          - name: nvidia_drm
          - name: nvidia_modeset
      sysctls:
        net.core.bpf_jit_harden: 1
    ```

### Step 2: Deploy the NVIDIA k8s-device-plugin
1. Create a RuntimeClass that will allow pods to use the Talos NVIDIA extensions:
    ```yaml
    apiVersion: node.k8s.io/v1
    kind: RuntimeClass
    metadata:
      name: nvidia
    handler: nvidia
    ```
2. Add the NVIDIA Device Plugin repository and update it:
    ```sh
    helm repo add nvdp https://nvidia.github.io/k8s-device-plugin
    helm repo update
    ```
3. Install the NVIDIA Device Plugin:
    ```sh
    helm install nvidia-device-plugin nvdp/nvidia-device-plugin \
      --set=runtimeClassName=nvidia
    ```

Your GPU hardware should now be visible inside your Kubernetes cluster in the form of allocatable `nvidia.com/gpu` resources.

You can test the RuntimeClass by running the following **CUDA test pod**:
```sh
kubectl run \
  nvidia-test \
  --restart=Never \
  -ti --rm \
  --image nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda12.5.0 \
  --overrides '{"spec": {"runtimeClassName": "nvidia"}}' \
  nvidia-smi
```


## 2. Talos with VM-Passthrough workloads
### Step 1: Configure the Talos OS
- Enable **IOMMU** and **SVM Mode** in the BIOS:
    - On an AMD CPU:
        - `Advanced > AMD CBS > NBIO Common Options > IOMMU/Security > Enable`
        - `Advanced > CPU Configuration > SVM Mode > Enable`
- Set the `iommu=pt` **kernel parameter**, either during installation or through an Image Factory schematic upgrade. Get the image either:
    - From the web UI, following the on-screen instructions : [Talos Image Factory](https://factory.talos.dev/)
    - Or from the terminal:
        - Create a `customization.yaml` schematic file containing your extra kernel arguments:
          ```yaml
          customization:
            extraKernelArgs:
              - iommu=pt
          ```
        - Query the Image Factory to get an ID for your customization:
          ```sh
          curl -X POST --data-binary @customization.yaml https://factory.talos.dev/schematics
          # Returns a schematic ID
          ```
    - Then apply the image through an upgrade:
      ```sh
      talosctl --talosconfig talosconfig -n <node-IP> upgrade --image factory.talos.dev/metal-installer/<schematic-ID>:<Talos-version>
      ```
    - Patch your node's machine configuration to include the correct image:
      ```yaml
      # Talos machine configuration patch
      machine:
        install:
          image: factory.talos.dev/metal-installer/<schematic-ID>:<Talos-version>
      ```

### Step 2: Rebind all GPU devices to the `vfio-pci` driver
1. List all NVIDIA GPU **PCI devices** and note their IDs down:
  ```sh
  talosctl --talosconfig talosconfig -n <node-IP> get pcidevices | grep NVIDIA
  ```
2. Create a patch file containing a **PCIDriverRebindConfig** for each GPU device, using their ID as name:
  ```yaml
  apiVersion: v1alpha1
  kind: PCIDriverRebindConfig
  name: 0000:01:00.0
  targetDriver: vfio-pci
  ---
  apiVersion: v1alpha1
  kind: PCIDriverRebindConfig
  name: 0000:11:00.0
  targetDriver: vfio-pci
  # etc...
  ```
3. Include the following modules in the node's machine configuration:
  ```yaml
  # Talos machine configuration patch
  machine:
    kernel:
      modules:
        - name: vfio_pci
        - name: vfio_iommu_type1
  ```
4. Apply both patches to the node.

### Step 3: Deploy the NVIDIA gpu-operator
1. Label your GPU node for `vm-passthrough` mode:
    ```sh
    kubectl label node <node-name> --overwrite nvidia.com/gpu.workload.config=vm-passthrough
    ```
2. Create the `gpu-operator` namespace and set its Pod Security to `privileged`:
    ```sh
    kubectl create ns gpu-operator
    kubectl label --overwrite ns gpu-operator pod-security.kubernetes.io/enforce=privileged
    ```
3. Add the NVIDIA Helm repository and update it:
    ```sh
    helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
    helm repo update
    ```
4. Install the GPU Operator:
    ```sh
    helm upgrade --wait --install -n gpu-operator gpu-operator nvidia/gpu-operator \
      --set sandboxWorkloads.enabled=true \
      --set sandboxWorkloads.defaultWorkload=vm-passthrough \
      --set driver.enabled=false \
      --set toolkit.enabled=false \
      --set devicePlugin.enabled=false
    ```

### Step 4: Configure Kubevirt
Edit the Kubevirt CRD to add the following feature gates and permitted host devices:
```yaml
spec:
  configuration:
    developerConfiguration:
      featureGates:
      - GPU
      - DisableMDEVConfiguration
    permittedHostDevices:
      pciHostDevices:
      - externalResourceProvider: true
        pciVendorSelector: "10DE:2BB5"
        resourceName: "nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION"
```

Read more about the different fields in the official [Kubevirt documentation](https://kubevirt.io/user-guide/compute/host-devices/#listing-permitted-devices).

You can now give GPUs to your VMs. Proceed with installing the necessary drivers **inside your VM** to take full advantage of your GPU devices.

!!! warning "About live-migration"
    Bear in mind that Kubevirt VMs using PCI host devices (in our case, passthrough GPUs) **cannot be live-migrated**.


## 3. Talos with vGPU workloads
NVIDIA vGPU support for the Talos operating system is unknown; this section is still in development.


## Relevant documentation
Talos documentation: [NVIDIA GPU (OSS drivers) (v1.12)](https://docs.siderolabs.com/talos/v1.12/configure-your-talos-cluster/hardware-and-drivers/nvidia-gpu)  
NVIDIA documentation: [Installing the NVIDIA GPU Operator (v26.7)](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html)