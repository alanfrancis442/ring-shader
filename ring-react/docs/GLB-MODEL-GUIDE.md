# GLB Model Integration Guide

## 📦 Setup

The boilerplate code has been added to the `EnergyRing` component. Here's how to use it:

## 🎯 Quick Start

### 1. Add your GLB model to the project

Place your `.glb` or `.gltf` file in the `public` folder:
```
ring-react/
├── public/
│   └── models/
│       └── your-model.glb    <- Put your model here
├── src/
└── ...
```

### 2. Use the component with modelPath prop

```tsx
import { EnergyRing } from './components/EnergyRing';

<EnergyRing
  modelPath="/models/your-model.glb"
  modelScale={1.0}
  modelPosition={[0, 0, 0]}
  modelRotation={[0, 0, 0]}
/>
```

## 📝 New Props

The following props have been added to `EnergyRingProps`:

- **`modelPath?: string`** - Path to your GLB model (relative to public folder)
- **`modelScale?: number`** - Uniform scale of the model (default: 1.0)
- **`modelPosition?: [number, number, number]`** - Position [x, y, z] (default: [0, 0, 0])
- **`modelRotation?: [number, number, number]`** - Rotation [x, y, z] in radians (default: [0, 0, 0])

## 💡 Examples

### Example 1: Basic Model Loading
```tsx
<EnergyRing modelPath="/models/ring.glb" />
```

### Example 2: Scaled and Positioned Model
```tsx
<EnergyRing
  modelPath="/models/device.glb"
  modelScale={2.5}
  modelPosition={[0, 1, 0]}
  modelRotation={[Math.PI / 2, 0, 0]}
/>
```

### Example 3: Model at Ring Center
```tsx
<EnergyRing
  modelPath="/models/core.glb"
  ringRadius={5}
  modelPosition={[0, 0, 0]}  // Center of the ring
  modelScale={0.5}
/>
```

## 🎨 Adding Lights for the Model

GLB models need lighting to be visible. Add lights to your scene:

```tsx
<Canvas>
  {/* Ambient light for overall illumination */}
  <ambientLight intensity={0.5} />
  
  {/* Directional light for shadows */}
  <directionalLight position={[10, 10, 5]} intensity={1} />
  
  {/* Point light at center matching ring color */}
  <pointLight position={[0, 0, 0]} intensity={2} color="#00d2ff" />
  
  <EnergyRing modelPath="/models/your-model.glb" />
</Canvas>
```

## 🔧 Advanced: Animating the Model

If you want to animate the model separately, you can extend the component:

```tsx
// In EnergyRing.tsx, add a ref for the model
const modelRef = useRef<THREE.Group>(null);

// In useFrame:
if (modelRef.current) {
  modelRef.current.rotation.y += 0.01;
}

// Pass the ref to GLBModel:
<GLBModel ref={modelRef} path={config.modelPath} ... />
```

## 📚 See Example

Check out [src/AppWithModel.tsx](../src/AppWithModel.tsx) for a complete working example.

## 🐛 Troubleshooting

### Model not showing?
- Ensure the path starts with `/` and is relative to the `public` folder
- Check browser console for loading errors
- Verify the GLB file is in the correct location
- Add lighting to your scene (GLB models need lights!)

### Model is too big/small?
- Adjust the `modelScale` prop
- Use values like `0.1` for huge models or `10` for tiny models

### Model is in the wrong position?
- Use `modelPosition` prop to move it: `[x, y, z]`
- Use `modelRotation` prop to rotate it: `[x, y, z]` in radians
- Remember: `Math.PI / 2` = 90 degrees

## 🎮 Testing with Leva

Add controls to [src/App.tsx](../src/App.tsx):

```tsx
const config = useControls('Energy Ring Controls', {
  // ... existing controls
  
  // Model controls
  modelPath: { value: '/models/your-model.glb', label: 'Model Path' },
  modelScale: { value: 1.0, min: 0.1, max: 10, step: 0.1, label: 'Model Scale' },
  modelPosX: { value: 0, min: -10, max: 10, step: 0.1, label: 'Model X' },
  modelPosY: { value: 0, min: -10, max: 10, step: 0.1, label: 'Model Y' },
  modelPosZ: { value: 0, min: -10, max: 10, step: 0.1, label: 'Model Z' },
});

// Then pass to component:
<EnergyRing
  {...config}
  modelPosition={[config.modelPosX, config.modelPosY, config.modelPosZ]}
/>
```

## 📦 Model Resources

Free GLB models:
- [Sketchfab](https://sketchfab.com/features/gltf) - Free 3D models
- [Poly Haven](https://polyhaven.com/) - Free assets
- [glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models) - Test models
