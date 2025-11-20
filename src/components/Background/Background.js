import React, { useRef, useState, useEffect, memo, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import styles from './Background.module.css';

const GradientLights = memo(() => {
  const light1 = useRef();
  const light2 = useRef();
  const light3 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    light1.current.position.x = Math.cos(time * 0.2) * 3;
    light1.current.position.y = Math.sin(time * 0.2) * 3;
    light2.current.position.x = Math.cos(time * 0.2) * 3;
    light2.current.position.z = Math.sin(time * 0.2) * 3;
    light3.current.position.y = Math.sin(time * 0.2) * 3;
    light3.current.position.z = Math.cos(time * 0.2) * 3;
  });

  return (
    <>
      <pointLight ref={light1} position={[3, 3, 3]} intensity={0.6} color="#FFFFFF" />
      <pointLight ref={light2} position={[-3, -3, 3]} intensity={0.6} color="#FFFFFF" />
      <pointLight ref={light3} position={[0, 3, -3]} intensity={0.6} color="#FFFFFF" />
    </>
  );
});

const PhotoSphere = memo(() => {
  const photosRef = useRef();
  const [photoUrls, setPhotoUrls] = useState([]);
  const [imageDimensions, setImageDimensions] = useState([]);
  const textureLoader = new TextureLoader();

  useEffect(() => {
    const loadPhotos = async () => {
      const urls = [];
      const dimensions = [];

      for (let i = 1; i <= 10; i++) {
        const paddedNumber = String(i).padStart(2, '0');
        const url = `/images/topview/image${paddedNumber}.webp`;
        urls.push(url);

        // Load image to get dimensions
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => {
          img.onload = () => {
            dimensions.push({
              width: img.width,
              height: img.height,
              aspectRatio: img.width / img.height
            });
            resolve();
          };
          img.onerror = () => {
            dimensions.push({ width: 1, height: 1, aspectRatio: 1 });
            resolve();
          };
        });
      }

      setPhotoUrls(urls);
      setImageDimensions(dimensions);
    };

    loadPhotos();
  }, []);

  useFrame((state) => {
    if (photosRef.current) {
      const time = state.clock.getElapsedTime();
      photosRef.current.rotation.y = time * 0.05;
    }
  });

  if (photoUrls.length === 0 || imageDimensions.length === 0) {
    return null;
  }

  const photoCount = photoUrls.length;
  const positions = new Float32Array(photoCount * 3);
  const baseSize = 0.6; // Base size for height
  const radius = 2.5;

  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < photoCount; i++) {
    const theta = 2 * Math.PI * i / goldenRatio;
    const phi = Math.acos(1 - 2 * (i + 0.5) / photoCount);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return (
    <group ref={photosRef}>
      {photoUrls.map((url, i) => {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        const position = new THREE.Vector3(x, y, z);
        const normal = position.clone().normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const rotationMatrix = new THREE.Matrix4();

        const lookAt = new THREE.Vector3().addVectors(position, normal);
        rotationMatrix.lookAt(position, lookAt, up);

        const euler = new THREE.Euler();
        euler.setFromRotationMatrix(rotationMatrix);

        // Calculate width and height based on aspect ratio
        const dimension = imageDimensions[i] || { aspectRatio: 1 };
        const aspectRatio = dimension.aspectRatio;
        const photoWidth = baseSize * aspectRatio;
        const photoHeight = baseSize;

        return url && (
          <mesh
            key={i}
            position={[x, y, z]}
            rotation={[euler.x, euler.y, euler.z]}
          >
            <planeGeometry args={[photoWidth, photoHeight]} />
            <meshBasicMaterial
              side={THREE.DoubleSide}
              map={textureLoader.load(url)}
              transparent={true}
              opacity={1}
            />
          </mesh>
        );
      })}
    </group>
  );
});

const ThreeJSCanvas = memo(() => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.4} />
      <GradientLights />
      <PhotoSphere />
    </Canvas>
  );
});

export default function Background({ activeTab = 0, setActiveTab = () => {} }) {
  const handleButtonClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      marginLeft: 'calc(50% - 50vw)',
      marginRight: 'calc(50% - 50vw)',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 1,
    }}>
      <ThreeJSCanvas />

      {/* SPでカードボタンを表示するエリア */}
      <div className={styles.buttonArea}>
        <button
          className={`${styles.viewButton} ${activeTab === 0 ? styles.active : ''}`}
          onClick={() => handleButtonClick(0)}
        >
          最近の大会
        </button>
        <button
          className={`${styles.viewButton} ${activeTab === 1 ? styles.active : ''}`}
          onClick={() => handleButtonClick(1)}
        >
          大会情報
        </button>
        <button
          className={`${styles.viewButton} ${activeTab === 2 ? styles.active : ''}`}
          onClick={() => handleButtonClick(2)}
        >
          カテゴリー
        </button>
      </div>
    </div>
  );
}