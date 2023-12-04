import { sortRules } from '@univerjs/core';

import { BaseObject } from '../base-object';
import type { IBoundRect } from '../basics/vector2';
import type { ComponentExtension } from './extension';

export class RenderComponent<T, U> extends BaseObject {
    private _extensions = new Map<string, ComponentExtension<T, U>>();

    get extensions() {
        return this._extensions;
    }

    register(...extensions: Array<ComponentExtension<T, U>>) {
        for (const extension of extensions) {
            extension.parent = this;
            this._extensions.set(extension.uKey, extension);
        }
    }

    unRegister(...uKeys: string[]) {
        for (const uKey of uKeys) {
            this._extensions.delete(uKey);
        }
    }

    getExtensionsByOrder() {
        const extensionArray = Array.from(this._extensions.values());
        extensionArray.sort(sortRules);

        return extensionArray;
    }

    getExtensionByKey(uKey: string) {
        return this._extensions.get(uKey);
    }

    draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }
}
