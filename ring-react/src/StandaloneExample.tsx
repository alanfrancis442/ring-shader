import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EnergyRing } from './components/EnergyRing';

/**
 * Standalone example without Leva controls.
 * Use this as a reference for integrating the component into your own app.
 */
function StandaloneExample() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: 2 // ReinhardToneMapping
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 0, 50]} />
        
        {/* Energy Ring with custom props */}
        <EnergyRing
          particles={15000}
          ringRadius={6}
          color1="#ff00ff"
          color2="#00ffff"
          noiseStrength={0.5}
          rotationSpeed={0.3}
        />
        
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={2.0}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
            radius={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default StandaloneExample;
