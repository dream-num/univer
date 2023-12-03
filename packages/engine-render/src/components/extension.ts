import type { IDocumentRenderConfig, IScale, Nullable } from '@univerjs/core';
import { Registry } from '@univerjs/core';

import type { BaseObject } from '../base-object';
import { getScale } from '../basics/tools';
import type { Vector2 } from '../basics/vector2';

export interface IExtensionConfig {
    originTranslate?: Vector2; // docs
    spanStartPoint?: Vector2; // docs
    spanPointWithFont?: Vector2; // docs
    centerPoint?: Vector2;
    alignOffset?: Vector2;
    renderConfig?: IDocumentRenderConfig;
}

export class ComponentExtension<T, U> {
    uKey: string = '';

    type!: U;

    zIndex: number = 0;

    parent: Nullable<BaseObject>;

    translateX = 0;

    translateY = 0;

    extensionOffset: IExtensionConfig = {};

    draw(ctx: CanvasRenderingContext2D, parentScale: IScale, skeleton: T) {
        /* abstract */
    }

    clearCache() {
        /* abstract */
    }

    protected _getScale(parentScale: IScale) {
        return getScale(parentScale);
    }
}

export const SpreadsheetExtensionRegistry = Registry.create();
export const SheetRowHeaderExtensionRegistry = Registry.create();
export const SheetColumnHeaderExtensionRegistry = Registry.create();
export const DocumentsSpanAndLineExtensionRegistry = Registry.create();
