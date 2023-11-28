import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './index.scss';

export default function TextArea(props) {
    const animationRef = useRef(null);
    // handle the animation play and hide.
    const [isPlay, setIsPlay] = useState(true);
    const getAnimationClassName = () => {
        return `text-container ${isPlay ? 'play' : ''}`
    }
    const inactivePosition = { right: "20%", bottom: "0", width: "10rem", height: "10rem" };
    const activePosition = { left: "50%", top: "60%", transform: "translate(-50%, -50%)", width: "35rem", height: "35rem" };
    const homeInactivePosition = { right: "0", top: "20%", width: "10rem", height: "10rem" };
    const [position, setPosition] = useState(activePosition);

    const handleClick = (event) => {
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;
        const margin = 50; // Define corner area
        const isCornerClick = (
            (clientX < margin && clientY < margin) ||
            (clientX > innerWidth - margin && clientY < margin) ||
            (clientX < margin && clientY > innerHeight - margin) ||
            (clientX > innerWidth - margin && clientY > innerHeight - margin)
        );

        if (isCornerClick) {
            setIsPlay(prevState => !prevState); // Toggle animation visibility
            setPosition(prevState => {
                if (prevState.width === inactivePosition.width) {
                    return activePosition;
                } else {
                    if (props.pathName === "/") return homeInactivePosition;
                    return inactivePosition;
                }
            });
        }
    }


    useEffect(() => {
        let camera, scene, renderer;
        const clock = new THREE.Clock();
        let mixer;
        window.addEventListener('click', handleClick);


        function init() {
            //creat the scene
            scene = new THREE.Scene();
            scene.background = null;

            //creat the camera
            camera = new THREE.PerspectiveCamera(75, animationRef.current.clientWidth / animationRef.current.clientHeight, 1, 1000);
            camera.position.set(0, 0.5, 6);

            //creat the renderer
            renderer = new THREE.WebGLRenderer({ alpantialias: true, alpha: true });
            renderer.setSize(animationRef.current.clientWidth, animationRef.current.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            animationRef.current.appendChild(renderer.domElement);

            // Add a light source & shadow
            // const hemiLight = new THREE.HemisphereLight(0xcccccc, 0xffffff, 1, 2);
            // hemiLight.position.set(0, 300, 0);
            // scene.add(hemiLight);

            const dirLight = new THREE.DirectionalLight(0xcccccc);
            dirLight.position.set(0, 300, 100);
            dirLight.castShadow = true;
            scene.add(dirLight);
            // dirLight.shadow.camera.top = 180;
            // dirLight.shadow.camera.bottom = - 100;
            // dirLight.shadow.camera.left = - 120;
            // dirLight.shadow.camera.right = 120;
            // Add an ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 2); // soft white light
            scene.add(ambientLight);

            // Model loading fbx
            const manager = new THREE.LoadingManager();
            manager.addHandler(/\.tga$/i, new TGALoader());
            // Model loading glb
            const loader = new GLTFLoader(manager);
            loader.load('IP_test/IP_Anim_test01.glb', function (gltf) {
                const model = gltf.scene;
                model.position.set(0, -3.5, 0);
                console.log(model);
                mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });

                model.traverse(function (child) {
                    console.log(child);
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                    if (child.isSkinnedMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        let material = child.material;
                        if (Array.isArray(material)) {
                            // Sometimes the material is an array of materials
                            material.forEach((mat) => {
                                mat.depthWrite = true;
                            });
                        } else {
                            // Single material
                            material.depthWrite = true;
                        }
                    }

                });
                model.scale.set(10, 10, 10);
                scene.add(model);

            });

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 0, 0);
            controls.update();

            // Stats
            // stats = new Stats();
            // animationRef.current.appendChild(stats.dom);

            window.addEventListener('resize', onWindowResize);
        }

        function onWindowResize() {
            camera.aspect = animationRef.current.clientWidth / animationRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(animationRef.current.clientWidth, animationRef.current.clientHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            const delta = clock.getDelta();
            if (mixer) mixer.update(delta);

            renderer.render(scene, camera);
            // stats.update();
        }

        init();
        animate();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            if (animationRef.current) {
                animationRef.current.removeChild(renderer.domElement);
            }
            window.removeEventListener('click', handleClick)
        };
    }, [isPlay]);

    return (
        <section className="voiceDetect" style={position}>
            <div className={getAnimationClassName()}><textarea id="tips" defaultValue={"Hello 我是小轩"}></textarea></div>
            <div id="AnimationIP" ref={animationRef}></div>
        </section>
    );
}
