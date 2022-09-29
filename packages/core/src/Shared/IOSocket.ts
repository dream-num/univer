function isDef(v: any) {
    return v !== undefined && v !== null;
}

function unDef(v: any) {
    return v === undefined || v === null;
}

function isBlank(v: string) {
    return unDef(v) || v.toString() === '';
}

function extend(src: object, ...target: object[]) {
    for (const item of target) {
        if (item) {
            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    if (isDef(item[key])) {
                        src[key] = item[key];
                    }
                }
            }
        }
    }
    return src;
}

/**
 * Properties of socket config
 */
export interface IOSocketConfig {
    url: string;
    heartbeatTime?: number;
}

/**
 * Types if Io Socket Listen
 */
export enum IOSocketListenType {
    MESSAGE = 'message',
    OPEN = 'open',
    CLOSE = 'close',
    ERROR = 'error',
    RETRY = 'retry',
    DESTROY = 'destroy',
}

const defaultConfig = {
    url: '',
    heartbeatTime: 1000 * 6,
};

/**
 * IOSocket send body
 */
export type IOSocketSendBody = string | ArrayBufferLike | Blob | ArrayBufferView;

/**
 * IOSocket type
 */
export class IOSocket {
    private _config: IOSocketConfig;

    private _listens: Map<IOSocketListenType, Function>;

    private _timer: number;

    private _socket: WebSocket;

    constructor(config: IOSocketConfig) {
        const setting = extend(
            {},
            defaultConfig,
            config
        ) as Required<IOSocketConfig>;
        if (isBlank(setting.url)) {
            throw new Error('url must be input');
        }
        this._listens = new Map();
        this._timer = -1;
        this._config = config;
    }

    private _create(): void {
        const { _config } = this;
        this._socket = new WebSocket(_config.url);
    }

    private _bind(): void {
        this._socket.addEventListener(IOSocketListenType.MESSAGE, this._message);
        this._socket.addEventListener(IOSocketListenType.OPEN, this._open);
        this._socket.addEventListener(IOSocketListenType.CLOSE, this._close);
        this._socket.addEventListener(IOSocketListenType.ERROR, this._error);
    }

    private _message(event: Event): void {
        const listen = this._listens.get(IOSocketListenType.MESSAGE);
        if (listen) {
            listen(event);
        }
    }

    private _open(event: Event): void {
        const listen = this._listens.get(IOSocketListenType.OPEN);
        if (listen) {
            listen(event);
            this._heartbeat();
        }
    }

    private _error(event: Event): void {
        const listen = this._listens.get(IOSocketListenType.ERROR);
        if (listen) {
            listen(event);
            this._retry();
        }
    }

    private _close(event: Event): void {
        const listen = this._listens.get(IOSocketListenType.CLOSE);
        if (listen) {
            listen(event);
            this.destroy();
        }
    }

    private _clear(): void {
        if (this._timer > -1) {
            clearInterval(this._timer);
        }
        this._timer = -1;
        this._socket.removeEventListener(IOSocketListenType.MESSAGE, this._message);
        this._socket.removeEventListener(IOSocketListenType.OPEN, this._open);
        this._socket.removeEventListener(IOSocketListenType.CLOSE, this._close);
        this._socket.removeEventListener(IOSocketListenType.ERROR, this._error);
        this._socket.close();
    }

    private _heartbeat(): void {
        const { _socket, _config } = this;
        const { heartbeatTime } = _config;
        function handle() {
            _socket.send('heartbea_message');
        }
        this._timer = setInterval(handle, heartbeatTime) as unknown as number;
    }

    private _retry(): void {
        const listen = this._listens.get(IOSocketListenType.RETRY);
        if (listen) {
            listen();
        }
        this._clear();
        this._create();
        this._bind();
    }

    link(): void {
        this._create();
        this._bind();
    }

    send(body: IOSocketSendBody): void {
        this._socket.send(body);
    }

    destroy(): void {
        const listen = this._listens.get(IOSocketListenType.DESTROY);
        if (listen) {
            listen();
        }
        this._clear();
        this._listens.clear();
    }

    on(type: string, listen: Function): void {
        this._listens[type] = listen;
    }
}
