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

import type { IDocumentRenderConfig, IScale, Nullable } from '@univerjs/core';
import { Registry } from '@univerjs/core';

import type { BaseObject } from '../base-object';
import { getScale } from '../basics/tools';
import type { Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';

export interface IExtensionConfig {
    originTranslate?: Vector2; // docs
    spanStartPoint?: Vector2; // docs
    spanPointWithFont?: Vector2; // docs
    centerPoint?: Vector2;
    alignOffset?: Vector2;
    renderConfig?: IDocumentRenderConfig;
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

    draw(ctx: UniverRenderingContext, parentScale: IScale, skeleton: T, {diffRanges, viewRanges, checkOutOfViewBound: checkOutOfViewBound}: {
        diffRanges?: V,
        /**
         * 一般来说只需绘制可见区域
         */
        viewRanges?: V,
        /**
         * 绘制时是否考虑视野外的情况  一般来说, 除了 viewMainLeftTop 其他都需要为 true
         * 对于 font 来说
         * viewMainTop 要考虑来自左右两边单元格的溢出
         * viewLeft 要考虑来自上方合并单元格
         * viewMain 要考虑左右溢出和上方合并的单元格.
         */
        checkOutOfViewBound?: boolean}) {
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
