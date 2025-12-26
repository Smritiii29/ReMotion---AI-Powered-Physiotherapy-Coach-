import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/all';
import Lenis from 'lenis';
import shakerModel from '../woman.glb'

gsap.registerPlugin(ScrollTrigger, SplitText);

const LandingPage = () => {
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
      <section className="intro">
        <h1>Remotion doesn't treat. It transforms!</h1>
      </section>

      <section className="product-overview" ref={productOverviewRef}>
        <div className="header-1">
          <h1>Every Recovery Starts With</h1>
        </div>
        <div className="header-2">
          <h2>Remotion</h2>
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
        <h1>Don't just recover. Remotion</h1>
      </section>
    </div>
  );
};

export default LandingPage;