/**
 * Event Bus
 *
 * Reference https://www.thisdot.co/blog/how-to-implement-an-event-bus-in-typescript
 */

interface ICallbackList {
    [id: string]: Function;
}

interface IEventObject {
    [eventName: string]: ICallbackList;
}

interface ISubscribe {
    unSubscribe: () => void;
}

export interface IEventBus {
    publish<T extends any[]>(eventName: string, ...args: T): void;
    subscribe(eventName: string, callback: Function): ISubscribe;
    subscribeOnce(eventName: string, callback: Function): ISubscribe;
    clear(eventName: string): void;
}

export class EventBus implements IEventBus {
    private _eventObject: IEventObject;
    private _callbackId: number;
    constructor() {
        // initialize event list
        this._eventObject = {};
        // id of the callback function list
        this._callbackId = 0;
    }
    // publish event
    publish<T extends any[]>(eventName: string, ...args: T): void {
        // Get all the callback functions of the current event
        const callbackObject = this._eventObject[eventName];

        if (!callbackObject) return console.warn(eventName + ' not found!');

        // execute each callback function
        for (let id in callbackObject) {
            // pass parameters when executing
            callbackObject[id](...args);

            // The callback function that is only subscribed once needs to be deleted
            if (id[0] === 'd') {
                delete callbackObject[id];
            }
        }
    }
    // Subscribe to events
    subscribe(eventName: string, callback: Function): ISubscribe {
        // initialize this event
        if (!this._eventObject[eventName]) {
            // Use object storage to improve the efficiency of deletion when logging out the callback function
            this._eventObject[eventName] = {};
        }

        const id = this._callbackId++;

        // store the callback function of the subscriber
        // callbackId needs to be incremented after use for the next callback function
        this._eventObject[eventName][id] = callback;

        // Every time you subscribe to an event, a unique unsubscribe function is generated
        const unSubscribe = () => {
            // clear the callback function of this subscriber
            delete this._eventObject[eventName][id];

            // If this event has no subscribers, also clear the entire event object
            if (Object.keys(this._eventObject[eventName]).length === 0) {
                delete this._eventObject[eventName];
            }
        };

        return { unSubscribe };
    }

    // only subscribe once
    subscribeOnce(eventName: string, callback: Function): ISubscribe {
        // initialize this event
        if (!this._eventObject[eventName]) {
            // Use object storage to improve the efficiency of deletion when logging out the callback function
            this._eventObject[eventName] = {};
        }

        // Callback function marked as subscribe only once
        const id = 'd' + this._callbackId++;

        // store the callback function of the subscriber
        // callbackId needs to be incremented after use for the next callback function
        this._eventObject[eventName][id] = callback;

        // Every time you subscribe to an event, a unique unsubscribe function is generated
        const unSubscribe = () => {
            // clear the callback function of this subscriber
            delete this._eventObject[eventName][id];

            // If this event has no subscribers, also clear the entire event object
            if (Object.keys(this._eventObject[eventName]).length === 0) {
                delete this._eventObject[eventName];
            }
        };

        return { unSubscribe };
    }

    // clear event
    clear(eventName: string): void {
        // If no event name is provided, all events are cleared by default
        if (!eventName) {
            this._eventObject = {};
            return;
        }

        // clear the specified event
        delete this._eventObject[eventName];
    }
}
