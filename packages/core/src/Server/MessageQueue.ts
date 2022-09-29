const STORAGE_NAME = 'MessageQueue';

/**
 * Message Queue
 */
export class MessageQueue<T> {
    private _messages: T[];

    constructor() {
        this.load();
    }

    first() {
        return this._messages[0];
    }

    last() {
        return this._messages[this._messages.length - 1];
    }

    size() {
        return this._messages.length;
    }

    pop() {
        const result = this._messages.shift();
        this.save();
    }

    push(data: T) {
        this._messages.push(data);
        this.save();
    }

    hasMessage() {
        return this._messages.length > 0;
    }

    isEmpty() {
        return !this.hasMessage();
    }

    save() {
        const json = JSON.stringify(this._messages);
        localStorage.setItem(STORAGE_NAME, json);
    }

    load() {
        const json = localStorage.getItem(STORAGE_NAME);
        if (json) {
            this._messages = JSON.parse(json);
        }
    }
}
