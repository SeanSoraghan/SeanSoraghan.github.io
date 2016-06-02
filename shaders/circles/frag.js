uniform float time;
uniform vec2  resolution;

varying vec2 vertexPosition;

const float pi = 3.14159265359;

float getCircleCol (in vec2 centre, in vec2 point, in float shrink, in float atten, in float angMult, in float l)
{
	
	float ang = atan ((point.y - centre.y) / (point.x - centre.x)) / pi;
	float dist = distance (point, centre);
	float distCol = 1.0 - clamp (pow (dist * shrink, atten), 0.0, 1.0);
	float r = sqrt(pow(point.x - centre.x, 2.0) + pow (point.y - centre.y, 2.0));
	float outer = 2.0;
	float rCol = outer - clamp (r * 3.0, 0.0, outer);
	float rsm = smoothstep(l, outer, rCol) * smoothstep(outer, l, rCol);
	distCol += sin(ang * angMult) * rsm;
	return distCol;
}

vec2 getOrbitPos (in vec2 sun, in float r, in float a)
{
	float x = sun.x + r * cos(a);
	float y = sun.y + r * sin(a);
	return vec2 (x, y);
}

void main() 
{ 
	float max = max (resolution.x, resolution.y);
	vec2 pos = vec2 (vertexPosition.x / max, vertexPosition.y / max);
	vec3 col = vec3(0.0);

	vec2 c = vec2 (0.0);
	for (float i = 1.0; i < 18.0; i++)
	{
		vec2 orbit = getOrbitPos (c, 0.1, time * ((i-4.0) / (20.0 + i)));
		vec3 orbitCol =  vec3 (0.3, 0.4 + (i / 20.0), 0.9 - (i / 40.0));
		float pulseRate = 1.0 - (i / (7.0 + i) ) * 0.5;
		float roundFreq = floor (((sin (time) * 0.5 + 0.5) * 10.0) / (pi * 2.0));
		col +=  orbitCol * getCircleCol (orbit, pos, i * 2.0 + 3.0, 1.0, 
										 i * pi * 2.0, 
										 sin (time * pulseRate) * 0.1 + 0.9);
		c = orbit;
	}

	// vec2 orbit1 = getOrbitPos (vec2 (0.0), 0.2, time * 0.1);
	// float col1 = getCircleCentreDist (orbit1, pos, 20.0, 3.0);

	// vec2 orbit2 = getOrbitPos (orbit1, 0.3, time);
	// float col2 = getCircleCentreDist (orbit2, pos, 30.0, 3.0);

	// vec2 orbit3 = getOrbitPos (orbit2, 0.1, time*0.5);
	// float col3 = getCircleCentreDist (orbit3, pos, 40.0, 2.0);

	// col += col1;
	// col += col2;
	// col += col3;


	gl_FragColor = vec4 (col, 1.0); 
}