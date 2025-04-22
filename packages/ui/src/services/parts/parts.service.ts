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
import type { Observable } from 'rxjs';
import type { ComponentType } from '../../common/component-manager';
import { createIdentifier, Disposable, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';

export type ComponentRenderer = () => ComponentType;
type ComponentPartKey = BuiltInUIPart | string;

export enum BuiltInUIPart {
    GLOBAL = 'global',
    HEADER = 'header',
    HEADER_MENU = 'header-menu',
    CONTENT = 'content',
    FOOTER = 'footer',
    LEFT_SIDEBAR = 'left-sidebar',
    FLOATING = 'floating',
    UNIT = 'unit',
    CUSTOM_HEADER = 'custom-header',
    CUSTOM_LEFT = 'custom-left',
    CUSTOM_RIGHT = 'custom-right',
    CUSTOM_FOOTER = 'custom-footer',
    TOOLBAR = 'toolbar',
}

export interface IUIPartsService {
    componentRegistered$: Observable<ComponentPartKey>;
    uiVisibleChange$: Observable<{ ui: ComponentPartKey; visible: boolean }>;

    registerComponent(part: ComponentPartKey, componentFactory: () => ComponentType): IDisposable;
    getComponents(part: ComponentPartKey): Set<ComponentRenderer>;

    setUIVisible(part: ComponentPartKey, visible: boolean): void;

    isUIVisible(part: ComponentPartKey): boolean;
}

export const IUIPartsService = createIdentifier<IUIPartsService>('ui.parts.service');

export class UIPartsService extends Disposable implements IUIPartsService {
    private _componentsByPart: Map<ComponentPartKey, Set<ComponentType>> = new Map();

    private readonly _componentRegistered$ = new Subject<ComponentPartKey>();
    readonly componentRegistered$ = this._componentRegistered$.asObservable();
    private readonly _uiVisible = new Map<ComponentPartKey, boolean>();
    private readonly _uiVisibleChange$ = new Subject<{ ui: ComponentPartKey; visible: boolean }>();
    readonly uiVisibleChange$ = this._uiVisibleChange$.asObservable();

    override dispose(): void {
        super.dispose();

        this._componentRegistered$.complete();
    }

    setUIVisible(part: ComponentPartKey, visible: boolean): void {
        this._uiVisible.set(part, visible);
        this._uiVisibleChange$.next({ ui: part, visible });
    }

    isUIVisible(part: ComponentPartKey): boolean {
        return this._uiVisible.get(part) ?? true;
    }

    registerComponent<T>(part: ComponentPartKey, componentFactory: () => React.ComponentType<T>): IDisposable {
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
