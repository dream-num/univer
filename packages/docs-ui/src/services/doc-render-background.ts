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

import type { ICanvasColorService } from '@univerjs/engine-render';
import { DocumentFlavor } from '@univerjs/core';

const DOC_TRADITIONAL_WORKSPACE_BACKGROUND_COLOR = '#fafafa';
const DOC_MODERN_WORKSPACE_BACKGROUND_COLOR = '#fff';
const DOC_EDITOR_INTERNAL_BACKGROUND_COLOR = 'transparent';

export interface IResolveDocRenderBackgroundOptions {
    documentFlavor?: DocumentFlavor;
    canvasColorService?: ICanvasColorService;
    editorBackgroundColor?: string;
    isEditor?: boolean;
}

export interface IResolvedDocRenderBackground {
    canvasElementBackgroundColor: string;
    docBackgroundFillColor?: string;
}

export function resolveDocRenderBackground(options: IResolveDocRenderBackgroundOptions): IResolvedDocRenderBackground {
    const { documentFlavor, canvasColorService, editorBackgroundColor, isEditor } = options;
    const backgroundColor = editorBackgroundColor ?? getDefaultDocCanvasBackgroundColor(documentFlavor, isEditor);

    if (isEditor) {
        return {
            canvasElementBackgroundColor: backgroundColor,
            docBackgroundFillColor: DOC_EDITOR_INTERNAL_BACKGROUND_COLOR,
        };
    }

    return {
        canvasElementBackgroundColor: canvasColorService?.getRenderColor(backgroundColor) ?? backgroundColor,
        docBackgroundFillColor: undefined,
    };
}

export function getDefaultDocCanvasBackgroundColor(documentFlavor?: DocumentFlavor, isEditor?: boolean) {
    if (isEditor) {
        return DOC_EDITOR_INTERNAL_BACKGROUND_COLOR;
    }

    return documentFlavor === DocumentFlavor.MODERN
        ? DOC_MODERN_WORKSPACE_BACKGROUND_COLOR
        : DOC_TRADITIONAL_WORKSPACE_BACKGROUND_COLOR;
}
