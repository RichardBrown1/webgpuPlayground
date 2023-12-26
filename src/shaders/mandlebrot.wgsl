//constants
override sizeX: f32;
override sizeY: f32;

@binding(0) @group(0) var<uniform> uniforms : vec2<f32>;

//vertex shader
struct VSOutput {
    @builtin(position) Position : vec4<f32>,
};

@vertex
fn vs_main(@location(0) pos: vec4<f32>) -> @builtin(position) vec4<f32> {
    return pos;
}

fn square(x: f32) -> f32 {
    return x * x;
}

//fragment shader
@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let waveColour = vec4f(1, 1, 1, 0.95);
    let cyan = vec4f(0, pos.y/sizeY, 0, 1);    

    let halfY = sizeY / 2;

    let angle = -uniforms[0]/6 + ((pos.x)/ (sizeX/6));    
    let cond = pos.y >= (sin(angle)* (sizeY/12) + halfY + (sizeY/12));
    
    let angle2 = -uniforms[0]/6.2 + (pos.x / (sizeX/6)) + 0;    
    let cond2 = pos.y >= (sin(angle2 + 0.1) * (sizeY/12) + halfY + (sizeY/12));

    var colour = cyan;
    if cond {
        colour = waveColour*colour;
    } 
    if cond2 {
        colour = waveColour*colour;
    }
  
    return colour;
}
