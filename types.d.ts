declare const BDCompatNative: {
    executeJS(js: string): any;
    getAppPath(): string;
    IPC: {
        on(event: string, callback: Function): () => void;
        off(event: string, callback: Function): void;
        once(event: string, callback: Function): void;
        dispatch(event: string, ...args: any[]): void;
    }
};