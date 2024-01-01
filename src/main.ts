import { ColouredSquare } from './canvases/colouredSquare';
import { Mandlebrot } from './canvases/mandlebrot';
import { PspWaves } from './canvases/pspWaves';
import { Cube } from './canvases/cube';

import { CONSTANTS } from './constants';
import { initCanvasResizeListener, initGPU, setCanvasHeader } from './helper';

const gpu = navigator.gpu;
const device = await initGPU();

initCanvasResizeListener('canvasWebgpu');

var currentHash = window.location.hash.substring(1);

function colouredSquareListener() {
    ColouredSquare(gpu, device);
}

function pspWavesListener() {
    PspWaves(gpu, device);
}

function cubeListener() {
    Cube(gpu, device);
}

function mandlebrotListener() {
    Mandlebrot(gpu, device);
}

function onHashChange() {
    switch (currentHash) {
        case CONSTANTS.HASHES.COLOURED_SQUARE:
            window.removeEventListener(currentHash, colouredSquareListener);
            break;
        case CONSTANTS.HASHES.PSP_WAVES:
            window.removeEventListener(currentHash, pspWavesListener);
            break;
        case CONSTANTS.HASHES.MANDLEBROT:
            window.removeEventListener(currentHash, mandlebrotListener);
            break;
        case CONSTANTS.HASHES.CUBE:
            window.removeEventListener(currentHash, cubeListener);
            break;
        default:
    }

    currentHash = window.location.hash.substring(1);
    console.log("new hash: " + currentHash);


    switch (currentHash) {
        case CONSTANTS.HASHES.COLOURED_SQUARE:
            setCanvasHeader(CONSTANTS.HEADERS.COLOURED_SQUARE);
            window.addEventListener('resize', colouredSquareListener);
            ColouredSquare(gpu, device);
            break;
        case CONSTANTS.HASHES.PSP_WAVES:
            setCanvasHeader(CONSTANTS.HEADERS.PSP_WAVES);
            window.addEventListener('resize', pspWavesListener);
            PspWaves(gpu, device);
            break;
        case CONSTANTS.HASHES.MANDLEBROT:
            setCanvasHeader(CONSTANTS.HEADERS.MANDLEBROT);
            window.addEventListener('resize', mandlebrotListener);
            Mandlebrot(gpu, device);
            break;
        case CONSTANTS.HASHES.CUBE:
            setCanvasHeader(CONSTANTS.HEADERS.CUBE);
            window.addEventListener('resize', cubeListener);
            Cube(gpu, device);
            break;
        default:
            setCanvasHeader("Home");
    }
}

window.onhashchange = () => {
    location.reload();
}
onHashChange();