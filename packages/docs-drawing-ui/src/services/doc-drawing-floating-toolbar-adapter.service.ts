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
import type { IDocDrawing } from '@univerjs/docs-drawing';
import { toDisposable } from '@univerjs/core';

export interface IDocDrawingFloatingToolbarParams {
    unitId: string;
    subUnitId: string;
    drawing: IDocDrawing;
}

export interface IDocDrawingFloatingToolbarOption {
    label: unknown;
    value: string;
}

interface IDocDrawingFloatingToolbarBaseItem {
    label: string;
    index: number;
    commandId: string;
    commandParams?: object;
    disable: boolean;
    hideOnClick?: boolean;
    icon?: string;
}

export interface IDocDrawingFloatingToolbarButtonItem extends IDocDrawingFloatingToolbarBaseItem {
    type?: 'button';
}

export interface IDocDrawingFloatingToolbarSelectItem extends IDocDrawingFloatingToolbarBaseItem {
    type: 'select';
    value: string;
    options: IDocDrawingFloatingToolbarOption[];
    commandParamsFactory: (value: string) => object;
}

export type IDocDrawingFloatingToolbarItem =
    | IDocDrawingFloatingToolbarButtonItem
    | IDocDrawingFloatingToolbarSelectItem;

export interface IDocDrawingFloatingToolbarAdapter {
    getItems: (
        params: IDocDrawingFloatingToolbarParams
    ) => readonly IDocDrawingFloatingToolbarItem[] | null | undefined;
}

export class DocDrawingFloatingToolbarAdapterService {
    private readonly _adapters: IDocDrawingFloatingToolbarAdapter[] = [];

    registerAdapter(adapter: IDocDrawingFloatingToolbarAdapter): IDisposable {
        this._adapters.push(adapter);

        return toDisposable(() => {
            const index = this._adapters.indexOf(adapter);
            if (index >= 0) {
                this._adapters.splice(index, 1);
            }
        });
    }

    getItems(params: IDocDrawingFloatingToolbarParams): IDocDrawingFloatingToolbarItem[] | null {
        for (const adapter of this._adapters) {
            const items = adapter.getItems(params);
            if (items) {
                return [...items].sort((a, b) => a.index - b.index);
            }
        }

        return null;
    }
}
