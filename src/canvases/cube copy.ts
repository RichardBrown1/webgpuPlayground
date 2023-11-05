
// import { vec3, mat4 } from 'gl-matrix';
// import { initCanvas } from '../helper';
// import { CubeData } from '../models/cube';
// import shader from '../shaders/cube.wgsl';
// import "../site.css"

// export const Cube = async (gpu: GPU, device: GPUDevice) => {
//     const canvas = await initCanvas('canvasWebgpu', device);
    
//     const cubeData = CubeData();
//     const cubeVerticesCount = cubeData.positions.length / 3;
//     const vertexBuffer = device.createBuffer({
//         label: "vertexBuffer",
//         size: cubeData.positions.byteLength,
//         usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//         mappedAtCreation: true //use for buffers that don't change
//     });
//     new Float32Array(vertexBuffer.getMappedRange()).set(cubeData.positions); //give linked buffer to host and set it there
//     vertexBuffer.unmap(); //remove from host

//     const colorBuffer = device.createBuffer({
//         label: "colorBuffer",
//         size: cubeData.colors.byteLength,
//         usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//         mappedAtCreation: true //use for buffers that don't change
//     });
//     new Float32Array(colorBuffer.getMappedRange()).set(cubeData.colors); //give linked buffer to host and set it there
//     colorBuffer.unmap(); //remove from host

//     const pipeline = device.createRenderPipeline({
//         layout: 'auto',
//         vertex: {
//             module: device.createShaderModule({
//                 code: shader
//             }),
//             entryPoint: "vs_main",
//             buffers: [
//                 {
//                     arrayStride: 12,
//                     attributes: [{
//                         shaderLocation: 0,
//                         format: "float32x3",
//                         offset: 0
//                     }]
//                 },
//                 {
//                     arrayStride: 12,
//                     attributes: [{
//                         shaderLocation: 1,
//                         format: "float32x3",
//                         offset: 0
//                     }]
//                 }
//             ]
//         },
//         fragment: {
//             module: device.createShaderModule({
//                 code: shader
//             }),
//             entryPoint: "fs_main",
//             targets: [
//                 {
//                     format: gpu.getPreferredCanvasFormat() as GPUTextureFormat
//                 }
//             ]
//         },
//         primitive: {
//             topology: "triangle-list",
//             cullMode: "back"
//         },
//         depthStencil:{
//             format: "depth24plus",
//             depthWriteEnabled: true,
//             depthCompare: "less"
//         }
//     });

//     //create uniform data
//     const modelMatrix = mat4.create();
//     const mvpMatrix = mat4.create();
//     let createViewProjection = (respectRatio = 1.0, cameraPosition:vec3 = [2,2,4], lookDirection:vec3 = [0,0,0], upDirection: vec3 = [0,1,0]) => {
//         const viewMatrix = mat4.create();
//         const projectionMatrix = mat4.create();
//         const viewProjectionMatrix = mat4.create();
//         mat4.perspective(projectionMatrix, 2*Math.PI/5, respectRatio, 1, Infinity);
//         mat4.lookAt(viewMatrix, cameraPosition, lookDirection, upDirection);
//         mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

//         const cameraOption = {
//             eye: cameraPosition,
//             center: lookDirection,
//             zoomMax: 100,
//             zoomSpeed: 2,
//         };

//         return {
//             viewMatrix,
//             projectionMatrix,
//             viewProjectionMatrix,
//             cameraOption
//         };
//     };
//     const vp = createViewProjection(canvas.canvas.width/ canvas.canvas.height);
//     let vpMatrix = vp.viewProjectionMatrix;
    
//     //create uniform buffer and bind group
//     const uniformBuffer = device.createBuffer({
//         size: 64,
//         usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
//     });
//     const uniformBindGroup = device.createBindGroup({
//         layout: pipeline.getBindGroupLayout(0),
//         entries: [
//             {
//                 binding: 0,
//                 resource: {
//                     buffer: uniformBuffer,
//                 }
//             }
//         ]
//     });

//     const textureView = canvas.context.getCurrentTexture().createView();
//     const depthTexture = device.createTexture({
//         size: [canvas.canvas.width, canvas.canvas.height, 1],
//         format: "depth24plus",
//         usage: GPUTextureUsage.RENDER_ATTACHMENT
//     });
//     const renderPassDescription = {
//         colorAttachments: [{
//             view: textureView,
//             clearValue: {
//                 r: 0.2,
//                 g: 0.247,
//                 b: 0.314,
//                 a: 1.0
//             },
//             loadOp: "clear",
//             storeOp: "store"
//         }],
//         depthStencilAttachment: {
//             view: depthTexture.createView(),
//             depthLoadValue: 1.0,
//             depthClearValue: 1.0,
//             depthLoadOp: "clear",
//             depthStoreOp: "store"
//         }
//     } as GPURenderPassDescriptor;

//     mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);
//     device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer);

    

//     const commandEncoder = device.createCommandEncoder();
//     const renderPass = commandEncoder.beginRenderPass(renderPassDescription);

//     renderPass.setPipeline(pipeline);
//     renderPass.setVertexBuffer(0, vertexBuffer); 
//     renderPass.setVertexBuffer(1, colorBuffer);
//     renderPass.setBindGroup(0, uniformBindGroup);
//     renderPass.draw(cubeVerticesCount);
//     renderPass.end();

//     device.queue.submit([commandEncoder.finish()]);
// }
