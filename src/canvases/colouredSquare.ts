import { initCanvas } from '../helper';
import shader from '../shaders/square.wgsl';

export const ColouredSquare = async (gpu: GPU, device: GPUDevice) => {
    const canvas = await initCanvas('canvasWebgpu', device);
   
    const vertexData = new Float32Array([
        -0.8, -0.8,  // vertex a
         0.8, -0.8,  // vertex b
        -0.8,  0.8,  // vertex d
        -0.8,  0.8,  // vertex d
         0.8, -0.8,  // vertex b
         0.8,  0.8,  // vertex c
    ]);
    const vertexBuffer = device.createBuffer({
        label: "vertexBuffer",
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true //use for buffers that don't change
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(vertexData); //give linked buffer to host and set it there
    vertexBuffer.unmap(); //remove from host

    const colorData = new Float32Array([
        1, 0, 0,    // vertex a: red
        0, 1, 0,    // vertex b: green
        1, 1, 0,    // vertex d: yellow
        1, 1, 0,    // vertex d: yellow
        0, 1, 0,    // vertex b: green
        0, 0, 1     // vertex c: blue
    ]);
    const colorBuffer = device.createBuffer({
        label: "colorBuffer",
        size: colorData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true //use for buffers that don't change
    });
    new Float32Array(colorBuffer.getMappedRange()).set(colorData); //give linked buffer to host and set it there
    colorBuffer.unmap(); //remove from host

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
                {
                    arrayStride: 12,
                    attributes: [{
                        shaderLocation: 1,
                        format: "float32x3",
                        offset: 0
                    }]
                }
            ]
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
            ]
        },
        primitive: {
            topology: "triangle-list",
        }
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = canvas.context.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            clearValue: {
                r: 0.2, g: 0.2, b:0.2, a: 1.0
            },
            loadOp: 'clear',
            storeOp: 'store'
        }]
    });
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer); 
    renderPass.setVertexBuffer(1, colorBuffer);
    renderPass.draw(6);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}
