export class HTTPParams {
    constructor(readonly params?: { [key: string]: string | number | boolean }) {}

    toString(): string {
        if (!this.params) {
            return '';
        }

        return Object.keys(this.params)
            .map((key) => `${key}=${this.params![key]}`)
            .join('&');
    }
}
