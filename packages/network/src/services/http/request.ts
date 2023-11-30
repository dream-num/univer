import type { HTTPHeaders } from './headers';
import { ApplicationJSONType } from './headers';
import type { HTTPResponseType } from './http';
import type { HTTPParams } from './params';

export type HTTPRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface IHTTPRequestParams {
    body?: any;
    headers: HTTPHeaders;
    params?: HTTPParams;
    responseType: HTTPResponseType;
    withCredentials: boolean;
}

export class HTTPRequest {
    get headers(): HTTPHeaders {
        return this.requestParams!.headers;
    }

    get withCredentials(): boolean {
        return this.requestParams!.withCredentials;
    }

    get responseType(): string {
        return this.requestParams!.responseType;
    }

    constructor(
        readonly method: HTTPRequestMethod,
        readonly url: string,
        readonly requestParams?: IHTTPRequestParams
    ) {
        // TODO@wzhudev: deal with `requestParams` is empty.
    }

    getUrlWithParams(): string {
        const params = this.requestParams?.params?.toString();
        if (!params) {
            return this.url;
        }

        return `${this.url}${this.url.includes('?') ? '&' : '?'}${params}`;
    }

    getBody(): string | null {
        const contentType = this.headers.get('Content-Type') ?? ApplicationJSONType;
        const body = this.requestParams?.body;
        if (contentType === ApplicationJSONType && body && typeof body === 'object') {
            return JSON.stringify(body);
        }

        return body ? `${body}` : null;
    }
}
