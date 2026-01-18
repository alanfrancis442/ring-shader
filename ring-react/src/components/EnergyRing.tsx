import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { TriangleModel } from './Triangle';
import * as THREE from 'three';

export interface EnergyRingProps {
  // Geometry Settings
  particles?: number;
  ringRadius?: number;
  dispersalInner?: number;
  dispersalOuter?: number;
  directionSpread?: number;
  
  // GLB Model
  modelPath?: string;
  modelScale?: number;
  modelPosition?: [number, number, number];
  modelRotation?: [number, number, number];
  modelColor?: string;
  
  // Visuals
  color1?: string;
  color2?: string;
  shardSize?: number;
  shardLength?: number;
  shardThickness?: number;
  
  // Animation / Physics
  outwardSpeed?: number;
  outwardDistance?: number;
  lifeFadeIn?: number;
  lifeFadeOut?: number;
  noiseStrength?: number;
  rotationSpeed?: number;
  shadowSpeed?: number;
  
  // Shadows (Dim Spots)
  shadowRadius?: number;
  shadowDarkness?: number;
  
  // Fragmentation Settings
  fragmentScale?: number;
  fragmentSpeed?: number;
  fragmentAmount?: number;
  
  // Bloom (Note: These should be applied at the EffectComposer level)
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
}

const defaultProps: Required<EnergyRingProps> = {
  // Particle / ring
  particles: 5000,
  ringRadius: 3.474,
  dispersalInner: 0.0,
  dispersalOuter: 0.5,
  directionSpread: 0.15,

  // Model
  modelPath: '/models/Triangle.glb',
  modelScale: 1.0,
  modelPosition: [0, -0.5, 0],
  modelColor: '#ffffff',
  modelRotation: [0, 0, 0],

  // Visuals
  color1: '#00d2ff',
  color2: '#00429e',
  shardSize: 0.65,
  shardLength: 0.65,
  shardThickness: 0.03,

  // Physics
  outwardSpeed: 1.0,
  outwardDistance: 1.68,
  lifeFadeIn: 0.3,
  lifeFadeOut: 1.0,
  noiseStrength: 0.0,
  rotationSpeed: 0.2,
  shadowSpeed: 0.5,

  // Shadows
  shadowRadius: 5.0,
  shadowDarkness: 1.0,

  // Fragmentation / noise
  fragmentScale: 5.0,
  fragmentSpeed: 0.2,
  fragmentAmount: 0.3,

  // Bloom
  bloomStrength: 1.5,
  bloomRadius: 0.5,
  bloomThreshold: 0.05
};

const commonVertexShader = `
  uniform float uTime;
  uniform float uSize;            
  uniform float uNoiseStrength;
  uniform float uOutwardSpeed;
  uniform float uOutwardDistance;
  uniform float uFragmentScale;
  uniform float uFragmentSpeed;
  
  // Instanced Attributes
  attribute vec3 aInstancePosition;
  attribute float aScale;
  attribute vec3 aRandomness;
  attribute vec3 aDirection;
  attribute float aLifeOffset;
  
  varying vec3 vPos;
  varying float vAlphaScale;
  varying float vLife;
  varying float vFragNoise;
  varying vec2 vUv;

  // --- Simplex Noise 3D (Standard Implementation) ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      
      // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      
      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
      vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
      
      // Permutations
      i = mod289(i);
      vec4 p = permute( permute( permute( 
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                
      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
      float n_ = 0.142857142857; // 1.0/7.0
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      //Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      // Mix final noise value
      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
  }

  // Helper to get 3 noise values for Curl Calc
  vec3 snoiseVec3( vec3 x ){
      float s  = snoise(vec3( x ));
      float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
      float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
      return vec3( s , s1 , s2 );
  }

  // --- Curl Noise Function ---
  // Calculates the curl of a simplex noise potential field
  vec3 curlNoise( vec3 p ){
      const float e = 0.1;
      vec3 dx = vec3( e   , 0.0 , 0.0 );
      vec3 dy = vec3( 0.0 , e   , 0.0 );
      vec3 dz = vec3( 0.0 , 0.0 , e   );

      vec3 p_x0 = snoiseVec3( p - dx );
      vec3 p_x1 = snoiseVec3( p + dx );
      vec3 p_y0 = snoiseVec3( p - dy );
      vec3 p_y1 = snoiseVec3( p + dy );
      vec3 p_z0 = snoiseVec3( p - dz );
      vec3 p_z1 = snoiseVec3( p + dz );

      float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
      float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
      float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

      const float divisor = 1.0 / ( 2.0 * e );
      return normalize( vec3( x , y , z ) * divisor );
  }

  float simpleNoise(vec3 p) {
      return snoise(p * uFragmentSpeed + uTime * 0.5);
  }

  // Rotation Matrix Builder: Aligns UP (Y) to Target Direction
  mat3 alignVector(vec3 dir) {
      vec3 up = vec3(0.0, 1.0, 0.0);
      vec3 axis = cross(up, dir);
      float angle = acos(dot(up, dir));
      
      if (length(axis) < 0.001) return mat3(1.0);
      
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;
      
      return mat3(
          oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
          oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
          oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
      );
  }

  void main() {
      vUv = uv;

      // 1. Calculate Lifecycle
      float life = mod(uTime * uOutwardSpeed + aLifeOffset, 1.0);
      vLife = life;

      // 2. Calculate Center Position of the Instance
      vec3 instanceCenter = aInstancePosition;
      
      // Move outward based on life
      instanceCenter += aDirection * (life * uOutwardDistance);
      
      // --- APPLY CURL NOISE ---
      // We sample the curl field at the particle position (moving with time)
      vec3 curl = curlNoise( instanceCenter * 0.5 - vec3(0.0, 0.0, uTime * 0.2) );
      
      // Displace position based on curl
      instanceCenter += curl * uNoiseStrength;

      // Breathing
      float breath = 1.0 + sin(uTime * 1.0) * 0.02;
      instanceCenter *= breath;

      vPos = instanceCenter; 
      vFragNoise = simpleNoise(instanceCenter * uFragmentScale);

      // 3. Orient and Scale the Mesh (Cone)
      // We mix the original direction with the curl vector for orientation
      // This makes the shards align with the "flow" of the smoke
      vec3 orientDir = normalize(aDirection + curl * 0.5);
      mat3 rotMatrix = alignVector(orientDir); 
      
      vec3 transformed = position;
      
      // Scale the geometry itself
      transformed *= uSize * aScale; 
      
      // Apply Twinkle scale
      float twinkle = 0.8 + 0.4 * sin(uTime * 3.0 + aRandomness.x * 10.0);
      transformed *= twinkle;
      vAlphaScale = twinkle;

      // Rotate geometry to point outward
      transformed = rotMatrix * transformed;

      // Move to instance position
      vec3 finalPos = instanceCenter + transformed;

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
  }
`;


const fragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uShadowPos1;
  uniform vec3 uShadowPos2;
  uniform float uShadowRadius;
  uniform float uShadowDarkness;
  uniform float uFragmentAmount;
  uniform float uLifeFadeIn;
  uniform float uLifeFadeOut;
  
  varying vec3 vPos;
  varying float vAlphaScale;
  varying float vLife;
  varying float vFragNoise;
  varying vec2 vUv;

  void main() {
      float alpha = 1.0;

      // Lifecycle Fade
      float lifeFade = smoothstep(0.0, uLifeFadeIn, vLife) * (1.0 - smoothstep(uLifeFadeOut, 1.0, vLife));
      alpha *= lifeFade;

      // Fragmentation
      float noiseVal = vFragNoise * 0.5 + 0.5;
      float structuralIntegrity = mix(1.0, noiseVal, uFragmentAmount);
      alpha *= structuralIntegrity;

      // Color Gradient
      vec3 finalColor = mix(uColor1, uColor2, (vPos.y + 5.0) / 10.0);

      // Rim Light / Core Brightness
      float core = 1.0 - abs(vUv.x - 0.5) * 2.0;
      finalColor += vec3(0.5) * core; 

      // Shadows
      float distToShadow1 = distance(vPos, uShadowPos1);
      float shadowFactor1 = smoothstep(0.0, uShadowRadius, distToShadow1);
      
      float distToShadow2 = distance(vPos, uShadowPos2);
      float shadowFactor2 = smoothstep(0.0, uShadowRadius, distToShadow2);

      float totalShadow = shadowFactor1 * shadowFactor2;
      alpha *= totalShadow;
      
      vec3 dimColor = finalColor * uShadowDarkness;
      finalColor = mix(dimColor, finalColor, totalShadow);

      gl_FragColor = vec4(finalColor, alpha * vAlphaScale);
  }
`;

export function EnergyRing(props: EnergyRingProps) {
  const config = { ...defaultProps, ...props };
  
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const modelRef = useRef<THREE.Group>(null);
  const shadowPivotRef = useRef({ angle: 0 });

  // Shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: config.shardSize },
        uColor1: { value: new THREE.Color(config.color1) },
        uColor2: { value: new THREE.Color(config.color2) },
        uNoiseStrength: { value: config.noiseStrength },
        uOutwardSpeed: { value: config.outwardSpeed },
        uOutwardDistance: { value: config.outwardDistance },
        uLifeFadeIn: { value: config.lifeFadeIn },
        uLifeFadeOut: { value: config.lifeFadeOut },
        uShadowPos1: { value: new THREE.Vector3(10, 0, 0) },
        uShadowPos2: { value: new THREE.Vector3(-10, 0, 0) },
        uShadowRadius: { value: config.shadowRadius },
        uShadowDarkness: { value: config.shadowDarkness },
        uFragmentScale: { value: config.fragmentScale },
        uFragmentSpeed: { value: config.fragmentSpeed },
        uFragmentAmount: { value: config.fragmentAmount }
      },
      vertexShader: commonVertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
  }, []);

  // Update uniforms when props change
  useEffect(() => {
    material.uniforms.uSize.value = config.shardSize;
    material.uniforms.uColor1.value.set(config.color1);
    material.uniforms.uColor2.value.set(config.color2);
    material.uniforms.uNoiseStrength.value = config.noiseStrength;
    material.uniforms.uOutwardSpeed.value = config.outwardSpeed;
    material.uniforms.uOutwardDistance.value = config.outwardDistance;
    material.uniforms.uLifeFadeIn.value = config.lifeFadeIn;
    material.uniforms.uLifeFadeOut.value = config.lifeFadeOut;
    material.uniforms.uShadowRadius.value = config.shadowRadius;
    material.uniforms.uShadowDarkness.value = config.shadowDarkness;
    material.uniforms.uFragmentScale.value = config.fragmentScale;
    material.uniforms.uFragmentSpeed.value = config.fragmentSpeed;
    material.uniforms.uFragmentAmount.value = config.fragmentAmount;
  }, [config, material]);

  // Generate geometry
  const geometry = useMemo(() => {
    const baseGeo = new THREE.ConeGeometry(config.shardThickness, config.shardLength, 3);
    baseGeo.translate(0, config.shardLength / 2, 0);

    const count = config.particles;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const randomness = new Float32Array(count * 3);
    const directions = new Float32Array(count * 3);
    const lifeOffsets = new Float32Array(count);
    
    const ringR = config.ringRadius;

    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2; 
      const v = Math.random() * Math.PI * 2; 
      
      const t = (Math.cos(v) + 1) / 2; 
      const maxR = config.dispersalInner + t * (config.dispersalOuter - config.dispersalInner);
      const r = Math.random() * maxR;
      
      const centerX = ringR * Math.cos(u);
      const centerY = ringR * Math.sin(u);
      const centerZ = 0;

      const x = (ringR + r * Math.cos(v)) * Math.cos(u);
      const y = (ringR + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);

      const dir = new THREE.Vector3(x - centerX, y - centerY, z - centerZ);
      
      dir.x += (Math.random() - 0.5) * config.directionSpread;
      dir.y += (Math.random() - 0.5) * config.directionSpread;
      dir.z += (Math.random() - 0.5) * config.directionSpread;
      
      dir.normalize();

      positions[i*3] = x;
      positions[i*3+1] = y;
      positions[i*3+2] = z;

      scales[i] = 0.5 + Math.random() * 0.5;
      
      randomness[i*3] = Math.random();
      randomness[i*3+1] = Math.random();
      randomness[i*3+2] = Math.random();

      directions[i*3] = dir.x;
      directions[i*3+1] = dir.y;
      directions[i*3+2] = dir.z;

      lifeOffsets[i] = Math.random();
    }

    const instancedGeo = new THREE.InstancedBufferGeometry();
    instancedGeo.index = baseGeo.index;
    instancedGeo.attributes.position = baseGeo.attributes.position;
    instancedGeo.attributes.uv = baseGeo.attributes.uv;
    
    instancedGeo.setAttribute('aInstancePosition', new THREE.InstancedBufferAttribute(positions, 3));
    instancedGeo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));
    instancedGeo.setAttribute('aRandomness', new THREE.InstancedBufferAttribute(randomness, 3));
    instancedGeo.setAttribute('aDirection', new THREE.InstancedBufferAttribute(directions, 3));
    instancedGeo.setAttribute('aLifeOffset', new THREE.InstancedBufferAttribute(lifeOffsets, 1));
    
    return instancedGeo;
  }, [config.particles, config.ringRadius, config.dispersalInner, config.dispersalOuter, 
      config.directionSpread, config.shardThickness, config.shardLength]);

  // Animation loop
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = elapsedTime;
    }

    if (meshRef.current) {
      const rotSpeed = config.rotationSpeed * 0.01;
      meshRef.current.rotation.z -= rotSpeed;
    }

    if (coreRef.current) {
      const rotSpeed = config.rotationSpeed * 0.01;
      coreRef.current.rotation.z -= rotSpeed;
    }

    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }

    // Shadow Logic
    shadowPivotRef.current.angle += config.shadowSpeed * 0.02;
    
    const sX1 = Math.cos(shadowPivotRef.current.angle) * config.ringRadius;
    const sY1 = Math.sin(shadowPivotRef.current.angle) * config.ringRadius;
    material.uniforms.uShadowPos1.value.set(sX1, sY1, 0);

    const sX2 = Math.cos(shadowPivotRef.current.angle + Math.PI) * config.ringRadius;
    const sY2 = Math.sin(shadowPivotRef.current.angle + Math.PI) * config.ringRadius;
    material.uniforms.uShadowPos2.value.set(sX2, sY2, 0);
  });

  return (
    <group>
      {/* Core Ring */}
      <mesh ref={coreRef}>
        <torusGeometry args={[config.ringRadius, 0.05, 16, 100]} />
        <meshStandardMaterial
          color={0x000000}
          emissive={config.color1}
          emissiveIntensity={2}
          roughness={0.1}
          metalness={1.0}
        />
      </mesh>
      
      {/* GLB Model */}
      {config.modelPath && (
        <group ref={modelRef}>
          <TriangleModel 
            baseColor={config.modelColor}
            scale={config.modelScale} 
            position={config.modelPosition} 
            rotation={config.modelRotation} 
          />
        </group>
      )}

      {/* Particle System */}
      <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
