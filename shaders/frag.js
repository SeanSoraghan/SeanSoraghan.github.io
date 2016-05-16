uniform float time;
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

vec2 getGaussianReferencePoint (in float x, in float amp, in float m, in float s)
{
	return vec2 (x, gauss (x, amp, m, s));
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

void addGaussianCurve (inout vec3 col, in vec2 pos, in float amp, in float m, in float s, in float lineAttenuation)
{
	vec2 gPoint = getGaussianReferencePoint (pos.x, amp, m, s);
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
	vec2 pos = vec2 (vertexPosition.x / resolution.x, vertexPosition.y / resolution.y);
	vec3 col = vec3 (0.0);

	float globalAmpAnimation = (sin (time * 0.12) * 0.5 + 0.5);
	//for (float m = -1.0; m < 1.0; m += 0.1)
//	{
		for (float i = 1.0; i < 21.0; i++)
		{
			float ampAnimation = sin (time * (i / (60.0 + i)));
			float amp = (i * 0.003);

			float m = (i - 10.0) / 150.0;
			float mAnimation = sin (time * (i / (200.0 + (20.0 - i))));

			float attenuationAnimation = sin (time * i * 0.001);
			float attenuation = 500.0 + attenuationAnimation * 100.0; 
			addGaussianCurve (col, pos, amp * ampAnimation * globalAmpAnimation, m * mAnimation, 0.03, attenuation);
		}
//	}
	float zeroLineEdge = 0.05;
	float posCol = smoothstep (0.0, zeroLineEdge, pos.y);
	float negCol = smoothstep (0.0, -zeroLineEdge, pos.y);
	col *= posCol + negCol;
	col *= vec3 (0.8, 0.9, 1.0);
	gl_FragColor = vec4 (col, 1.0); 
}