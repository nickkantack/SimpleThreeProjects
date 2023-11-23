import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    camera.position.z = 5;

    initSky(scene);

    const controls = new OrbitControls(camera, renderer.domElement);

    function animate() {
        requestAnimationFrame(animate);

        centerCube.rotation.x += 0.01;
        centerCube.rotation.y += 0.01;

        controls.update();

        renderer.render(scene, camera);
    }
	animate();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}


function initSky(scene) {
    const sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );
    // sky.material.uniforms.up.value = new THREE.Vector3(1, 0, 0);
    const sun = new THREE.Vector3();
    const elevation = 2;
    const azimuth = 180;
    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = 10;
    uniforms[ 'rayleigh' ].value = 3;
    uniforms[ 'mieCoefficient' ].value = 0.005;
    uniforms[ 'mieDirectionalG' ].value = 0.7;
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords( 1, phi, theta );
    uniforms[ 'sunPosition' ].value.copy( sun );
}