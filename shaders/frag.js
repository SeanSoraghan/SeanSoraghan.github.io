uniform float time;
uniform float centroid;
uniform float rms;
uniform vec2  resolution;

varying vec2 vertexPosition;

const float pi = 3.14159265359;

float gauss (in float x, in float amp, in float m, in float s)
{
	float squaredD = (x - m) * (x - m);
	float div      = 2.0 * s * s;
	float expTerm  = exp (-squaredD / div);

	return amp*expTerm;
}

vec2 getGaussianReferencePoint (in float x, in float amp, in float m, in float s, in float yOffset)
{
	return vec2 (x, gauss (x, amp, m, s) + yOffset);
}

vec2 getGaussianMultiplicationReferencePoint (in float x, in float amp, in float m1, 
											  in float s1, in float m2, in float s2)
{
	return vec2 (x, gauss (x, 1.0, m1, s1) * gauss (x, 1.0, m2, s2) * amp);
}

float getGaussianCurveColour (in vec2 pos, in vec2 gaussianReferencePoint, in float attenuation)
{
	return clamp (1.0 - distance (pos, gaussianReferencePoint) * attenuation, 0.0, 1.0);
}

void addGaussianCurve (inout vec3 col, in vec2 pos, in float amp, in float m, in float s, 
					   in float yOffset, in float lineAttenuation)
{
	vec2 gPoint = getGaussianReferencePoint (pos.x, amp, m, s, yOffset);
	float dist  = getGaussianCurveColour (pos, gPoint, lineAttenuation);
	col += dist;
}

void addGaussianMultiplicationCurve (inout vec3 col, in vec2 pos, in float amp, 
									 in float m1, in float s1, in float m2, in float s2,
									 in float lineAttenuation)
{
	vec2 gPoint = getGaussianMultiplicationReferencePoint (pos.x, amp, m1, s1, m2, s2);
	float dist = getGaussianCurveColour (pos, gPoint, lineAttenuation);
	col += dist;
}

void main() 
{ 
	float max = max(resolution.x, resolution.y);
	vec2 pos = vec2 (vertexPosition.x / max, vertexPosition.y / max);
	vec3 col = vec3 (0.0);

	float swayAmpAnimation = (sin (time * 0.12) * 0.001);// + 0.5);
	float globalAmpAnimation = 1.0;//(sin (time * 0.12) * 0.4 + 0.6);
	float globalVAnimation = sin (time * 0.12) * 0.0005;
	float zeroLine =  sin (pos.x * 3.0 + time)/* * sin (time * 0.18) * sin (time * 0.1) */* 0.01;

	for (float i = 7.0; i < 21.0; i++)
	{
		float ampAnimation = sin (time * 0.3 + pos.x * 10.0);
		float amp = (i * 0.015);

		float m = (i) / resolution.x * 10.0;
		float mAnimation = sin (time * 0.05 + i * 0.2) * 0.5;

		float attenuationAnimation = sin (time * 0.001);
		float attenuation = 100.0 + attenuationAnimation * 10.0; 
		addGaussianCurve (col, pos, (amp * ampAnimation + swayAmpAnimation) /** (1.0 - abs (pos.x))*/ * globalAmpAnimation, 
						  m * mAnimation, 0.2 + globalVAnimation, zeroLine, attenuation);
	}

	float zeroLineEdge = 0.000001;
	float posCol = smoothstep (zeroLine, zeroLine + zeroLineEdge, pos.y);
	float negCol = smoothstep (zeroLine, zeroLine - zeroLineEdge, pos.y);
	col *= posCol + negCol;
	//col = clamp (col, 0.0, 1.0);
	col *= vec3 (0.3, 0.48, 0.7);

	float d = clamp (1.0 - abs (pos.x)*2.0, 0.0, 1.0);
	col *= d;
	gl_FragColor = vec4 (col, 1.0); 
}