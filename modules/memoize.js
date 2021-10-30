export default function memoize(target, key, getter) {
    const value = getter();

    Object.defineProperty(target, key, {
        value: value,
        configurable: true
    });

    return value;
};