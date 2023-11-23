import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { SkyWithDirectionalLight } from './scenics.js';

if ( WebGL.isWebGLAvailable() ) {
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshStandardMaterial( { color: 0xfffffff } );
    const centerCube = new THREE.Mesh( geometry, material );
    scene.add(centerCube);

    const xCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: 0x00ff00}));
    xCube.position.x = 2;
    xCube.rotation.y = Math.PI / 4;
    xCube.rotation.x = Math.PI / 4;
    scene.add(xCube);
    const yCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: 0xff0000}));
    yCube.position.y = 2;
    yCube.rotation.y = Math.PI / 4;
    yCube.rotation.x = Math.PI / 4;
    scene.add(yCube);

    camera.position.z = 5;

    const skyWithDirectionalLight = new SkyWithDirectionalLight(0, 180, scene, renderer);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Add the resize listener
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render();
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
	document.getElementById( 'container' ).appendChild( warning );
}
