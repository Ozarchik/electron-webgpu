async function initWebGPU() {
    if (!navigator.gpu) {
        throw new Error("WebGPU not support");
    }

    const canvas = document.getElementById('gpu-canvas');

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const context = canvas.getContext('webgpu');

    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device: device,
        format: format,
    });

    return { device, context, format };
}

function render(device, context) {
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
            {
                view: textureView,
                clearValue: { r: 0.2, g: 0.4, b: 0.8, a:1.0 },
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    });

    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}

// module.exports = { initWebGPU, render };