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

import type { CellValue, ICellCustomRender, IDataValidationRule, ISelectionCellWithCoord, IStyleData, Nullable } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, UniverRenderingContext2D } from '@univerjs/engine-render';

export interface ICellRenderInfo {
    value: Nullable<CellValue>;
    style: Nullable<IStyleData>;
    cellInfo: ISelectionCellWithCoord;
    rule: IDataValidationRule;
}

export interface ICommonLocation {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
}

export interface IDataValidationRender extends ICellCustomRender {
    drawWith(ctx: UniverRenderingContext2D, info: ICellRenderInfo): void;
    isHit(evt: IPointerEvent | IMouseEvent, info: ICellRenderInfo): boolean;
    onClick: (cellInfo: ICellRenderInfo) => void;
}
