
import * as THREE from 'three';

let currentElevator = 0;
let currentAileron = 0;
let currentRudder = 0;
let currentThrottle = 0;

const planeMassKg = 5;

// Kinematics
let position = new THREE.Vector3();
let velocity = new THREE.Vector3();

// Attitude
let forwardVector = new THREE.Vector3(0, -1, 0);
let canopyVector = new THREE.Vector3(1, 0, 0);
let rightWingVector = new THREE.Vector3(0, 0, -1);

let lastPhysicsStepTime = Date.now();

function updateControls(leftJoystickVector, rightJoystickVector) {

    currentThrottle = leftJoystickVector[0] / 2 + 0.5;
    currentRudder = leftJoystickVector[1];
    currentElevator = rightJoystickVector[0];
    currentAileron = rightJoystickVector[1];

}

function evolvePhysics() {

    const currentTime = Date.now();
    const dt = (currentTime - lastPhysicsStepTime) / 1000;
    lastPhysicsStepTime = currentTime;

    // Compute net forces on the plane
    let netForce = new THREE.Vector3();
    const MAX_THRUST_N = 10;
    const thrustForce = forwardVector.clone().multiplyScalar(MAX_THRUST_N * currentThrottle);
    netForce.add(thrustForce);
    const DRAG_N_PER_VEL_SQ = 0.025;
    const dragForce = velocity.clone().normalize().multiplyScalar(-DRAG_N_PER_VEL_SQ * velocity.lengthSq());
    netForce.add(dragForce);

    // Add gravity
    const GRAVITY = 15;
    const gravityForce = new THREE.Vector3(-1, 0, 0).multiplyScalar(GRAVITY);
    netForce.add(gravityForce);

    // Add lift
    const LIFT_N_PER_VEL_SQ = 0.025;
    const liftForce = canopyVector.clone().multiplyScalar(LIFT_N_PER_VEL_SQ * velocity.lengthSq());
    netForce.add(liftForce);

    const netAcceleration = netForce.clone().multiplyScalar(1 / planeMassKg);

    // Change the plane's velocity
    velocity.add(netAcceleration.multiplyScalar(dt));

    // Change the plane's position
    position.add(velocity.clone().multiplyScalar(dt));

    // Apply constraint where the plane cannot fall below the ground
    if (position.x < 0) {
        position.x = 0;
        if (velocity.x < 0) velocity.x = 0;
        // Align the canopy vector with the sky
        const correctionAngle = angleBetween(canopyVector, new THREE.Vector3(1, 0, 0));
        if (correctionAngle > 0) {
            const rotationAxis = new THREE.Vector3().crossVectors(canopyVector, new THREE.Vector3(1, 0, 0));
            const correctionQuaterion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, correctionAngle);
            forwardVector.applyQuaternion(correctionQuaterion);
            canopyVector.applyQuaternion(correctionQuaterion);
            rightWingVector.applyQuaternion(correctionQuaterion);
        }
    }

    // Drift the velocity a bit towards the forward vector 
    let correctionAngle = angleBetween(velocity, forwardVector);
    const REALIGN_FORCE = 0.8;
    if (correctionAngle > 0) {
        correctionAngle *= dt * REALIGN_FORCE;
        const rotationAxis = new THREE.Vector3().crossVectors(velocity, forwardVector);
        const correctionQuaterion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, correctionAngle);
        velocity.applyQuaternion(correctionQuaterion);
    }

    // Drift the nose a bit towards the direction of travel
    correctionAngle = angleBetween(forwardVector, velocity);
    const AERO_FORCES = 0.4;
    if (correctionAngle > 0) {
        correctionAngle *= dt * AERO_FORCES;
        const rotationAxis = new THREE.Vector3().crossVectors(forwardVector, velocity);
        const correctionQuaterion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, correctionAngle);
        forwardVector.applyQuaternion(correctionQuaterion);
        canopyVector.applyQuaternion(correctionQuaterion);
        rightWingVector.applyQuaternion(correctionQuaterion);
    }

    // Control fraction
    /*
    The control fraction helps enforce realistic degradation of control at low velocity. The
    idea is that at high and moderate velocities control surfaces work to some standard level
    of quality, but torwards zero velocity this control degrades to zero.
    */
    const CONTROL_THRESHOLD_SPEED = 10;
    const controlFraction = 1 / (1 + Math.exp(-0.3 * (velocity.length() - CONTROL_THRESHOLD_SPEED)));

    // Rotation due to elevator
    const MAX_ELEVATOR_ANGULAR_SPEED = 3;
    const elevatorInput = -controlFraction * MAX_ELEVATOR_ANGULAR_SPEED * currentElevator;
    const elevatorQuaterion = new THREE.Quaternion().setFromAxisAngle(rightWingVector, elevatorInput * dt);
    forwardVector.applyQuaternion(elevatorQuaterion);
    canopyVector.applyQuaternion(elevatorQuaterion);
    rightWingVector.applyQuaternion(elevatorQuaterion);

    // Rotation due to rudder
    const MAX_RUDDER_ANGULAR_SPEED = 0.2;
    const rudderInput = -controlFraction * MAX_RUDDER_ANGULAR_SPEED * currentRudder;
    console.log(controlFraction);
    const rudderQuaterion = new THREE.Quaternion().setFromAxisAngle(canopyVector, rudderInput * dt);
    forwardVector.applyQuaternion(rudderQuaterion);
    canopyVector.applyQuaternion(rudderQuaterion);
    rightWingVector.applyQuaternion(rudderQuaterion);

    // Rotation due to aileron
    const MAX_AILERON_ANGULAR_SPEED = 4;
    const aileronInput = controlFraction * MAX_AILERON_ANGULAR_SPEED * currentAileron;
    console.log(controlFraction);
    const aileronQuaterion = new THREE.Quaternion().setFromAxisAngle(forwardVector, aileronInput * dt);
    forwardVector.applyQuaternion(aileronQuaterion);
    canopyVector.applyQuaternion(aileronQuaterion);
    rightWingVector.applyQuaternion(aileronQuaterion);

    // Guarantee that forward, canopy, and rightWing vectors are orthonormal
    canopyVector.normalize();
    rightWingVector = new THREE.Vector3().crossVectors(forwardVector, canopyVector).normalize();
    forwardVector = new THREE.Vector3().crossVectors(canopyVector, rightWingVector);

    return [position, forwardVector, canopyVector, rightWingVector];

}

function angleBetween(v1, v2) {

    if (new THREE.Vector3().subVectors(v1.clone().normalize(), v2.clone().normalize()).length() < 0.01) return 0;

    const dotProduct = v1.dot(v2);

    const magV1 = v1.length();
    const magV2 = v2.length();

    const cosTheta = dotProduct / (magV1 * magV2);

    return Math.acos(cosTheta);

}

export { updateControls, evolvePhysics }
