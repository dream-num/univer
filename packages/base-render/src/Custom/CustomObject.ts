import { BaseObject } from '../BaseObject';

export class CustomObject extends BaseObject {
    constructor(key?: string, private _render = (mainCtx: CanvasRenderingContext2D) => {}) {
        super(key);
    }

    render(mainCtx: CanvasRenderingContext2D) {
        this._render(mainCtx);
        this.makeDirty(false);
        return this;
    }

    toJson() {
        return {
            ...super.toJson(),
        };
    }
}
