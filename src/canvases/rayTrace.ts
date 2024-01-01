import { initCanvas } from '../helper';
import { SquareVerteces } from '../models/square';
import shader from '../shaders/rayTrace.wgsl';

export const RayTrace = async (gpu: GPU, device: GPUDevice) => {
    const canvas = await initCanvas('canvasWebgpu', device);
   
    const vertexData = SquareVerteces();
    const vertexBuffer = device.createBuffer({
        label: "vertexBuffer",
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true //use for buffers that don't change
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(vertexData); //give linked buffer to host and set it there
    vertexBuffer.unmap(); //remove from host

    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: device.createShaderModule({
                code: shader
            }),
            entryPoint: "vs_main",
            buffers: [
                {
                    arrayStride: 8,
                    attributes: [{
                        shaderLocation: 0,
                        format: "float32x2",
                        offset: 0
                    }]
                },
            ],

        },
        fragment: {
            module: device.createShaderModule({
                code: shader
            }),
            entryPoint: "fs_main",
            targets: [
                {
                    format: gpu.getPreferredCanvasFormat() as GPUTextureFormat
                }
            ],
            constants: {
                sizeX: canvas.canvas.width,
                sizeY: canvas.canvas.height,
            }
        },
        primitive: {
            topology: "triangle-list",
        }
    });

    function frame() {
        const now = Date.now();

        const commandEncoder = device.createCommandEncoder();
        const textureView = canvas.context.getCurrentTexture().createView();
        const renderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: {
                    r: 0.2, g: 0.2, b:0.2, a: 1.0
                },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });
        renderPassEncoder.setPipeline(pipeline);
        renderPassEncoder.setVertexBuffer(0, vertexBuffer); 
        renderPassEncoder.draw(6);
        renderPassEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }
        
    requestAnimationFrame(frame);
}
