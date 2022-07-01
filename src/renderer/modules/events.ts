const Events = new class Events extends EventTarget {
    once(event: string, listener: Parameters<typeof this.addEventListener>[1]) {
        return this.addEventListener(event, listener, {once: true});
    }

    on(event: string, listener: Parameters<typeof this.addEventListener>[1]) {
        return this.addEventListener(event, listener);
    }

    off(event: string, listener: Parameters<typeof this.addEventListener>[1]) {
        return this.removeEventListener(event, listener);
    }

    dispatch(event: string, args: any) {
        this.dispatchEvent(new Event(event, args));
    }
};

(window as any).BDEvents = Events;

export default Events;
