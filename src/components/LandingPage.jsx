import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/all";
import Lenis from "lenis";

import shakerModel from "../woman.glb"; // adjust path if needed

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function LandingPage() {
  const modelContainerRef = useRef(null);
  const productOverviewRef = useRef(null);

  useEffect(() => {
    const init = () => {
      if (!productOverviewRef.current || !modelContainerRef.current) return;

      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      requestAnimationFrame(() => {
        const headerSplit = new SplitText(".header-1 h1", {
          type: "chars",
          charsClass: "char",
        });
        const titleSplit = new SplitText(".tooltip .title h2", {
          type: "lines",
          linesClass: "line",
        });
        const descriptionSplits = new SplitText(".tooltip .description p", {
          type: "lines",
          linesClass: "line",
        });

        headerSplit.chars.forEach((char) => {
          char.innerHTML = `<span>${char.innerHTML}</span>`;
        });

        [...titleSplit.lines, ...descriptionSplits.lines].forEach((line) => {
          line.innerHTML = `<span>${line.innerHTML}</span>`;
        });
      });

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      modelContainerRef.current.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));

      const loader = new GLTFLoader();
      let model;
      let currentRotation = 0;
      let modelSize;

      loader.load(shakerModel, (gltf) => {
        model = gltf.scene;
        scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        modelSize = box.getSize(new THREE.Vector3());
        setupModel();
      });

      function setupModel() {
        if (!model || !modelSize) return;
        camera.position.set(0, 0, modelSize.z * 1.5);
        camera.lookAt(0, 0, 0);
      }

      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        setupModel();
      });
    };

    requestAnimationFrame(init);
  }, []);

  return (
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

        <div className="model-container" ref={modelContainerRef}></div>
      </section>

      <section className="outro">
        <h1>Don't just recover. Remotion</h1>
      </section>
    </div>
  );
}
