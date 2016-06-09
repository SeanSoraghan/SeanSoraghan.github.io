uniform float time;
uniform vec2  resolution;

varying vec2 vertexPosition;

const float pi = 3.14159265359;

float getRForCentre (in vec2 centre, in vec2 pos)
{
	return sqrt( pow(abs(pos.x - centre.x), 2.0) + pow (abs(pos.y - centre.y), 2.0) );
}

void main() 
{ 
	float mmax = max (resolution.x, resolution.y);
	vec2 pos = vec2 (gl_FragCoord.xy / mmax);
	pos = pos * 2.0 -1.0;
	vec3 col = vec3 (0.0);
	float animatedY = (mod(time, 13.0) / 13.0 * 2.0 - 1.0) * 2.5 - 1.5;
	float r = getRForCentre (vec2(0.0, animatedY),pos);
	float yScreen = (pos.y + 1.0)/2.0;
	float c = clamp (1.0 - smoothstep (0.0,yScreen*0.8,r*pow(yScreen,2.0)*5.0), 0.0, 1.0);
	col += c;
	gl_FragColor = vec4 (col, 1.0); 
}