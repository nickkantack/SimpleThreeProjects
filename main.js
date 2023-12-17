import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { SkyWithDirectionalLight } from './scenics.js';

if (WebGL.isWebGLAvailable()) {
    
    const scene = new THREE.Scene();
    // PerspectiveCamera(vertical fov angle degrees, aspect ratio (width/height), near plane distance, far plane distance)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({color: 0xfffffff});
    const centerCube = new THREE.Mesh(geometry, material);
    centerCube.position.x = 3;
    scene.add(centerCube);

    camera.position.z = 5;

    const skyWithDirectionalLight = new SkyWithDirectionalLight({elevation: 0, azimuth: 180, scene: scene, renderer: renderer});

    const controls = new OrbitControls(camera, renderer.domElement);

    // Add the resize listener
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render();
    }); 

    const loader = new GLTFLoader();
    loader.load('./Bear.glb', function (gltf) {
        gltf.scene.position.setX(0);
        gltf.scene.position.setY(0);
        gltf.scene.rotation.y = Math.PI;
        const newMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
        gltf.scene.traverse((o) => {
            if (o.isMesh) o.material = newMaterial;
        });
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    });

    // Start the anmiation
    function animate() {
        requestAnimationFrame(animate);

        centerCube.rotation.x += 0.01;
        centerCube.rotation.y += 0.01;

        skyWithDirectionalLight.tickSunPosition(0, -0.001);
        skyWithDirectionalLight.sunPositionSpherical.phi = Math.PI / 2 - 1 / 20 + Math.sin(Date.now() / 1000) / 20;

        controls.update();

        renderer.render(scene, camera);
    }
	animate();

} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);
}
