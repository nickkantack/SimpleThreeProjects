import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

import { SkyWithDirectionalLight } from './scenics.js';

import { isJoystickHeldMap, joystickToVectorMap } from './controlsOverlay.js';

import { updateControls, evolvePhysics } from './flightEngine.js';

import { createPlaneGroup, getAlignmentQuaternion } from './planeModel.js';


if (WebGL.isWebGLAvailable()) {
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 5;
    camera.position.x = 1;

    const skyWithDirectionalLight = new SkyWithDirectionalLight({elevation: 30, azimuth: 40, scene: scene, renderer: renderer});

    // Add the resize listener
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render();
    }); 

    const planeGroup = createPlaneGroup(scene);

    // Create the ground
    const groundGeometry = new THREE.BoxGeometry();
    const groundMaterial = new THREE.MeshStandardMaterial({color: 0x33ff33});
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.scale.set(0.1, 100, 100);
    groundMesh.position.x = -0.4;
    scene.add(groundMesh);

    // Start the anmiation
    function animate() {
        requestAnimationFrame(animate);

        let rightJoystickVector = [0, 0];
        if (isJoystickHeldMap["lowerJoystick"]) {
            rightJoystickVector = joystickToVectorMap["lowerJoystick"];
        }

        let leftJoystickVector = [0, 0];
        if (isJoystickHeldMap["upperJoystick"]) {
            leftJoystickVector = joystickToVectorMap["upperJoystick"];
        }

        updateControls(leftJoystickVector, rightJoystickVector);

        const newPositionAndAttitude = evolvePhysics();

        // Change the model's position and attitude accordingly
        planeGroup.position.copy(newPositionAndAttitude[0]);
        planeGroup.rotation.setFromQuaternion(getAlignmentQuaternion(newPositionAndAttitude[1], newPositionAndAttitude[2]));

        // Make the camera follow the plane
        camera.lookAt(planeGroup.position);

        renderer.render(scene, camera);
    }
	animate();

} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);
}
