uniform float time;
uniform vec2  resolution;

varying vec2 vertexPosition;

const float pi = 3.14159265359;



void main() 
{ 
	float mmax = max (resolution.x, resolution.y);
	vec2 pos = vec2 (gl_FragCoord.xy / mmax);
	pos = pos * 2.0 -1.0;
	vec3 col = vec3(0.0);
	float xAbs = abs(pos.x);
	float yAbs = abs (pos.y);

	float animX = sin(time*0.4)*0.5 + 0.5;
	float animY = sin(time*0.4)*0.5 + 0.5;
	vec2 centre = vec2(animX * 0.05, animY * 0.05);

	float spiralPos = mod(time, 10.0) / 10.0;

	vec2 newCentre = vec2 (0.1 * cos(-spiralPos * 2.0 * pi), 0.1 * sin (-spiralPos * 2.0 * pi));
	float circDist = clamp (1.0 - distance (pos, newCentre)*15.0, 0.0, 1.0);
	vec3 colCircle = vec3 (0.99, 0.88, 0.86) * circDist;

	float x = xAbs;
	float y = yAbs;
	float r = sqrt (pow(x, 2.0) + pow(y, 2.0));
	float addMultX = float(pos.x<0.0);
	float addMultY = float(pos.x>0.0) * float(pos.y<0.0);
	float a = (atan(pos.y / pos.x) + pi*addMultX + pi*2.0*addMultY) / (2.0*pi);

	
	
	float movingA = mod(a + spiralPos, 1.0); 
	float discR = 0.;// + pow(movingA,3.0);
	float discC = 0.18 + pow(movingA, 2.0);
	float blur  = movingA;
	float edge = discC + discR;
	float lim = smoothstep (edge, edge + blur, r);
	edge = discC - discR;
	float lim2 = smoothstep (edge - blur, edge, r);
	float limmult = abs (lim - lim2);
	col += limmult;

	float tunnelLength = discR * 2.0;
	float maxL = tunnelLength + discC - discR;
	float invR = 1.0 - (r / maxL);
	float sides = sin ((1.0 - abs(r)) * (10.0*(invR) /*+ (r*500.0 + sin(time*0.1)*500.0)*/) + time);

	float tunnel = sin(r*100.0);
	float tunnel2 = sin ((clamp(1.0-movingA, 0.0, 1.0) * (sin(time*0.1)*0.3+0.7))*100.0);

	float spiralEnd = clamp (1.0 - movingA*1.3, 0.0, 1.0 );
	float spiralStart = smoothstep (0.01, 0.1, movingA);

	col *= spiralStart * spiralEnd * vec3 (clamp(1.0-movingA, 0.0, 1.0), 0.9, 0.9);
	col *= tunnel;
	col *= tunnel2;

	col *= sides;

	col += colCircle;

	gl_FragColor = vec4 (col, 1.0); 
}