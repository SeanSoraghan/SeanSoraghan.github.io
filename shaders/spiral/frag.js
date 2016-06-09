uniform float time;
uniform vec2  resolution;

varying vec2 vertexPosition;

const float pi = 3.14159265359;

float getRForCentre (in vec2 centre, in vec2 pos)
{
	return sqrt( pow(abs(pos.x - centre.x), 2.0) + pow (abs(pos.y - centre.y), 2.0) );
}

float getAngleForCentre (in vec2 centre, in vec2 pos)
{
	float x = pos.x - centre.x;
	float y = pos.y - centre.y;
	float addMultX = float(x<0.0);
	float addMultY = float(x>0.0)*float(y<0.0);
	return (atan(y/x) + pi*addMultX + pi*2.0*addMultY) / (2.0*pi);
}

float getMovingCircleColour (in float spiralPos, in vec2 pos, in float direction, in vec2 centreOffset)
{
	vec2 newCentre = vec2 (0.1 * cos(spiralPos*direction * 2.0 * pi), 0.1 * sin (spiralPos*direction * 2.0 * pi)) + centreOffset;
	float circDist = clamp (1.0 - distance (pos, newCentre)*9.0, 0.0, 1.0);
	float circX = pos.x - newCentre.x;
	float circY = pos.y - newCentre.y;
	float textX = sin (circX*10.0 + pos.x*(/*abs(pos.y*10.0) * */1.0)) * 0.5 + 0.5;
	float textY = sin (circY*10.0 + pos.y*(/*abs(pos.x*10.0) * */1.0)) * 0.5 + 0.5;
	return circDist;//textX * textY * circDist;
}

float getSpiralTrailColour (in float movingA, in float r, in float discC)
{
	float blur  = movingA;
	float lim = smoothstep (discC, discC + blur, r);
	float lim2 = smoothstep (discC - blur, discC, r);

	float limmult = abs (lim - lim2);
	return limmult;
}

float getSpiralTextureColour1 (in float freq, in float r)
{
	return sin(r*freq);
}

float getSpiralTextureColour2 (in float movingA, in float freq)
{
	return sin ((clamp(1.0-movingA, 0.0, 1.0) * (sin(time*0.1)*0.3+0.7))*freq);
}

float getSprialTextureColour3 (in float discC, in float r, in float time, float freq)
{
	float maxL =  discC;
	float invR = 1.0 - (r / maxL);
	float sides = sin ((1.0 - abs(r)) * (freq*(invR) ) + time);
	return sides;
}

float getSpiralLengthColour (in float movingA)
{
	float spiralEnd = clamp (1.0 - movingA*1.5, 0.0, 1.0 );
	float spiralStart = smoothstep (0.01, 0.1, movingA);
	return spiralStart * spiralEnd;
}

void main() 
{ 
	float mmax = max (resolution.x, resolution.y);
	vec2 pos = vec2 (gl_FragCoord.xy / mmax);
	pos = pos * 2.0 -1.0;
	vec3 col = vec3(0.0);
	

	float xAbs = abs(pos.x);
	float yAbs = abs (pos.y);
	vec2 centre1 = vec2(-0.1, 0.0);
	vec2 centre2 = vec2(0.1, 0.0);
	float r = getRForCentre (centre1, pos);
	float r2 = getRForCentre (centre2, pos);
	float a = getAngleForCentre (centre1, pos);
	float a2 = getAngleForCentre (centre2, pos);

	float rate1 = 25.0;
	float rate2 = 26.0;
	float spiralPos = mod(time, rate1) / rate1;
	float spiralPos2 = -mod(time, rate2) / rate2;
	float movingA = mod(a + spiralPos, 1.0); 
	float movingA2 = 1.0 - mod(a2 + spiralPos2, 1.0);

	float colCircle = getMovingCircleColour (spiralPos, pos, -1.0, centre1);
	float colCircle2 = getMovingCircleColour (spiralPos2, pos, -1.0, centre2);

	float discC = 0.18 + pow(movingA, 2.0);
	float discC2 = 0.2 + pow(movingA2, 2.0);
	float spiralIntensity = getSpiralTrailColour (movingA, r, discC);
	float spiralIntensity2 = getSpiralTrailColour (movingA2, r2, discC2);

	float spiral1Texture1Rate = sin(time*0.01)*0.5 + 0.5;
	float spiral1Texture2Rate = sin(time*0.015)*0.5 + 0.5;
	float spiral1Texture3Rate = sin(time*0.03)*0.5 + 0.5;
	float spiral1Texture1 = getSpiralTextureColour1(10.0 + spiral1Texture1Rate*90.0, r);
	float spiral1Texture2 = getSpiralTextureColour2 (movingA, 10.0 + spiral1Texture2Rate*110.0);
	float spiral1Texture3 = getSprialTextureColour3 (discC, r, time, 10.0 + spiral1Texture3Rate*100.0);

	float spiral2Texture1Rate = sin(time*0.02)*0.5 + 0.5;
	float spiral2Texture2Rate = sin(time*0.01)*0.5 + 0.5;
	float spiral2Texture3Rate = sin(time*0.015)*0.5 + 0.5;
	float spiral2Texture1 = getSpiralTextureColour1 (1.0 + spiral2Texture1Rate * 120.0, r2);
	float spiral2Texture2 = getSpiralTextureColour2 (movingA2, 5.0 + spiral2Texture2Rate*1150.0);
	float spiral2Texture3 = getSprialTextureColour3 (discC2, r2, time*0.7, 10.0 + spiral2Texture3Rate * 150.0);

	float spiral1Length = getSpiralLengthColour (movingA);
	float spiral2Length = getSpiralLengthColour (movingA2);
	
	spiralIntensity *= spiral1Length;
	spiralIntensity *= 1.0 + spiral1Texture1 * spiral2Texture1Rate;
	spiralIntensity *= 1.0 + spiral1Texture2 * spiral2Texture2Rate;
	spiralIntensity *= 1.0 + spiral1Texture3 * spiral2Texture3Rate;
	vec3 spiralCol1 = spiralIntensity * vec3(movingA, 0.5, 1.0  - movingA);
	col += spiralCol1;

	
	spiralIntensity2 *= spiral2Length;
	spiralIntensity2 *= 1.0 + spiral2Texture1 * spiral1Texture1Rate;
	spiralIntensity2 *= 1.0 + spiral2Texture2 * spiral1Texture2Rate;;
	spiralIntensity2 *= 1.0 + spiral2Texture3 * spiral1Texture3Rate;;
	col += spiralIntensity2 * vec3(1.0 - movingA2, 0.5, movingA2);

	col += colCircle * vec3(0.1, 0.5, 1.0);
	col += colCircle2 * vec3(1.0, 0.5, 0.1);


	gl_FragColor = vec4 (col, 1.0); 
}