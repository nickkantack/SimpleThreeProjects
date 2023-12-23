import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

import { SkyWithDirectionalLight } from './scenics.js';

let productMesh = null;
let productMeshArgument = 0;

function buildCan(scene) {

    const stlLoader = new STLLoader();
    stlLoader.load(
        './can.stl',
        function (geometry) {
            const material = new THREE.MeshStandardMaterial({color: 0xff00c0ff});
            const mesh = new THREE.Mesh(geometry, material)
            mesh.scale.set(.01, .01, .01);
            mesh.rotation.x = -Math.PI / 2;
            scene.add(mesh)
        },
        (error) => {
            console.log(error)
        }
    );

    stlLoader.load(
        './nozzle_rim.stl',
        function (geometry) {
            const material = new THREE.MeshStandardMaterial({color: 0xffcccccc});
            const mesh = new THREE.Mesh(geometry, material)
            mesh.scale.set(.01, .01, .01);
            mesh.rotation.x = -Math.PI / 2;
            scene.add(mesh)
        },
        (error) => {
            console.log(error)
        }
    );

    stlLoader.load(
        './squirter.stl',
        function (geometry) {
            const material = new THREE.MeshStandardMaterial({color: 0xffffff00});
            const mesh = new THREE.Mesh(geometry, material)
            mesh.scale.set(.01, .01, .01);
            mesh.rotation.x = -Math.PI / 2;
            mesh.rotation.z = Math.PI / 2;
            scene.add(mesh)
        },
        (error) => {
            console.log(error)
        }
    );

}

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

    const skyWithDirectionalLight = new SkyWithDirectionalLight({elevation: 30, azimuth: 0, scene: scene, renderer: renderer});

    const controls = new OrbitControls(camera, renderer.domElement);

    // Add the resize listener
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render();
    }); 

    buildCan(scene);

    const stlLoader = new STLLoader();
    stlLoader.load(
        './product.stl',
        function (geometry) {
            const material = new THREE.MeshStandardMaterial({color: 0xff00aa00});
            const mesh = new THREE.Mesh(geometry, material)
            mesh.scale.set(.01, .01, .01);
            mesh.rotation.x = -Math.PI / 2;
            mesh.rotation.z = Math.PI / 2;
            scene.add(mesh)
            productMesh = mesh;
        },
        (error) => {
            console.log(error)
        }
    );

    // Start the anmiation
    function animate() {
        requestAnimationFrame(animate);

        centerCube.rotation.x += 0.01;
        centerCube.rotation.y += 0.01;

        if (productMesh) {
            productMeshArgument += 0.02;
            productMesh.position.y = Math.sin(productMeshArgument) > 0 ? 0.5 * Math.sin(productMeshArgument) : 0;
        }

        /*
        Rotate the sun
        skyWithDirectionalLight.tickSunPosition(0, -0.001);
        skyWithDirectionalLight.sunPositionSpherical.phi = Math.PI / 2 - 1 / 20 + Math.sin(Date.now() / 1000) / 20;
        */

        controls.update();

        renderer.render(scene, camera);
    }
	animate();

} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);
}
