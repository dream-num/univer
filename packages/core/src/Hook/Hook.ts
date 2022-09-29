import { Nullable } from '../Shared';

export type HookResponse<T, R> = (data: T) => R;

export class Hook<T = void, R = void> {
    private _response: Nullable<HookResponse<T, R>>;

    constructor(response: Nullable<HookResponse<T, R>>) {
        this._response = response;
    }

    invoke(data: T, defaultValue: R): R {
        if (this._response) {
            return this._response(data);
        }
        return defaultValue;
    }

    getResponse(): Nullable<HookResponse<T, R>> {
        return this._response;
    }

    setResponse(response: HookResponse<T, R>): void {
        this._response = response;
    }
}
