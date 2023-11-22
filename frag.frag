#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Part 2 - Step 1
// from here
uniform float u_radius;
uniform vec3 u_stringColor;
uniform vec3 u_fogColor;
// to here

float pi = 3.1415926;

// -------------------------------------------------- //

float glow(float d, float str, float thickness)
{
    return thickness / pow(d, str);
}

// -------------------------------------------------- //

vec3 hash(vec3 p) // replace this by something better
{
    p = vec3( dot(p, vec3(127.1, 311.7, 74.7)),
            dot(p, vec3(269.5, 183.3, 246.1)),
            dot(p, vec3(113.5, 271.9, 124.6)));

    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

vec2 hash2(vec2 x) //亂數範圍 [-1,1]
{
    const vec2 k = vec2(0.3183099, 0.3678794);
    x = x * k + k.yx;
    return -1.0 + 2.0 * fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
}

float noise(in vec3 p)
{
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(mix(dot(hash(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)), 
                    dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
                mix(dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)), 
                    dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
            mix(mix(dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)), 
                    dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
                mix(dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)), 
                    dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

float gnoise(in vec2 p) //亂數範圍 [-1,1]
{
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), 
                dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
            mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), 
                dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(in vec2 uv) //亂數範圍 [-1,1]
{
    float f; //fbm - fractal noise (4 octaves)
    mat2 m = mat2(1.6,  1.2, -1.2,  1.6);
    f = 0.5000 * gnoise(uv); uv = m * uv;          
    f += 0.2500 * gnoise(uv); uv = m * uv;
    f += 0.1250 * gnoise(uv); uv = m * uv;
    f += 0.0625 * gnoise(uv); uv = m * uv;
    
    return f;
}

// -------------------------------------------------- //

float sdBlobbyCross(in vec2 pos, float he)
{
    pos = abs(pos);
    pos = vec2(abs(pos.x - pos.y), 1.0 - pos.x - pos.y) / sqrt(2.0);

    float p = (he - pos.y - 0.25 / he) / (6.0 * he);
    float q = pos.x / (he * he * 16.0);
    float h = q * q - p * p * p;
    
    float x;
    if (h > 0.0)
    {
        float r = sqrt(h);
        x = pow(q +r, 1.0 / 3.0) - pow(abs(q - r), 1.0 / 3.0) * sign(r - q);
    }
    else
    {
        float r = sqrt(p);
        x = 2.0 * r * cos(acos(q / (p * r)) / 3.0);
    }
    x = min(x, sqrt(2.0) / 2.0);
    
    vec2 z = vec2(x, he * (1.0 - 2.0 * x * x)) - pos;
    
    return length(z) * sign(z.y);
}

// -------------------------------------------------- //

float mouseEffect(vec2 uv, vec2 mouse, float size)
{
    float dist = length(uv - mouse);
    return 1.2 - smoothstep(size * 2.0, size, dist);
}

// -------------------------------------------------- //

mat2 rotate(float angle)
{
    return mat2(cos(angle), -sin(angle),
                sin(angle), -cos(angle));
}

// -------------------------------------------------- //

vec3 colorTransform(vec3 color)
{
    color.xyz /= 255.0;
    return color;
}

// -------------------------------------------------- //

void main() {
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

	vec2 mouse = u_mouse / u_resolution.xy;
    mouse = mouse * 2.0 - 1.0;
    mouse.x *= u_resolution.x / u_resolution.y;


	// 陰晴圓缺
	float theta = 2.0 * pi * u_time / 8.0;
    vec2 point = vec2(sin(theta), cos(theta));
    float dir = dot(point, (uv)) + 0.55;

	// 亂數作用雲霧
    float fog = fbm(0.4 * uv + vec2(-0.1 * u_time, -0.02 * u_time)) * 2.0 + 0.1;

	// 滑鼠互動
    float interact = 1.0 - mouseEffect(uv, mouse, 0.1);

	// 定義圓環
    float result;
	for(float index = 0.0; index < 18.0; index++)
    {
        float noise_position = interact * 2.0 + dir;
        float radius_noise = noise(vec3(2.180 * uv, index + u_time * 0.4)) * -0.2 * noise_position;
        float radius;
        radius = -u_radius + radius_noise;

        // 光環大小
        float circle_dist = abs(sdBlobbyCross(uv, radius));

        // 動態呼吸
        float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.4) * 0.4;
        float strength = (0.08 * breathing + 0.3); // [0.2~0.3] // 光暈強度加上動態時間營造呼吸感
        float thickness = (0.0 * breathing + 0.01); // [0.1~0.2] // 光環厚度 營造呼吸感
        float glow_circle = glow(circle_dist, strength, thickness);
        result += glow_circle;
    }

    vec3 color = vec3(0.5, 1.5, 0.5);

    gl_FragColor = vec4(vec3(result) * colorTransform(u_stringColor) +
                            vec3(fog) * colorTransform(u_fogColor),
                            1.0);
}