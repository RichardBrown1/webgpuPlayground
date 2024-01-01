import { initCanvas, createTransforms } from '../helper';
import { SquareVerteces } from '../models/square';
import shader from '../shaders/mandlebrot.wgsl';


export const Mandlebrot = async (gpu: GPU, device: GPUDevice) => {    
    let startTime = Date.now();
    const canvas = await initCanvas('canvasWebgpu', device);
    var viewOffset = new Float32Array(2); //x, y
    var zoom = new Float32Array(1);
    var newClick : boolean;

    zoom[0] = 1;
    viewOffset[0] = -0.5;
    canvas.canvas.onclick = function(e) {
        var rect = canvas.canvas.getBoundingClientRect();
        viewOffset[0] = (e.clientX - rect.left)/canvas.canvas.width - 0.5; //x position within the element.
        viewOffset[1] = (e.clientY - rect.top)/canvas.canvas.height;  //y position within the element.
        zoom[0] *= 2;
        console.log("Left? : " + viewOffset[0] + " ; Top? : " + viewOffset[1] + ".");
    };

    //render setup
    const vertexData = SquareVerteces();

    const vertexBuffer = device.createBuffer({
        label: "vertexBuffer",
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true //use for buffers that don't change
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(vertexData); //give linked buffer to host and set it there
    vertexBuffer.unmap(); //remove from host

    // const bindGroupLayout = device.createBindGroupLayout({
    //     entries: [
    //         {
    //             binding: 0,
    //             visibility: GPUShaderStage.VERTEX,
    //             buffer: {
    //                 type: "uniform"
    //             },
    //         },
    //         {
    //             binding: 1,
    //             visibility: GPUShaderStage.VERTEX,
    //             buffer: {
    //                 type: "uniform"
    //             }
    //         }
    //     ]
    // });

    // const pipelineLayout = device.createPipelineLayout({
    //     bindGroupLayouts: [bindGroupLayout]
    // });

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
                // {
                //     arrayStride: 4,
                //     attributes: [{
                //         shaderLocation: 1,
                //         format: "float32",
                //         offset: 0
                //     }]                    
                // },
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

    console.log(pipeline.getBindGroupLayout(0));
    
    const offsetBuffer = device.createBuffer({
        size: 4*2,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false 
    });

    const zoomBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: false 
    });

    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: offsetBuffer,
                },
            },
            // {
            //     binding: 1,
            //     resource: {
            //         buffer: zoomBuffer
            //     }
            // }
        ]
    });

    function frame() {
        const now = Date.now();
        let timeDiff = (now - startTime)/1000;
        if(timeDiff > canvas.canvas.width) {
            timeDiff = 0;
        }

        device.queue.writeBuffer(offsetBuffer, 0, viewOffset);
        // device.queue.writeBuffer(zoomBuffer, 0, zoom);

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