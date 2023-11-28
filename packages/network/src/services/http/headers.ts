interface IHeadersConstructorProps {
    [key: string]: string | number | boolean;
}

/**
 * It wraps headers of HTTP requests' and responses' headers.
 */
export class HTTPHeaders {
    private readonly _headers: { [key: string]: string[] } = {};

    constructor(headers?: IHeadersConstructorProps | string) {
        if (typeof headers === 'string') {
            // split header text and serialize them to HTTPHeaders
            headers.split('\n').forEach((header) => {
                const [name, value] = header.split(':');
                if (name && value) {
                    this._setHeader(name, value);
                }
            });
        } else {
            if (headers) {
                Object.keys(headers).forEach(([name, value]) => {
                    this._setHeader(name, value);
                });
            }
        }
    }

    forEach(callback: (name: string, value: string[]) => void): void {
        Object.keys(this._headers).forEach((name) => {
            callback(name, this._headers[name]);
        });
    }

    has(key: string): boolean {
        return !!this._headers[key];
    }

    private _setHeader(name: string, value: string | number | boolean): void {
        const lowerCase = name.toLowerCase();
        if (this._headers[lowerCase]) {
            this._headers[lowerCase].push(value.toString());
        } else {
            this._headers[lowerCase] = [value.toString()];
        }
    }
}
