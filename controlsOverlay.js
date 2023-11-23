
const outerJoystickOutsideRadius = 120;
const outerJoystickRingRadialThickness = 10;
const innerJoystickRadius = 35;

isJoystickHeldMap = {};
anchorMap = {};
joystickToTouchMap = {};
joystickToVectorMap = {};
doesUpperJoystickHaveFirstTouch = false;

initializeControls(document.body);

function initializeControls(parent) {

    // Create the top joystick
    const upperJoystick = createJoystick("upperJoystick", 20, 20, parent);
    const lowerJoystick = createJoystick("lowerJoystick", 80, 20, parent);
    // TODO create another joystick

}

function registerJoystickCallback(id, callback) {
    if (joystickIdToCallbackMap[id]) console.warn(`Warning: joystick with id ${id} already has a callback. Overwriting...`);
    joystickIdToCallMap[id] = callback;
}

function createJoystick(id, x, y, parent) {
    const outerRingSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    outerRingSvg.style.display = "block";
    outerRingSvg.style.position = "absolute";
    outerRingSvg.style.top = `${x}%`;
    outerRingSvg.style.left = `${y}%`;
    outerRingSvg.style.width = `${2 * outerJoystickOutsideRadius * 1.1}px`;
    outerRingSvg.style.height = `${2 * outerJoystickOutsideRadius * 1.1}px`;
    outerRingSvg.style.transform = `translate(-50%, -50%)`;
    outerRingSvg.setAttribute("viewBox", "0 0 100 100");
    outerRingSvg.innerHTML = `<circle cx="50" cy="50" 
        r="${50 * (1 - outerJoystickRingRadialThickness / outerJoystickOutsideRadius) / 1.1}" 
        stroke-width="${outerJoystickRingRadialThickness}" stroke="#777" fill="none" opacity="0.8"/>`;
    parent.appendChild(outerRingSvg);

    const innerJoystick = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    innerJoystick.style.display = "block";
    innerJoystick.style.position = "absolute";
    innerJoystick.style.top = `${x}%`;
    innerJoystick.style.left = `${y}%`;
    innerJoystick.style.width = `${y}%`;
    innerJoystick.style.width = `${2 * outerJoystickOutsideRadius}px`;
    innerJoystick.style.height = `${2 * outerJoystickOutsideRadius}px`;
    innerJoystick.style.transform = `translate(-50%, -50%)`;
    innerJoystick.setAttribute("viewBox", "0 0 100 100");
    innerJoystick.innerHTML = `<circle cx="50" cy="50" r="${innerJoystickRadius}" stroke="none" fill="#777" opacity="0.8"/>`;
    parent.appendChild(innerJoystick);

    function setAnchor() {
        if (anchorMap[id] && !isNaN(anchorMap[id][0])) return;
        const rect = outerRingSvg.getBoundingClientRect();
        anchorMap[id] = [
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        ];
    }

    function standardMousedown() {
        joystickToTouchMap[id] = [...Object.keys(isJoystickHeldMap)].filter(key => isJoystickHeldMap[key]).length;
        isJoystickHeldMap[id] = true;
        setAnchor();
    }
    innerJoystick.addEventListener("mousedown", (event) => {
        standardMousedown();
        updateJoystickPosition(event);
    });
    innerJoystick.addEventListener("touchstart", (event) => {
        event.preventDefault();
        standardMousedown();
        updateJoystickPosition(event.touches[joystickToTouchMap[id]]);
    });

    function standardMouseup() {
        isJoystickHeldMap[id] = false;
        delete joystickToTouchMap[id];
        joystickToVectorMap[id] = [0, 0];
        innerJoystick.style.transform = `translate(${-outerJoystickOutsideRadius}px, ${-outerJoystickOutsideRadius}px)`;
    }

    document.body.addEventListener("mouseup", standardMouseup);
    document.body.addEventListener("touchend", standardMouseup);
    document.body.addEventListener("mousemove", updateJoystickPosition);
    document.body.addEventListener("touchmove", (event) => {
        updateJoystickPosition(event.touches[joystickToTouchMap[id]]);
    });
    
    const outerJoystickOutsideRadiusSquared = outerJoystickOutsideRadius * outerJoystickOutsideRadius;
    function updateJoystickPosition(touchEvent) {
        if (!isJoystickHeldMap[id]) return;
        const anchor = anchorMap[id];
        let vector = [touchEvent.pageX - anchor[0], touchEvent.pageY - anchor[1]];
        let vectorSquareLength = vector[0] * vector[0] + vector[1] * vector[1];
        let vectorLength = Math.sqrt(vectorSquareLength);
        if (vectorSquareLength > outerJoystickOutsideRadiusSquared) {
            vector[0] *= outerJoystickOutsideRadius / vectorLength;
            vector[1] *= outerJoystickOutsideRadius / vectorLength;
        }
        innerJoystick.style.transform = `translate(${-outerJoystickOutsideRadius + vector[0]}px, ${-outerJoystickOutsideRadius + vector[1]}px)`;
        joystickToVectorMap[id] = [vector[0] / outerJoystickOutsideRadius, vector[1] / outerJoystickOutsideRadius];
    }

}