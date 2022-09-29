function deleteEmpty(object: object) {
    if (object) {
        Object.keys(object).forEach((key) => {
            const value = object[key];
            if (unDef(value) || value === '') {
                delete object[key];
            }
        });
    }
    return object;
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

function objectToUrlSearch(object: object) {
    if (unDef(object)) return '';
    let str = '';
    for (const key in object) {
        if (
            object.hasOwnProperty(key) &&
            object[key] !== undefined &&
            object[key] !== null
        ) {
            str += `${key}=${object[key]}&`;
        }
    }
    str = str.substring(0, str.length - 1);
    return str ? `?${encodeURI(str)}` : '';
}

function isDef(v: unknown) {
    return v !== undefined && v !== null;
}

function unDef(v: unknown) {
    return v === undefined || v === null;
}

function urlSearchToObject(search: string) {
    if (unDef(search)) return {};
    search = decodeURI(search);
    const index = search.indexOf('?');
    const url = search.substring(0, index);
    search = search.substring(index);
    search = search.replace(/\?/, '');
    const array = search.split('&');
    const object = {
        $$url: url,
    };
    array.forEach((value) => {
        const keyValue = value.split('=');
        object[keyValue[0]] = keyValue[1];
    });
    return object;
}

function isString(value?: any): value is string {
    return Object.prototype.toString.apply(value) === '[object String]';
}

function ispPlain(value: any): value is {} {
    return value
        ? Object.getPrototypeOf(value) === Object.getPrototypeOf({})
        : false;
}

function isArray(value: any): value is [] {
    return Object.prototype.toString.apply(value) === '[object Array]';
}

function isFormData(value?: any): value is FormData {
    return value instanceof FormData;
}

const noop = () => {};

const defaultFilter = (data: object) => data;

/**
 * Types of Io Http Request
 */
export enum IOHttpRequestType {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

/**
 * Status of Io Http Ready
 */
export enum IOHttpReadyState {
    UNSENT = 0,
    OPENED = 1,
    HEADERS_RECEIVED = 2,
    LOADING = 3,
    DONE = 4,
}

/**
 * Types of Io Http Response
 */
export enum IOHttpResponseType {
    ARRAY_BUFFER = 'arraybuffer',
    BLOB = 'blob',
    TEXT = 'text',
    DOCUMENT = 'document',
    JSON = 'json',
    STREAM = 'stream',
}

/**
 * IOHTTP header type
 */
export type IOHttpHeaderType = {
    [key: string]: string;
};

/**
 * IOHTTP request body type
 */
export type IOHttpRequestBodyType = string | {} | [] | FormData;

/**
 * Config of http communication
 */
export interface IOHttpConfig {
    type: keyof typeof IOHttpRequestType;
    url: string;
    dataType?: IOHttpResponseType;
    async?: boolean;
    header?: IOHttpHeaderType;
    contentType?: string;
    data?: IOHttpRequestBodyType;
    timeout?: number;
    username?: string;
    password?: string;
    beforeSend?: Function;
    dataFilter?: Function;
    error?: Function;
    success?: Function;
    complete?: Function;
}

const defaultConfig: IOHttpConfig = {
    type: IOHttpRequestType.POST,
    url: '',
    async: true,
    header: {},
    dataType: IOHttpResponseType.JSON,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    data: {},
    username: '',
    password: '',
    timeout: 500,
    error: noop,
    beforeSend: defaultFilter,
    dataFilter: defaultFilter,
    success: noop,
    complete: noop,
};

/**
 * HTTP request
 *
 * @param config The available config options for making requests
 * @returns
 */
export function IOHttp<T = void>(config: IOHttpConfig): Promise<T> {
    return new Promise((resolve, reject) => {
        const setting = extend({}, defaultConfig, config) as Required<IOHttpConfig>;
        const request = new XMLHttpRequest();
        setting.beforeSend(setting);

        request.responseType = setting.dataType as XMLHttpRequestResponseType;
        request.timeout = setting.timeout;
        request.addEventListener('readystatechange', (event) => {
            if (request.readyState === IOHttpReadyState.DONE) {
                if (request.status === 200) {
                    const filter = setting.dataFilter(request.response);
                    setting.success(filter);
                    setting.complete();
                    resolve(filter);
                } else {
                    setting.error(event);
                    reject(event);
                }
            }
        });
        request.addEventListener('timeout', (event) => {
            setting.error(event);
        });
        request.open(
            setting.type,
            setting.url,
            setting.async,
            setting.username,
            setting.password
        );

        Object.keys(setting.header).forEach((key) => {
            const value = setting.header[key];
            request.setRequestHeader(key, value);
        });

        if (isFormData(setting.data)) {
            request.setRequestHeader('Content-Type', 'multipart/form-data');
        } else if (setting.contentType) {
            request.setRequestHeader('Content-Type', setting.contentType);
        }

        switch (setting.type) {
            case IOHttpRequestType.DELETE:
            case IOHttpRequestType.GET: {
                request.send();
                break;
            }
            case IOHttpRequestType.POST:
            case IOHttpRequestType.PUT: {
                if (ispPlain(setting.data)) {
                    request.send(JSON.stringify(setting.data));
                    return;
                }
                if (isString(setting.data)) {
                    request.send(setting.data);
                    return;
                }
                if (isArray(setting.data)) {
                    request.send(JSON.stringify(setting.data));
                    return;
                }
                if (isFormData(setting.data)) {
                    request.send(setting.data);
                }
                break;
            }
        }
    });
}

/**
 * Send a POST request
 *
 * @param url The server URL that will be used for the request
 * @param data The data to be sent as the request body
 * @param success Successful callback
 */
export function Post<T = void>(
    url: string,
    data: object = {},
    success: Function = noop
): Promise<T> {
    return IOHttp({ url, type: IOHttpRequestType.POST, data, success });
}

/**
 * Send a Get request
 *
 * @param url The server URL that will be used for the request
 * @param data  The data to be sent as the request body
 * @param success Successful callback
 */
export function Get<T = void>(
    url: string,
    data: object = {},
    success: Function = noop
): Promise<T> {
    url += objectToUrlSearch(data);
    return IOHttp({ url, type: IOHttpRequestType.GET, success });
}
