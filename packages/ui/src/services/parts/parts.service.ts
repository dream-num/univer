/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import { type Observable, Subject } from 'rxjs';
import { Disposable, toDisposable } from '@univerjs/core';

import type { ComponentType } from '../../common/component-manager';

type ComponentRenderer = () => ComponentType;
type ComponentPartKey = BuiltInUIPart | string;

export enum BuiltInUIPart {
    GLOBAL = 'global',
    HEADER = 'header',
    HEADER_MENU = 'header-menu',
    CONTENT = 'content',
    FOOTER = 'footer',
    LEFT_SIDEBAR = 'left-sidebar',
}

export interface IUIPartsService {
    componentRegistered$: Observable<ComponentPartKey>;

    registerComponent(part: ComponentPartKey, componentFactory: () => ComponentType): IDisposable;
    getComponents(part: ComponentPartKey): Set<ComponentRenderer>;
}

export const IUIPartsService = createIdentifier<IUIPartsService>('ui.parts.service');

export class UIPartsService extends Disposable implements IUIPartsService {
    private _componentsByPart: Map<ComponentPartKey, Set<ComponentType>> = new Map();

    private readonly _componentRegistered$ = new Subject<ComponentPartKey>();
    readonly componentRegistered$ = this._componentRegistered$.asObservable();

    override dispose(): void {
        super.dispose();

        this._componentRegistered$.complete();
    }

    registerComponent(part: ComponentPartKey, componentFactory: () => React.ComponentType): IDisposable {
        const componentType = componentFactory();
        const components = (
            this._componentsByPart.get(part)
            || this._componentsByPart.set(part, new Set()).get(part)!
        ).add(componentType);

        this._componentRegistered$.next(part);

        return toDisposable(() => {
            components.delete(componentType);
            if (components.size === 0) {
                this._componentsByPart.delete(part);
            }
            this._componentRegistered$.next(part);
        });
    }

    getComponents(part: ComponentPartKey): Set<ComponentType> {
        return new Set([...(this._componentsByPart.get(part) || new Set())]);
    }
}
