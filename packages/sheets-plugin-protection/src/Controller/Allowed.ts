import { Range } from '@univerjs/core';

export class Allowed {
    protected _password: string;

    protected _range: Range;

    constructor(password: string, range: Range) {
        this._password = password;
        this._range = range;
    }

    getRange(): Range {
        return this._range;
    }

    getPassword(): string {
        return this._password;
    }
}
