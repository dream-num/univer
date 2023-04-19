export class Random {
    protected _max: number;

    protected _min: number;

    constructor(max: number, min: number) {
        this._max = max;
        this._min = min;
    }

    next(): number {
        return Math.trunc(Math.random() * (this._max - this._min) + this._min);
    }
}
