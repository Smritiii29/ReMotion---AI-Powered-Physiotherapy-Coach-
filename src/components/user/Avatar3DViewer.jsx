// src/components/Avatar3DViewer.jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';

function Model({ url, scale = 1 }) {
  const { scene } = useGLTF(url);
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return <primitive object={scene} scale={scale} />;
}

export default function Avatar3DViewer({ modelUrl, className = "", scale = 1.2 }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 3], fov: 40 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        
        <Suspense fallback={null}>
          <Model url={modelUrl} scale={scale} />
          <Environment preset="city" />
          <ContactShadows 
            position={[0, -0.8, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2}
          />
        </Suspense>

        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={1.5}
          maxDistance={4}
        />
      </Canvas>
    </div>
  );
}