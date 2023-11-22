const PIXEL_DENSITY = 2;
let theShader;
let canvas;

// Part 2 - Step 2.1
// from here
let control = {
	radius: -0.4,
	stringColor: [255, 127, 127],
	fogColor: [127, 255, 127],
}
// to here

// Part 2 - Step 2.2
// from here
window.onload = function() {
	var gui = new dat.GUI();
	gui.domElement.id = 'gui';
	gui.add(control, 'radius', -0.7, 0.5).name("Radius");

	let Color = gui.addFolder("Color");
	Color.addColor(control, 'stringColor').name("String Color");
	Color.addColor(control, 'fogColor').name("Fog Color");
};
// to here

// Part 1 - Step 4
// from here
function preload(){
	theShader = loadShader('vert.glsl', 'frag.frag');
}
// to here

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function setup() {
	pixelDensity(PIXEL_DENSITY);
	// canvas = createCanvas(1000,1000, WEBGL);
	canvas = createCanvas(windowWidth, windowHeight, WEBGL);

	background(0);
	noStroke();
	shader(theShader);
}

function draw() {
	var y = (mouseY-500) / min(1, windowWidth / windowHeight) + 500;
	
	theShader.setUniform("u_resolution", [width * PIXEL_DENSITY, height * PIXEL_DENSITY]);
	theShader.setUniform("u_mouse", [mouseX * PIXEL_DENSITY, (height-y) * PIXEL_DENSITY]);
  	theShader.setUniform("u_time", millis() / 1000.0);

	// Part 2 - Step 2.3
	// from here
	theShader.setUniform("u_radius", control.radius);
	theShader.setUniform("u_stringColor", control.stringColor);
	theShader.setUniform("u_fogColor", control.fogColor);
	// to here
	
	rect(width * -0.5, height * -0.5, width, height);
}

function keyPressed() {
	if (keyCode == ESCAPE) { dat.GUI.toggleHide(); }
}
