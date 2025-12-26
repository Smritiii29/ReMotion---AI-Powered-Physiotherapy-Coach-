import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/all';
import Lenis from 'lenis';
import shakerModel from './woman.glb'; 


gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  const modelContainerRef = useRef(null);
  const productOverviewRef = useRef(null);

  useEffect(() => {
    // Wait for DOM to be fully ready
    const init = () => {
      if (!productOverviewRef.current || !modelContainerRef.current) return;

      // --- Lenis ---
      const lenis = new Lenis();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      // --- Text Splitting (now safely after render) ---
      requestAnimationFrame(() => {
        const headerSplit = new SplitText('.header-1 h1', { type: 'chars', charsClass: 'char' });
        const titleSplit = new SplitText('.tooltip .title h2', { type: 'lines', linesClass: 'line' });
        const descriptionSplits = new SplitText('.tooltip .description p', {
          type: 'lines',
          linesClass: 'line',
        });

        headerSplit.chars.forEach((char) => {
          char.innerHTML = `<span>${char.innerHTML}</span>`;
        });
        [...titleSplit.lines, ...descriptionSplits.lines].forEach((line) => {
          line.innerHTML = `<span>${line.innerHTML}</span>`;
        });
      });

      // --- Three.js Setup ---
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      modelContainerRef.current.appendChild(renderer.domElement); // Now safe

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
      mainLight.position.set(1, 2, 3);
      mainLight.castShadow = true;
      scene.add(mainLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
      fillLight.position.set(-2, 0, -2);
      scene.add(fillLight);

      let model;
      let currentRotation = 0;
      let modelSize;

      const loader = new GLTFLoader();
      
      loader.load(
        shakerModel,  // ← This is now the correct resolved URL
        (gltf) => {
          console.log('Model loaded successfully!');
          model = gltf.scene;

          model.traverse((node) => {
            if (node.isMesh && node.material) {
              node.material.metalness = 0.05;
              node.material.roughness = 0.9;
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          modelSize = box.getSize(new THREE.Vector3());
          scene.add(model);
          setupModel();
        },
        (progress) => {
          console.log(`Loading: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
          console.error('Error loading model:', error);
        }
      );

    // OG FUNCTION FOR MODEL IS HERE ************************

      function setupModel() {
        if (!model || !modelSize) return;
        const isMobile = window.innerWidth < 1000;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        model.position.set(
          isMobile ? center.x + modelSize.x * 1 : -center.x - modelSize.x * 0.001,
          -center.y + modelSize.y * 0.085,
          -center.z
        );
        model.rotation.z = isMobile ? 0 : THREE.MathUtils.degToRad(-1);

        const cameraDistance = isMobile ? 2 : 1.25;
        camera.position.set(0, 0, Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance);
        camera.lookAt(0, 0, 0);
      }


    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        setupModel();
      };
      window.addEventListener('resize', handleResize);

      // --- ScrollTrigger (unchanged logic) ---
      const tlOptions = { duration: 1, ease: "power3.out", stagger: 0.025 };

      ScrollTrigger.create({
        trigger: productOverviewRef.current,
        start: "75% bottom",
        onEnter: () => gsap.to(".header-1 h1 .char > span", { y: "0%", ...tlOptions }),
        onLeaveBack: () => gsap.to(".header-1 h1 .char > span", { y: "100%", ...tlOptions }),
      });

      ScrollTrigger.create({
        trigger: productOverviewRef.current,
        start: "top top",
        end: "+=1000%",
        pin: true,
        scrub: 1,
        onUpdate: ({ progress }) => {
          // Your exact original progress logic below (unchanged)
          const headerProgress = gsap.utils.clamp(0, 1, (progress - 0.05) / 0.3);
          gsap.to(".header-1", { xPercent: progress < 0.05 ? 0 : progress > 0.35 ? -100 : -100 * headerProgress });

          const maskSize = progress < 0.2 ? 0 : progress > 0.3 ? 100 : 100 * ((progress - 0.2) / 0.1);
          gsap.to(".circular-mask", { clipPath: `circle(${maskSize}% at 50% 50%)` });

          const header2Progress = (progress - 0.15) / 0.35;
          const header2X = progress < 0.15 ? 100 : progress > 0.5 ? -200 : 100 - 300 * header2Progress;
          gsap.to(".header-2", { xPercent: header2X });

          const scaleX = progress < 0.45 ? 0 : progress > 0.65 ? 1 : (progress - 0.45) / 0.2;
          gsap.to(".tooltip .divider", { scaleX });

          gsap.to(".tooltip:nth-child(1) .icon ion-icon, .tooltip:nth-child(1) .title .line > span, .tooltip:nth-child(1) .description .line > span", {
            y: progress >= 0.65 ? "0%" : "125%",
            ...tlOptions
          });
          gsap.to(".tooltip:nth-child(2) .icon ion-icon, .tooltip:nth-child(2) .title .line > span, .tooltip:nth-child(2) .description .line > span", {
            y: progress >= 0.85 ? "0%" : "125%",
            ...tlOptions
          });

          if (model && progress > 0.05) {
            const rotationProgress = (progress - 0.05) / 0.95;
            const target = Math.PI * 3 * 4 * rotationProgress;
            const diff = target - currentRotation;
            if (Math.abs(diff) > 0.001) {
              model.rotateOnAxis(new THREE.Vector3(0, 1, 0), diff);
              currentRotation = target;
            }
          }
        }
      });

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        lenis.destroy();
        ScrollTrigger.getAll().forEach(st => st.kill());
        renderer.dispose();
      };
    };

    // Run init after first render
    requestAnimationFrame(init);

  }, []);

  return (
    // Your JSX is unchanged
    <div className="app-container">
      <section 
  className="intro"
  
>
  {/* Animated background elements */}
  <div 
    style={{
      position: 'absolute',
      top: '20%',
      left: '10%',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(40, 153, 151, 0.1) 0%, rgba(27, 85, 80, 0) 70%)',
      filter: 'blur(40px)',
      animation: 'float 6s ease-in-out infinite',
    }}
  />
  
  <div 
    style={{
      position: 'absolute',
      bottom: '15%',
      right: '15%',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(74, 181, 179, 0.15) 0%, rgba(10, 42, 38, 0) 70%)',
      filter: 'blur(30px)',
      animation: 'float 8s ease-in-out infinite 1s',
    }}
  />
  
  <div 
    style={{
      position: 'absolute',
      top: '60%',
      left: '30%',
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124, 214, 212, 0.1) 0%, rgba(27, 85, 80, 0) 70%)',
      filter: 'blur(25px)',
      animation: 'float 10s ease-in-out infinite 2s',
    }}
  />

  {/* Main heading with animated gradient */}
  <h1 
    style={{
      fontSize: 'clamp(3rem, 6vw, 5rem)',
      fontWeight: 800,
      textAlign: 'center',
      maxWidth: '900px',
      lineHeight: 1.1,
      position: 'relative',
      zIndex: 2,
      padding: '2rem',
    }}
  >
    {/* Gradient text with animation */}
    <span 
      style={{
        background: 'linear-gradient(90deg, #e6f7f6, #4ab5b3, #289997, #1b5550, #289997, #4ab5b3, #e6f7f6)',
        backgroundSize: '300% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmer 8s linear infinite',
        display: 'inline-block',
      }}
    >
      ReMotion doesn't treat.
    </span>
    
    <br />
    
    <span 
      style={{
        background: 'linear-gradient(90deg, #289997, #4ab5b3, #e6f7f6, #4ab5b3, #289997)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmer 6s linear infinite reverse',
        display: 'inline-block',
        marginTop: '1rem',
        fontSize: 'clamp(3.5rem, 7vw, 6rem)',
        fontWeight: 900,
        letterSpacing: '-0.02em',
      }}
    >
      It transforms!
    </span>
    
    {/* Animated underline */}
    <div 
      style={{
        width: '60%',
        height: '4px',
        margin: '3rem auto 0',
        background: 'linear-gradient(90deg, transparent, #289997, #4ab5b3, #289997, transparent)',
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #e6f7f6, #7cd6d4, transparent)',
          animation: 'slide 3s ease-in-out infinite',
        }}
      />
    </div>
  </h1>

  {/* Decorative elements */}
  <div 
    style={{
      position: 'absolute',
      bottom: '5%',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 2,
    }}
  >
    <div 
      style={{
        color: '#4ab5b3',
        fontSize: '1.5rem',
        animation: 'bounce 2s ease-in-out infinite',
      }}
    >
      ↓
    </div>
    <p 
      style={{
        color: '#e6f7f6',
        fontSize: '0.9rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        opacity: 0.7,
      }}
    >
      Scroll to explore
    </p>
  </div>

  {/* Add animation styles */}
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    @keyframes shimmer {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    
    @keyframes slide {
      0% { left: -100%; }
      50% { left: 100%; }
      100% { left: 100%; }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(10px); }
    }
    
    .intro h1 span {
      position: relative;
      display: inline-block;
    }
    
    .intro h1 span::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transform: translateX(-100%);
      animation: shine 4s ease-in-out infinite;
    }
    
    @keyframes shine {
      0% { transform: translateX(-100%); }
      50%, 100% { transform: translateX(100%); }
    }
  `}</style>
</section>

      <section className="product-overview" ref={productOverviewRef}>
        <div className="header-1">
          <h1>Every Recovery Starts With</h1>
        </div>
        <div className="header-2">
          <h2>ReMotion</h2>
        </div>

        <div className="circular-mask"></div>

        <div className="tooltips">
          <div className="tooltip">
            <div className="icon"><ion-icon name="flash"></ion-icon></div>
            <div className="divider"></div>
            <div className="title"><h2>Engage and Motivate</h2></div>
            <div className="description">
              <p>Immersive gamified exercises that keep patients of all ages motivated and actively participating in their recovery.</p>
            </div>
          </div>
          <div className="tooltip">
            <div className="icon"><ion-icon name="bluetooth"></ion-icon></div>
            <div className="divider"></div>
            <div className="title"><h2>Track and Optimize</h2></div>
            <div className="description">
              <p>Powerful tools for therapists to monitor progress, customize sessions, and deliver personalized rehabilitation anytime, anywhere.</p>
            </div>
          </div>
        </div>

        <div className="model-container" ref={modelContainerRef}></div>
      </section>

      <section className="outro">
        <h1>Don't just recover. ReMotion</h1>
      </section>
    </div>
  );
};

export default App;