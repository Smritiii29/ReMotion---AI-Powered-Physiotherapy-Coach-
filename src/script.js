import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';   
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/all';
import Lenis from 'lenis';

document.addEventListener("DOMContentLoaded", ()=>{
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const lenis = new Lenis();

    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add((time)=>{
        lenis.raf(time*1000);
    });
    gsap.ticker.lagSmoothing(0);

    const headerSplit = new SplitText('.header-1 h1',{type:'chars', charsClass:'char'});

    const titleSplit = new SplitText('.tooltip .title h2',{type:'lines', linesClass:'line'});

    const descriptionSplits = new SplitText(".tooltip .description p", {
  type: "lines",
  linesClass: "line"
});

    headerSplit.chars.forEach((char) => {
    char.innerHTML = `<span>${char.innerHTML}</span>`;
    });

    [...titleSplit.lines, ...descriptionSplits.lines].forEach((line) => {
    line.innerHTML = `<span>${line.innerHTML}</span>`;
    });

    const animOptions = {
    duration: 1,
    ease: "power3.out",
    stagger: 0.025
    };

        /* -------------------- Tooltip animation selectors -------------------- */

    const tooltipSelectors = [
    {
        trigger: 0.65,
        elements: [
        ".tooltip:nth-child(1) .icon ion-icon",
        ".tooltip:nth-child(1) .title .line > span",
        ".tooltip:nth-child(1) .description .line > span"
        ]
    },
    {
        trigger: 0.85,
        elements: [
        ".tooltip:nth-child(2) .icon ion-icon",
        ".tooltip:nth-child(2) .title .line > span",
        ".tooltip:nth-child(2) .description .line > span"
        ]
    }
    ];

    /* -------------------- Header animation -------------------- */

    ScrollTrigger.create({
    trigger: ".product-overview",
    start: "75% bottom",

    onEnter: () => {
        gsap.to(".header-1 h1 .char > span", {
        y: "0%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.025
        });
    },

    onLeaveBack: () => {
        gsap.to(".header-1 h1 .char > span", {
        y: "100%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.025
        });
    }
    });

    /* -------------------- Three.js setup -------------------- */

    let model;
    let currentRotation = 0;
    let modelSize;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
    );

    const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;

    document
    .querySelector(".model-container")
    .appendChild(renderer.domElement);

    /* -------------------- Lights -------------------- */

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(1, 2, 3);
    mainLight.castShadow = true;
    mainLight.shadow.bias = -0.001;
    mainLight.shadow.mapSize.set(1024, 1024);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, 0, -2);
    scene.add(fillLight);

    /* -------------------- Model positioning -------------------- */

    function setupModel() {
    if (!model || !modelSize) return;

    const isMobile = window.innerWidth < 1000;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    model.position.set(
        isMobile ? center.x + modelSize.x * 1 : -center.x - modelSize.x * 0.4,
        -center.y + modelSize.y * 0.085,
        -center.z
    );

    model.rotation.z = isMobile
        ? 0
        : THREE.MathUtils.degToRad(-25);

    const cameraDistance = isMobile ? 2 : 1.25;
    camera.position.set(
        0,
        0,
        Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance
    );

    camera.lookAt(0, 0, 0);
    }

    /* -------------------- Load GLTF model -------------------- */

    const loader = new GLTFLoader();

    loader.load("shaker.glb", (gltf) => {
    model = gltf.scene;

    model.traverse((node) => {
        if (node.isMesh && node.material) {
        Object.assign(node.material, {
            metalness: 0.05,
            roughness: 0.9
        });
        }
    });

    const box = new THREE.Box3().setFromObject(model);
    modelSize = box.getSize(new THREE.Vector3());

    scene.add(model);
    setupModel();
    });

    /* -------------------- Animation loop -------------------- */

    function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    }

    animate();

    /* -------------------- Resize handler -------------------- */

    window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    setupModel();
    });

    ScrollTrigger.create({
    trigger: ".product-overview",
    start: "top top",
    end: `+=${window.innerHeight * 10}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,

    onUpdate: ({ progress }) => {
        /* ---------------- Header 1 movement ---------------- */

        const headerProgress = Math.max(
        0,
        Math.min(1, (progress - 0.05) / 0.3)
        );

        gsap.to(".header-1", {
        xPercent:
            progress < 0.05
            ? 0
            : progress > 0.35
            ? -100
            : -100 * headerProgress
        });

        /* ---------------- Circular mask reveal ---------------- */

        const maskSize =
        progress < 0.2
            ? 0
            : progress > 0.3
            ? 100
            : 100 * ((progress - 0.2) / 0.1);

        gsap.to(".circular-mask", {
        clipPath: `circle(${maskSize}% at 50% 50%)`
        });

        /* ---------------- Header 2 movement ---------------- */

        const header2Progress = (progress - 0.15) / 0.35;

        const header2XPercent =
        progress < 0.15
            ? 100
            : progress > 0.5
            ? -200
            : 100 - 300 * header2Progress;

        gsap.to(".header-2", {
        xPercent: header2XPercent
        });

        /* ---------------- Tooltip divider scale ---------------- */

        const scaleX =
        progress < 0.45
            ? 0
            : progress > 0.65
            ? 1
            : (progress - 0.45) / 0.2;

        gsap.to(".tooltip .divider", {
        scaleX
        });

        /* ---------------- Tooltip text reveal ---------------- */

        tooltipSelectors.forEach(({ trigger, elements }) => {
        gsap.to(elements, {
            y: progress >= trigger ? "0%" : "125%",
            ...animOptions
        });
        });

        /* ---------------- Model rotation ---------------- */

        if (model && progress > 0.05) {
        const rotationProgress = (progress - 0.05) / 0.95;
        const targetRotation = Math.PI * 3 * 4 * rotationProgress;
        const rotationDiff = targetRotation - currentRotation;

        if (Math.abs(rotationDiff) > 0.001) {
            model.rotateOnAxis(
            new THREE.Vector3(0, 1, 0),
            rotationDiff
            );
            currentRotation = targetRotation;
        }
        }
    }
    });

})