# Energy Ring - React Three Fiber Component

A dynamic energy ring particle system built with React Three Fiber, TypeScript, and custom GLSL shaders featuring curl noise and advanced visual effects.

## 🚀 Getting Started

### Installation

```bash
cd ring-react
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## 📦 Component Usage

The `EnergyRing` component is fully customizable through props:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EnergyRing } from './components/EnergyRing';

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 16], fov: 60 }}>
      <EnergyRing
        // Geometry Settings
        particles={12000}
        ringRadius={5.0}
        dispersalInner={0.2}
        dispersalOuter={1.5}
        directionSpread={0.1}
        
        // Visual Settings
        color1="#00d2ff"
        color2="#3a7bd5"
        shardSize={0.5394}
        shardLength={0.5282}
        shardThickness={0.03}
        
        // Animation/Physics
        outwardSpeed={0.5}
        outwardDistance={2.0}
        lifeFadeIn={0.1}
        lifeFadeOut={0.6}
        noiseStrength={0.352}
        rotationSpeed={0.2}
        
        // Shadows
        shadowSpeed={0.0}
        shadowRadius={0.0}
        shadowDarkness={0.0}
        
        // Fragmentation
        fragmentScale={1.0}
        fragmentSpeed={0.2}
        fragmentAmount={0.5}
      />
      
      <OrbitControls enableDamping />
      
      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.05}
          radius={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
}
```

## 🎨 Props Interface

### Geometry Settings
- `particles?: number` - Number of particle instances (default: 12000)
- `ringRadius?: number` - Base radius of the ring (default: 5.0)
- `dispersalInner?: number` - Inner dispersal distance (default: 0.2)
- `dispersalOuter?: number` - Outer dispersal distance (default: 1.5)
- `directionSpread?: number` - Random spread in particle direction (default: 0.1)

### Visual Settings
- `color1?: string` - Inner/primary color (default: '#00d2ff')
- `color2?: string` - Outer/secondary color (default: '#3a7bd5')
- `shardSize?: number` - Global scale of shards (default: 0.5394)
- `shardLength?: number` - Length of individual shards (default: 0.5282)
- `shardThickness?: number` - Thickness of shards (default: 0.03)

### Animation/Physics Settings
- `outwardSpeed?: number` - Speed of outward movement (default: 0.5)
- `outwardDistance?: number` - Maximum outward travel distance (default: 2.0)
- `lifeFadeIn?: number` - Fade in duration (0-1) (default: 0.1)
- `lifeFadeOut?: number` - Fade out start point (0-1) (default: 0.6)
- `noiseStrength?: number` - Turbulence/curl noise strength (default: 0.352)
- `rotationSpeed?: number` - Ring rotation speed (default: 0.2)
- `shadowSpeed?: number` - Shadow orbit speed (default: 0.0)

### Shadow Settings
- `shadowRadius?: number` - Radius of shadow effect (default: 0.0)
- `shadowDarkness?: number` - Intensity of shadows (default: 0.0)

### Fragmentation Settings
- `fragmentScale?: number` - Scale of fragmentation noise (default: 1.0)
- `fragmentSpeed?: number` - Speed of fragmentation animation (default: 0.2)
- `fragmentAmount?: number` - Amount of fragmentation (default: 0.5)

### Bloom Settings (Apply at EffectComposer level)
- `bloomStrength?: number` - Bloom intensity (default: 1.8)
- `bloomRadius?: number` - Bloom radius (default: 0.5)
- `bloomThreshold?: number` - Bloom threshold (default: 0.05)

## 🛠️ Technologies

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Post-processing effects
- **Three.js** - 3D graphics library
- **Leva** - GUI controls for development

## 📁 Project Structure

```
ring-react/
├── src/
│   ├── components/
│   │   └── EnergyRing.tsx    # Main component
│   ├── App.tsx                # Demo app with Leva controls
│   ├── App.css
│   ├── main.tsx               # Entry point
│   ├── index.css
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎮 Interactive Controls

The demo app includes Leva GUI controls for real-time adjustment of all parameters. Access the controls panel in the top-right corner when running the dev server.

## 🔧 Customization

You can easily customize the component by:

1. **Passing props directly** - Override any default value
2. **Modifying shaders** - Edit the vertex/fragment shaders in `EnergyRing.tsx`
3. **Adjusting defaults** - Change the `defaultProps` object
4. **Adding new effects** - Extend the shader uniforms and GLSL code

## 📝 Notes

- The component uses instanced rendering for optimal performance
- Curl noise is computed in the vertex shader for realistic turbulence
- All props are optional and have sensible defaults
- The component is fully TypeScript typed for autocomplete and type safety

## 🐛 Performance Tips

- Reduce `particles` count for better performance on lower-end devices
- Adjust `bloomStrength` and bloom settings for performance vs quality
- Use `fragmentAmount` sparingly as it adds computational overhead
- Consider using `React.memo` when embedding in larger applications

## 📄 License

MIT
