import { sortRules } from '@univer/core';
import { IBoundRect } from '../Base/Vector2';
import { BaseObject } from '../BaseObject';
import { ComponentExtension } from './Extension';

export class RenderComponent<T, U> extends BaseObject {
    private _extensions = new Map<string, ComponentExtension<T, U>>();

    register(...extensions: Array<ComponentExtension<T, U>>) {
        for (let extension of extensions) {
            extension.parent = this;
            this._extensions.set(extension.uKey, extension);
        }
    }

    unRegister(...uKeys: string[]) {
        for (let uKey of uKeys) {
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

    get extensions() {
        return this._extensions;
    }

    draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }
}
