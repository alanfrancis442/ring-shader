import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EnergyRing, EnergyRingProps } from './components/EnergyRing';
import { useControls, folder } from 'leva';
import './App.css';

function App() {
  const config = useControls('Energy Ring Controls', {
    'Triangle Model': folder({
      modelColor: { value: '#ffffff', label: 'Color' },
      modelScale: { value: 1.0, min: 0.1, max: 5.0, step: 0.1, label: 'Scale' },
      modelPosition: { value: [0, -0.5, 0], step: 0.1, label: 'Position' },
    }),
    
    'Ring Geometry': folder({
      ringRadius: { value: 3.474, min: 1, max: 10, step: 0.001, label: 'Radius' },
      particles: { value: 5000, min: 1000, max: 20000, step: 100, label: 'Count' },
      dispersalInner: { value: 0.0, min: 0, max: 2, step: 0.01, label: 'Dispersal Inner' },
      dispersalOuter: { value: 0.5, min: 0, max: 5, step: 0.01, label: 'Dispersal Outer' },
      directionSpread: { value: 0.15, min: 0, max: 1.0, step: 0.01, label: 'Spread' },
    }),
    
    'Shard Shape': folder({
      shardSize: { value: 0.65, min: 0.1, max: 3.0, step: 0.01, label: 'Global Scale' },
      shardLength: { value: 0.65, min: 0.1, max: 2.0, step: 0.01, label: 'Length' },
      shardThickness: { value: 0.03, min: 0.01, max: 0.2, step: 0.01, label: 'Thickness' },
    }),
    
    'Ring Colors': folder({
      color1: { value: '#00d2ff', label: 'Inner Color' },
      color2: { value: '#00429e', label: 'Outer Color' },
    }),
    
    'Physics & Movement': folder({
      outwardSpeed: { value: 1.0, min: 0, max: 2.0, step: 0.01, label: 'Dispersal Speed' },
      outwardDistance: { value: 1.68, min: 0, max: 5.0, step: 0.01, label: 'Dispersal Distance' },
      noiseStrength: { value: 0.0, min: 0, max: 2.0, step: 0.01, label: 'Turbulence' },
      rotationSpeed: { value: 0.2, min: 0, max: 2.0, step: 0.01, label: 'Rotation Speed' },
      fragmentAmount: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Noise Break' },
      fragmentScale: { value: 5.0, min: 0.1, max: 10.0, step: 0.1, label: 'Noise Scale' },
    }),
    
    'Shadows & Visibility': folder({
      shadowRadius: { value: 5.0, min: 0, max: 10, step: 0.1, label: 'Radius' },
      shadowDarkness: { value: 1.0, min: 0, max: 1.0, step: 0.01, label: 'Strength' },
      shadowSpeed: { value: 0.5, min: 0, max: 5, step: 0.01, label: 'Orbit Speed' },
      lifeFadeIn: { value: 0.3, min: 0.0, max: 1.0, step: 0.01, label: 'Fade In' },
      lifeFadeOut: { value: 1.0, min: 0.0, max: 1.0, step: 0.01, label: 'Fade Out' },
    }),
    
    'Post-Processing': folder({
      bloomStrength: { value: 1.5, min: 0, max: 3, step: 0.1, label: 'Bloom Intensity' },
      bloomRadius: { value: 0.5, min: 0, max: 2, step: 0.1, label: 'Bloom Radius' },
      bloomThreshold: { value: 0.05, min: 0, max: 1, step: 0.01, label: 'Bloom Threshold' }
    }),
  });

  return (
    <div className="app">
      <Canvas
        camera={{ position: [0, 0, 16], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: 2 // ReinhardToneMapping
        }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 0, 50]} color="#000000" near={0} far={50} />
        
        {/* Lights for the Triangle Model */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        
        <EnergyRing {...(config as EnergyRingProps)} />
        
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        <EffectComposer>
          <Bloom
            intensity={config.bloomStrength}
            luminanceThreshold={config.bloomThreshold}
            luminanceSmoothing={0.9}
            radius={config.bloomRadius}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;
