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

/* eslint-disable ts/no-explicit-any */

import type { Nullable } from '../../shared';
import type { Worksheet } from '../../sheets/worksheet';
import type { Workbook } from '../../sheets/workbook';
import type { ISelectionCellWithCoord } from './i-selection-data';
import type { IStyleData } from './i-style-data';
import type { ICellDataForSheetInterceptor } from './i-cell-data';

export interface ICellRenderContext {
    data: ICellDataForSheetInterceptor;
    style: Nullable<IStyleData>;
    primaryWithCoord: ISelectionCellWithCoord;
    unitId?: string;
    subUnitId: string;
    row: number;
    col: number;
    worksheet: Worksheet;
    workbook?: Workbook;
}

/**
 * @debt This shouldn't exist in core package.
 *
 * @deprecated This interface is subject to change in the future.
 */
export interface ICellCustomRender {
    drawWith(ctx: CanvasRenderingContext2D, info: ICellRenderContext, skeleton: any, spreadsheets: any): void;
    zIndex?: number;
    isHit?: (position: { x: number;y: number }, info: ICellRenderContext) => boolean;
    onPointerDown?: (info: ICellRenderContext, evt: any) => void;
    onPointerEnter?: (info: ICellRenderContext, evt: any) => void;
    onPointerLeave?: (info: ICellRenderContext, evt: any) => void;
}
