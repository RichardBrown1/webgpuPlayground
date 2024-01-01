//constants
override sizeX: f32;
override sizeY: f32;

//vertex shader
struct VSOutput {
    @builtin(position) Position : vec4<f32>,
};

@vertex
fn vs_main(@location(0) pos: vec4<f32>) -> @builtin(position) vec4<f32> {
    return pos;
}

//fragment shader
@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    var resolution = vec2f(sizeX, sizeY);
    var pixelTarget2D = (pos.xy/resolution) * 2.0f - 1.0f;
    return  vec4f(pixelTarget2D, 0.0f, 1.0f);
}
