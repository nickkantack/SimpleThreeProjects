import * as THREE from 'three';

function createPlaneGroup(scene) {

    const material = new THREE.MeshStandardMaterial({color: 0xff0000});
    const fuselageGeometry = new THREE.SphereGeometry();
    const wingGeometry = new THREE.BoxGeometry();
    const tailGeometry = new THREE.BoxGeometry();
    const rudderGeometry = new THREE.BoxGeometry();

    // Create meshes
    const fuselageMesh = new THREE.Mesh(fuselageGeometry, material);
    fuselageMesh.scale.set(2, 0.3, 0.2);

    const wingMesh = new THREE.Mesh(wingGeometry, material);
    wingMesh.scale.set(1, 0.1, 4);

    const tailMesh = new THREE.Mesh(tailGeometry, material);
    tailMesh.scale.set(1, 0.1, 2);

    const rudderMesh = new THREE.Mesh(rudderGeometry, material);
    rudderMesh.scale.set(1, 0.5, 0.1);

    // Create a group and add the meshes to it
    const group = new THREE.Group();
    group.add(fuselageMesh);
    group.add(wingMesh);
    group.add(tailMesh);
    group.add(rudderMesh);

    fuselageMesh.position.set(0, 0, 0);
    wingMesh.position.set(0.3, 0.25, 0);
    tailMesh.position.set(-1.5, 0.15, 0);
    rudderMesh.position.set(-1.5, 0.4, 0);

    scene.add(group);

    return group;

}

function getAlignmentQuaternion(forwardVector, canopyVector) {

    const localForward = new THREE.Vector3(1, 0, 0);
    const localCanopy = new THREE.Vector3(0, 1, 0);
    const localRight = new THREE.Vector3().crossVectors(localForward, localCanopy).normalize();

    const globalRight = new THREE.Vector3().crossVectors(forwardVector, canopyVector).normalize();

    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.set(
        localForward.dot(forwardVector), localForward.dot(canopyVector), localForward.dot(globalRight), 0,
        localCanopy.dot(forwardVector), localCanopy.dot(canopyVector), localCanopy.dot(globalRight), 0,
        localRight.dot(forwardVector), localRight.dot(canopyVector), localRight.dot(globalRight), 0,
        0, 0, 0, 1
    );

    return new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

}

export { createPlaneGroup, getAlignmentQuaternion }