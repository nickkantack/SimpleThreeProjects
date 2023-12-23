import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

import { SkyWithDirectionalLight } from './scenics.js';

let productMesh = null;
let productMeshArgument = 0;
let sprayDroplets = [];
let sprayDropletDirections = [];

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

function createSpray(scene) {

    for (let i = 0; i < 1000; i++) {
        const geometry = new THREE.BoxGeometry(.02, .02, .02);
        const material = new THREE.MeshStandardMaterial({color: 0xffffff00});
        const centerCube = new THREE.Mesh(geometry, material); 
        centerCube.position.y = 0.25;
        centerCube.rotation.x = Math.random(); 
        centerCube.rotation.y = Math.random(); 
        centerCube.rotation.z = Math.random(); 
        scene.add(centerCube);

        sprayDroplets.push(centerCube);
        sprayDropletDirections.push(new THREE.Vector3(Math.random() - 3, 0.5 - Math.random(), 0.5 - Math.random()));
    }

}

if (WebGL.isWebGLAvailable()) {
    
    const scene = new THREE.Scene();
    // PerspectiveCamera(vertical fov angle degrees, aspect ratio (width/height), near plane distance, far plane distance)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createSpray(scene);

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

        // First if is used to stop the animation after it has repeated a few times
        if (productMeshArgument < 2 * Math.PI) {

            // This if defers trying to manipulated the productMesh until it is defined (since this method might be called before the 
            // mesh is loaded)
            if (productMesh) {
                productMeshArgument += 0.02;
                if (Math.sin(productMeshArgument) > 0) {
                    // In this phase of the animation, the product is being attached/detached from the can
                    productMesh.position.y = 0.5 * Math.sin(productMeshArgument);
                    if (sprayDroplets[0].position.x < 0) {
                        for (let i = 0; i < sprayDroplets.length; i++) {
                            sprayDroplets[i].position.x = 0;
                            sprayDroplets[i].position.y = 0.25;
                            sprayDroplets[i].position.z = 0;
                        }
                    }
                } else {
                    // in this phase of the animation, the can is sparing will the product is seated on the can
                    productMesh.position.y = 0;
                    for (let i = 0; i < sprayDroplets.length; i++) {
                        if (i < (productMeshArgument % (Math.PI * 2) - Math.PI) / Math.PI * sprayDroplets.length) {
                            sprayDroplets[i].position.add(sprayDropletDirections[i].clone().multiplyScalar(0.01));
                        }
                    }
                }
            }
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
