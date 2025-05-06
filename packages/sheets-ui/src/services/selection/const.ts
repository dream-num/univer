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

import type { ThemeService } from '@univerjs/core';
import type { Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISelectionStyle } from '@univerjs/sheets';
import { ColorKit, createInterceptorKey } from '@univerjs/core';

export const RANGE_MOVE_PERMISSION_CHECK = createInterceptorKey<boolean, null>('rangeMovePermissionCheck');
export const RANGE_FILL_PERMISSION_CHECK = createInterceptorKey<boolean, { x: number; y: number; skeleton: SpreadsheetSkeleton; scene: Scene }>('rangeFillPermissionCheck');

export enum SELECTION_SHAPE_DEPTH {
    FORMULA_EDITOR_SHOW = 100, // see packages/sheets-formula/src/controllers/formula-editor-show.controller.ts
    MARK_SELECTION = 10000,
};

export function genNormalSelectionStyle(themeService: ThemeService): ISelectionStyle {
    const primaryColor = themeService.getColorFromTheme('primary.600');
    const whiteColor = themeService.getColorFromTheme('white');
    const fill = new ColorKit(primaryColor).setAlpha(0.07).toRgbString();
    return {
        strokeWidth: 1,
        stroke: primaryColor,
        fill,
        // widgets: { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true },
        widgets: {},
        widgetSize: 6,
        widgetStrokeWidth: 1,
        widgetStroke: whiteColor,

        autofillSize: 6,
        autofillStrokeWidth: 1,
        autofillStroke: whiteColor,

        rowHeaderFill: fill,
        rowHeaderStroke: primaryColor,
        rowHeaderStrokeWidth: 1,

        columnHeaderFill: fill,
        columnHeaderStroke: primaryColor,
        columnHeaderStrokeWidth: 1,

        expandCornerSize: 40,
    };
}
