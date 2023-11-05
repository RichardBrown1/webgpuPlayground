
import { vec3, mat4 } from 'gl-matrix';

export const initGPU = async () => {
    if (!navigator.gpu) {
        alert('Your browser does not support WebGPU');
    } else {
        console.log('WebGPU support found: ', navigator.gpu);
    }

    const adapter = await navigator.gpu?.requestAdapter();

    const adapterInfo = await adapter?.requestAdapterInfo();
    console.log("Adapter Info: ");
    console.log("  - " + adapterInfo?.vendor);
    console.log("  - " + adapterInfo?.device);
    console.log("  - " + adapterInfo?.description);
    console.log("  - " + adapterInfo?.architecture);

    console.log("Adapter Features: ")
    adapter?.features.forEach((x) => {
        console.log("  - " + x)
    });

    const device = await adapter?.requestDevice() as GPUDevice;

    return device;
}

export const initCanvas = async (canvasElementId: string, device: GPUDevice) => {
    const canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;
    const format = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device: device,
        format: format,
        //size: size,
        alphaMode: "premultiplied"
    });
    return { canvas, context };
}

export const initCanvasResizeListener = (canvasElementId: string) => {
    const canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;

    if (canvas) {
        const div = canvas.parentElement as HTMLElement;//document.getElementsByClassName('canvasWrapper')[0] as HTMLDivElement;
        if (div != null) {
            function windowResize() {
                const div = document.getElementsByClassName('canvasWrapper')[0] as HTMLDivElement;
                const divInfo = div.getBoundingClientRect()
                if (div != null) {
                    let smallestLength = divInfo.width < divInfo.height ? divInfo.width : divInfo.height;
                    //console.log("smallestLength " + smallestLength);
                   
                    canvas.width = smallestLength;
                    canvas.height = smallestLength; //div.offsetHeight;
                }
            }
            windowResize();
            window.addEventListener('resize', windowResize);
        }
    }
}

export const setCanvasHeader = (text: string) => {
    var canvasHeaderText = document.getElementById("canvasHeader") as HTMLHeadingElement;
    if(canvasHeaderText) {
        canvasHeaderText.innerText = text;
        console.log("new canvasHeaderText", canvasHeaderText.innerText)
    }
}

export const createTransforms = (modelMat:mat4, translation:vec3 = [0,0,0], rotation:vec3 = [0,0,0], scaling:vec3 = [1,1,1]) => {
    const rotateXMat = mat4.create();
    const rotateYMat = mat4.create();
    const rotateZMat = mat4.create();   
    const translateMat = mat4.create();
    const scaleMat = mat4.create();

    //perform individual transformations
    mat4.fromTranslation(translateMat, translation);
    mat4.fromXRotation(rotateXMat, rotation[0]);
    mat4.fromYRotation(rotateYMat, rotation[1]);
    mat4.fromZRotation(rotateZMat, rotation[2]);
    mat4.fromScaling(scaleMat, scaling);

    //combine all transformation matrices together to form a final transform matrix: modelMat
    mat4.multiply(modelMat, rotateXMat, scaleMat);
    mat4.multiply(modelMat, rotateYMat, modelMat);        
    mat4.multiply(modelMat, rotateZMat, modelMat);
    mat4.multiply(modelMat, translateMat, modelMat);
};