@binding(0) @group(0) var<uniform> offset : vec2<f32>;
// @binding(0) @group(1) var<uniform> zoom : f32;

//constants
override sizeX: f32;
override sizeY: f32;
override PI = 3.14159265;
override zoom = 1.0;

fn complexMultiply(a: vec2f, b: vec2f) -> vec2f {
    return vec2f(a.x * b.x - a.y * a.y, a.x * b.y + a.y * b.x);
}

fn complexMod(z: vec2f) -> f32 {
    return z.x * z.x + z.y * z.y;
}

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
    let resolution = vec2f(sizeX, sizeY);
    let fragCoord = vec2f(f32(pos.x) + 0.5f, f32(sizeY - pos.y) - 0.5f);

    let uv = (2.0f * fragCoord - vec2f(resolution)) / f32(sizeY) + offset * zoom;
    var colour = vec4f(0.0f, 0.0f, 0.0f, 0.0f);

    var c = uv / zoom;
    var z = uv / zoom;
    for (var i = 0u; i < 1000u; i = i + 1u) {
        z = complexMultiply(z, z) + c;
        if (complexMod(z) <= 4.0f) {
            let x = PI * f32(i % 360u) / 120.0f;
            colour = vec4f(0, sin(x), 1,  1.0f);
            if ((i + 1u) == 1000u) {
                colour = vec4f(0.0f, 0.0f, 0.0f, 1.0f);
            }
        }
    }  
    return colour;
}