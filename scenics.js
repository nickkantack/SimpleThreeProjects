
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

class SkyWithDirectionalLight {

    sky;
    directionalLight;
    sunPositionSpherical;

    constructor(input) {

        this.sky = new Sky();
        this.sky.scale.setScalar(450000);
        input.scene.add(this.sky);
        // sky.material.uniforms.up.value = new THREE.Vector3(1, 0, 0);
        const uniforms = this.sky.material.uniforms;
        uniforms['turbidity'].value = 7.1;
        uniforms['rayleigh'].value = 1.119;
        uniforms['mieCoefficient'].value = 0.001;
        uniforms['mieDirectionalG'].value = 0.956;
        input.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        input.renderer.toneMappingExposure = 0.083;
        const phi = THREE.MathUtils.degToRad(90 - input.elevation);
        const theta = THREE.MathUtils.degToRad(input.azimuth);
        this.sunPositionSpherical = new THREE.Spherical(1, phi, theta);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        this.#commitNewSunCoordinates();
        input.scene.add(this.directionalLight);
    }

    tickSunPosition(deltaPhi, deltaTheta) {

        this.sunPositionSpherical.phi += deltaPhi;
        this.sunPositionSpherical.theta += deltaTheta;
        this.#commitNewSunCoordinates();

    }

    #commitNewSunCoordinates() {
        this.sky.material.uniforms['sunPosition'].value.setFromSphericalCoords(1, this.sunPositionSpherical.phi,
            this.sunPositionSpherical.theta);
        this.directionalLight.position.copy(this.sky.material.uniforms['sunPosition'].value);
    }

}

export { SkyWithDirectionalLight }