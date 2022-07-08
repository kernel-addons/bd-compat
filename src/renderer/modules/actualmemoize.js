export default function memoize(getter) {
    let value;

    return (...args) => {
        value ??= getter(...args);
        return value;
    }
};