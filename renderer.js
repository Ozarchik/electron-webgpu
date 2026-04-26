import {
  initWebGPU,
  createDefaultShader,
  createVertexBuffer,
  createRenderPipeline,
  renderFrame,
} from './gpu.js';

async function main() {
  const gpu = await initWebGPU();
  const shader = createDefaultShader(gpu.device);
  const vertexBuffer = createVertexBuffer(gpu.device);
  const pipeline = createRenderPipeline(gpu.device, shader, gpu.format);
  renderFrame(gpu, pipeline, vertexBuffer);
}

main().catch((err) => {
  console.error(err);
  const hud = document.getElementById('hud');
  if (hud) {
    hud.style.background = 'rgba(255, 80, 80, 0.9)';
    hud.style.color = '#111';
    hud.style.pointerEvents = 'auto';
    hud.textContent = `WebGPU error: ${err?.message || String(err)}`;
  }
});