/**
 * Copyright 2023 DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
