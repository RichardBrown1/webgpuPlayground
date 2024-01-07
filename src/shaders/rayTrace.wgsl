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

    // calculate 2d coordinates of the ray target on the imaginary pixel plane.
    // -1 to +1 on each axis.
    var pixelTarget2D = (pos.xy/resolution) * 2.0f - 1.0f;

    //take abs value so we can verify there are negative values in the lower left
    pixelTarget2D = abs(pixelTarget2D);

    // show percentage as red and green
    return  vec4f(pixelTarget2D, 0.0f, 1.0f);
}
