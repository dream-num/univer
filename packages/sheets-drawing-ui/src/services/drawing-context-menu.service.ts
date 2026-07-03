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

import type { DrawingTypeEnum, IDisposable, IDrawingParam } from '@univerjs/core';
import { createIdentifier, Disposable, toDisposable } from '@univerjs/core';

export interface IDrawingContextMenuProviderContext {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    drawingType: DrawingTypeEnum;
    drawing: IDrawingParam;
}

export interface IDrawingContextMenuProvider {
    getContextMenuPosition(context: IDrawingContextMenuProviderContext): string | undefined;
}

export interface IDrawingContextMenuService {
    registerProvider(drawingType: DrawingTypeEnum, provider: IDrawingContextMenuProvider): IDisposable;
    getContextMenuPosition(context: IDrawingContextMenuProviderContext): string | undefined;
}

export const IDrawingContextMenuService = createIdentifier<IDrawingContextMenuService>('sheets-drawing-ui.drawing-context-menu.service');

export class DrawingContextMenuService extends Disposable implements IDrawingContextMenuService {
    private readonly _providers = new Map<DrawingTypeEnum, IDrawingContextMenuProvider>();

    registerProvider(drawingType: DrawingTypeEnum, provider: IDrawingContextMenuProvider): IDisposable {
        this._providers.set(drawingType, provider);

        return toDisposable(() => {
            if (this._providers.get(drawingType) === provider) {
                this._providers.delete(drawingType);
            }
        });
    }

    getContextMenuPosition(context: IDrawingContextMenuProviderContext): string | undefined {
        return this._providers.get(context.drawingType)?.getContextMenuPosition(context);
    }
}
