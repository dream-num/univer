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

import './adaptors';

import type { IPageElement } from '@univerjs/core';
import { Inject, Injector, sortRules } from '@univerjs/core';
import type { BaseObject, Scene } from '@univerjs/engine-render';

import type { ObjectAdaptor } from './adaptor';
import { CanvasObjectProviderRegistry } from './adaptor';

export class ObjectProvider {
    private _adaptors: ObjectAdaptor[] = [];

    constructor(@Inject(Injector) private readonly _injector: Injector) {
        this._adaptorLoader();
    }

    convertToRenderObjects(pageElements: { [elementId: string]: IPageElement }, mainScene: Scene) {
        const pageKeys = Object.keys(pageElements);
        const objects: BaseObject[] = [];
        pageKeys.forEach((key) => {
            const pageElement = pageElements[key];
            const o = this._executor(pageElement, mainScene);
            if (o != null) {
                objects.push(o);
            }
        });
        return objects;
    }

    convertToRenderObject(pageElement: IPageElement, mainScene: Scene) {
        return this._executor(pageElement, mainScene);
    }

    private _executor(pageElement: IPageElement, mainScene: Scene) {
        const { id: pageElementId, type } = pageElement;

        for (const adaptor of this._adaptors) {
            const o = adaptor.check(type)?.convert(pageElement, mainScene);
            if (o != null) {
                return o;
            }
        }
    }

    private _adaptorLoader() {
        CanvasObjectProviderRegistry.getData()
            .sort(sortRules)
            .forEach((adaptorFactory: ObjectAdaptor) => {
                this._adaptors.push(adaptorFactory.create(this._injector) as unknown as ObjectAdaptor);
            });
    }
}
