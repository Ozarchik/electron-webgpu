const vertices = new Float32Array([
    0.0,  0.5,
   -0.5, -0.5,
    0.5, -0.5 
]);

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

export function createDefaultShader(device) {
    return device.createShaderModule({
        code: `
            @vertex
            fn vs(@location(0) pos: vec2f) -> @builtin(position) vec4f {
                return vec4f(pos, 0.0, 1.0);
            }

            @fragment
            fn fs() -> @location(0) vec4f {
                return vec4f(1.0, 0.5, 0.2, 1.0);
            }
        `,
    });
}

export function createVertexBuffer(device) {
    const vertexBuffer = device.createBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(vertexBuffer, 0, vertices);
    return vertexBuffer;
}

export function createRenderPipeline(device, shader, format) {
    return device.createRenderPipeline({
        layout: "auto",

        vertex: {
            module: shader,
            entryPoint: "vs",
            buffers: [
                {
                    arrayStride: 8,
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: "float32x2",
                        },
                    ],
                }
            ]
        },

        fragment: {
            module: shader,
            entryPoint: "fs",
            targets: [
                {
                    format,
                },
            ],
        },
        
        primitive: {
            topology: "triangle-list",
        },
    });
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

export function renderFrame({device, context}, pipeline, vertexBuffer) {
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

        pass.setPipeline(pipeline);
        pass.setVertexBuffer(0, vertexBuffer);

        pass.draw(3);
        pass.end();

        device.queue.submit([encoder.finish()]);

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}
