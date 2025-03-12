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

import type { IDocumentRenderConfig, IRange, IScale, Nullable } from '@univerjs/core';
import type { BaseObject } from '../base-object';

import type { IBoundRectNoAngle, Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import { Registry } from '@univerjs/core';
import { getScale } from '../basics/tools';

export interface IExtensionConfig {
    originTranslate?: Vector2; // docs
    spanStartPoint?: Vector2; // docs
    spanPointWithFont?: Vector2; // docs
    centerPoint?: Vector2;
    alignOffset?: Vector2;
    renderConfig?: IDocumentRenderConfig;
}

export interface IDrawInfo {
    viewRanges: IRange[];
    viewportKey: string;
    checkOutOfViewBound?: boolean;
    viewBound?: IBoundRectNoAngle;
}
export class ComponentExtension<T, U, V> {
    uKey: string = '';

    type!: U;

    protected Z_INDEX: number = 0;

    parent: Nullable<BaseObject>;

    translateX = 0;

    translateY = 0;

    extensionOffset: IExtensionConfig = {};

    get zIndex() {
        return this.Z_INDEX;
    }

    draw(_ctx: UniverRenderingContext, _parentScale: IScale, _skeleton: T, _diff?: V, _more?: IDrawInfo) {
        /* abstract */
    }

    clearCache() {
        /* abstract */
    }

    protected _getScale(parentScale: IScale) {
        return getScale(parentScale);
    }

    dispose() {
        this.extensionOffset = {};
        this.parent = null;
    }
}

export const SpreadsheetExtensionRegistry = Registry.create();
export const SheetRowHeaderExtensionRegistry = Registry.create();
export const SheetColumnHeaderExtensionRegistry = Registry.create();
export const DocumentsSpanAndLineExtensionRegistry = Registry.create();
