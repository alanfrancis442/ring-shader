import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EnergyRing } from './components/EnergyRing';

/**
 * Example: EnergyRing with GLB Model
 * 
 * To use this:
 * 1. Place your .glb file in the public folder (e.g., public/models/your-model.glb)
 * 2. Reference it with the path relative to public folder
 */
function AppWithModel() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 16], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: 2
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 0, 50]} />
        
        {/* Add lighting for the GLB model */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#00d2ff" />
        
        <EnergyRing
          // GLB Model props
          modelPath="/models/your-model.glb"  // Path to your model in public folder
          modelScale={1.0}                     // Scale of the model
          modelPosition={[0, 0, 0]}            // Position [x, y, z]
          modelRotation={[0, 0, 0]}            // Rotation [x, y, z] in radians
          
          // Energy ring props
          particles={12000}
          ringRadius={5.0}
          color1="#00d2ff"
          color2="#3a7bd5"
          noiseStrength={0.352}
          rotationSpeed={0.2}
        />
        
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        <EffectComposer>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
            radius={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default AppWithModel;
