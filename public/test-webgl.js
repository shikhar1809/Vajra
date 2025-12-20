// Quick test to check if Plasma is rendering
console.log('=== PLASMA DEBUG ===');
const testCanvas = document.createElement('canvas');
const gl2 = testCanvas.getContext('webgl2');
console.log('WebGL 2 Support:', !!gl2);
if (gl2) {
    console.log('WebGL 2 Version:', gl2.getParameter(gl2.VERSION));
    console.log('GLSL Version:', gl2.getParameter(gl2.SHADING_LANGUAGE_VERSION));
}
console.log('===================');
