const Buffer = {};

export function setBuffer(buffer) {
    Object.assign(Buffer, buffer);
    initialized = true;
};

export let initialized = false;

export default Buffer;