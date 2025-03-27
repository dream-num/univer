/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDisposable } from '@univerjs/core';
import type { IViewportInfo } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import type { ComponentExtension } from './extension';
import { DisposableCollection, sortRules, toDisposable } from '@univerjs/core';
import { BaseObject } from '../base-object';

export class RenderComponent<T, U, V> extends BaseObject {
    private _extensions = new Map<string, ComponentExtension<T, U, V>>();

    get extensions() {
        return this._extensions;
    }

    register(...extensions: Array<ComponentExtension<T, U, V>>): IDisposable {
        const disposableCollection = new DisposableCollection();
        for (const extension of extensions) {
            extension.parent = this;
            this._extensions.set(extension.uKey, extension);

            disposableCollection.add(
                toDisposable(() => {
                    this._extensions.delete(extension.uKey);
                    extension.parent = null;
                })
            );
        }

        this.disposeWithMe(disposableCollection);

        return disposableCollection;
    }

    getExtensionsByOrder() {
        const extensionArray = Array.from(this._extensions.values());
        extensionArray.sort(sortRules);

        return extensionArray;
    }

    getExtensionByKey(uKey: string) {
        return this._extensions.get(uKey);
    }

    draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        /* abstract */
    }

    override dispose(): void {
        super.dispose();

        for (const extension of this._extensions.values()) {
            extension.dispose();
        }

        this._extensions.clear();
    }
}
