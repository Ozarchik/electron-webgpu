import { initWebGPU, renderFrame } from './gpu.js';

async function main() {
  const gpu = await initWebGPU();
  renderFrame(gpu);
}

main().catch((err) => {
  console.error(err);
});