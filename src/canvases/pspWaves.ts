import { initCanvas } from '../helper';
import shader from '../shaders/pspWaves.wgsl';

export const PspWaves = async (gpu: GPU, device: GPUDevice) => {
    let startTime = Date.now();
    const canvas = await initCanvas('canvasWebgpu', device);
   
    const vertexData = new Float32Array([
        -1, -1,  // vertex a
         1, -1,  // vertex b
        -1,  1,  // vertex d
        -1,  1,  // vertex d
         1, -1,  // vertex b
         1,  1,  // vertex c
    ]);
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

    
    const uniformArr = new Float32Array(2);

    const uniformBuffer = device.createBuffer({
        size: 4*2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            },
        ]
    });

    function frame() {
        const now = Date.now();
        let timeDiff = (now - startTime)/1000;
        if(timeDiff > canvas.canvas.width) {
            timeDiff = 0;
        }
        uniformArr[0] = timeDiff;
        device.queue.writeBuffer(uniformBuffer, 0, uniformArr);

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
        renderPassEncoder.setBindGroup(0, uniformBindGroup )
        renderPassEncoder.setVertexBuffer(0, vertexBuffer); 
        renderPassEncoder.draw(6);
        renderPassEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }
        
    requestAnimationFrame(frame);
}
