import type { HTTPHeaders } from './headers';

/**
 * There are multiple events could be resolved from the HTTP server.
 */
export type HTTPEvent<T> = HTTPResponse<T> | HTTPResponseError;

/** Wraps (success) response info. */
export class HTTPResponse<T> {
    readonly body: T;
    readonly headers: HTTPHeaders;
    readonly status: number;
    readonly statusText: string;

    constructor({
        body,
        headers,
        status,
        statusText,
    }: {
        body: T;
        headers: HTTPHeaders;
        status: number;
        statusText: string;
    }) {
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
    }
}

export class HTTPResponseError {
    readonly headers: HTTPHeaders;
    readonly status: number;
    readonly statusText: string;
    readonly error: any;

    constructor({
        headers,
        status,
        statusText,
        error,
    }: {
        headers: HTTPHeaders;
        status: number;
        statusText: string;
        error: any;
    }) {
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
        this.error = error;
    }
}

export class ResponseHeader {
    constructor(
        readonly headers: HTTPHeaders,
        readonly status: number,
        readonly statusText: string
    ) {}
}
