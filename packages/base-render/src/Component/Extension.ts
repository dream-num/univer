import { IDocumentRenderConfig, Registry } from '@univer/core';
import { getScale } from '../Base/Tools';
import { IScale } from '../Base/Interfaces';
import { RenderComponent } from './Component';
import { Vector2 } from '../Base/Vector2';

export interface IExtensionConfig {
    originTranslate?: Vector2; // docs
    spanStartPoint?: Vector2; // docs
    spanPointWithFont?: Vector2; // docs
    centerPoint?: Vector2;
    alignOffset?: Vector2;
    renderConfig?: IDocumentRenderConfig;
}

export class ComponentExtension<T, U> {
    uKey: string;

    type: U;

    zIndex: number;

    parent: RenderComponent<T, U>;

    translateX = 0;

    translateY = 0;

    extensionOffset: IExtensionConfig;

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
export const SheetRowTitleExtensionRegistry = Registry.create();
export const SheetColumnTitleExtensionRegistry = Registry.create();
export const DocumentsSpanAndLineExtensionRegistry = Registry.create();
