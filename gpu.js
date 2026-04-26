export async function initWebGPU() {
    if (!navigator.gpu) {
        throw new Error('WebGPU is not supported (navigator.gpu is missing)');
    }

    const canvas = document.getElementById('gpu-canvas');
    if (!canvas) {
        throw new Error('Missing canvas element with id "gpu-canvas"');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('Failed to acquire a GPU adapter');
    }

    const device = await adapter.requestDevice();

    const context = canvas.getContext('webgpu');
    if (!context) {
        throw new Error('Failed to acquire a WebGPU context from canvas');
    }

    const format = navigator.gpu.getPreferredCanvasFormat();

    function configureCanvas() {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        context.configure({
            device: device,
            format: format,
        });
    }

    configureCanvas();
    window.addEventListener('resize', configureCanvas);

    return { device, context, canvas, format };
}


let lastTime = performance.now();
let frames = 0;
function updateFpsInfo(now)
{
    frames++;
    const delta = now - lastTime;
    if (delta >= 1000) {
        const fps = (frames * 1000) / delta;

        console.log("fps: ", fps.toFixed(1));
        const fpsEl = document.getElementById('fps');
        if (fpsEl) {
            fpsEl.textContent = `fps: ${fps.toFixed(1)}`;
        }

        frames = 0;
        lastTime = now;
    }
}

export function renderFrame({device, context}) {
    function frame(now) {
        updateFpsInfo(now);

        const encoder = device.createCommandEncoder();
        const view = context.getCurrentTexture().createView();
        
        const pass = encoder.beginRenderPass({
            colorAttachments: [
                {
                    view,
                    clearValue: {r: 0.1, g: 0.2, b: 0.8, a: 1.0},
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
        });

        pass.end();

        device.queue.submit([encoder.finish()]);

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}
