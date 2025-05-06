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

import type { ICellRenderContext, IDataValidationRule, IStyleData, Nullable } from '@univerjs/core';
import type { IBaseDataValidationWidget, IFormulaResult } from '@univerjs/data-validation';
import type { IMouseEvent, IPointerEvent, UniverRenderingContext, UniverRenderingContext2D } from '@univerjs/engine-render';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import type { CheckboxValidator } from '@univerjs/sheets-data-validation';
import {
    HorizontalAlign,
    ICommandService,
    Inject,
    isFormulaString,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceType,
    VerticalAlign,
} from '@univerjs/core';
import { CheckboxShape as Checkbox, CURSOR_TYPE, fixLineWidthByScale, getCurrentTypeOfRenderer, IRenderManagerService, Transform } from '@univerjs/engine-render';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import {
    CHECKBOX_FORMULA_1,
    CHECKBOX_FORMULA_2,
    DataValidationFormulaService,
    getCellValueOrigin,
    getFormulaResult,
    isLegalFormulaResult,
    SheetDataValidationModel,
    transformCheckboxValue,
} from '@univerjs/sheets-data-validation';

const MARGIN_H = 6;

export class CheckboxRender implements IBaseDataValidationWidget {
    private _calc(cellInfo: { startX: number; endX: number; startY: number; endY: number }, style: Nullable<IStyleData>) {
        const { vt, ht } = style || {};
        const width = cellInfo.endX - cellInfo.startX - (MARGIN_H * 2);
        const height = cellInfo.endY - cellInfo.startY;
        const size = (style?.fs ?? 10) * 1.6;
        let widgetLeft = 0;
        let widgetTop = 0;
        switch (vt) {
            case VerticalAlign.TOP:
                widgetTop = 0;
                break;
            case VerticalAlign.BOTTOM:
                widgetTop = 0 + (height - size);
                break;
            default:
                widgetTop = 0 + (height - size) / 2;
                break;
        }

        switch (ht) {
            case HorizontalAlign.LEFT:
                widgetLeft = MARGIN_H;
                break;
            case HorizontalAlign.RIGHT:
                widgetLeft = MARGIN_H + (width - size);
                break;

            default:
                widgetLeft = MARGIN_H + (width - size) / 2;
                break;
        }

        return {
            left: cellInfo.startX + widgetLeft,
            top: cellInfo.startY + widgetTop,
            width: (style?.fs ?? 10) * 1.6,
            height: (style?.fs ?? 10) * 1.6,
        };
    }

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DataValidationFormulaService) private readonly _formulaService: DataValidationFormulaService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(IRenderManagerService) private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetDataValidationModel) private readonly _dataValidationModel: SheetDataValidationModel
    ) {
    }

    calcCellAutoHeight(info: ICellRenderContext): number | undefined {
        const { style } = info;
        return (style?.fs ?? 10) * 1.6;
    }

    calcCellAutoWidth(info: ICellRenderContext): number | undefined {
        const { style } = info;
        return (style?.fs ?? 10) * 1.6;
    }

    private async _parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult> {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const formulaResult1 = getFormulaResult(results?.[0]?.result?.[0]?.[0]);
        const formulaResult2 = getFormulaResult(results?.[1]?.result?.[0]?.[0]);
        const isFormulaValid = isLegalFormulaResult(String(formulaResult1)) && isLegalFormulaResult(String(formulaResult2));

        return {
            formula1: isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result?.[0]?.[0]) : formula1,
            formula2: isFormulaString(formula2) ? formulaResult2 : formula2,
            isFormulaValid,
        };
    }

    drawWith(ctx: UniverRenderingContext2D, info: ICellRenderContext): void {
        const { style, primaryWithCoord, unitId, subUnitId, worksheet, row, col } = info;
        const cellBounding = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;
        const value = getCellValueOrigin(worksheet.getCellRaw(row, col));
        const rule = this._dataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
        if (!rule) {
            return;
        }
        const validator = this._dataValidationModel.getValidator(rule.type) as CheckboxValidator;
        if (!validator) {
            return;
        }

        if (!validator.skipDefaultFontRender?.(rule, value, { unitId: unitId!, subUnitId, row, column: col })) {
            return;
        }

        const result = validator.parseFormulaSync(rule, unitId, subUnitId);
        const { formula1 } = result;
        const layout = this._calc(cellBounding, style);
        const { a: scaleX, d: scaleY } = ctx.getTransform();
        const left = fixLineWidthByScale(layout.left, scaleX);
        const top = fixLineWidthByScale(layout.top, scaleY);

        const transform = Transform.create().composeMatrix({
            left,
            top,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            skewX: 0,
            skewY: 0,
            flipX: false,
            flipY: false,
        });

        const cellWidth = cellBounding.endX - cellBounding.startX;
        const cellHeight = cellBounding.endY - cellBounding.startY;

        ctx.save();
        ctx.beginPath();
        ctx.rect(cellBounding.startX, cellBounding.startY, cellWidth, cellHeight);
        ctx.clip();

        const m = transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        const size = (style?.fs ?? 10) * 1.6;

        const checked = String(value) === String(formula1);
        const defaultColor = this._themeService.getColorFromTheme('primary.600');

        Checkbox.drawWith(ctx as UniverRenderingContext, {
            checked,
            width: size,
            height: size,
            fill: style?.cl?.rgb ?? defaultColor,
        });

        ctx.restore();
    }

    isHit(evt: { x: number; y: number }, info: ICellRenderContext): boolean {
        const cellBounding = info.primaryWithCoord.isMergedMainCell ? info.primaryWithCoord.mergeInfo : info.primaryWithCoord;
        const layout = this._calc(cellBounding, info.style);
        const startY = layout.top;
        const endY = layout.top + layout.height;
        const startX = layout.left;
        const endX = layout.left + layout.width;
        const { x: offsetX, y: offsetY } = evt;
        if (offsetX <= endX && offsetX >= startX && offsetY <= endY && offsetY >= startY) {
            return true;
        }

        return false;
    }

    async onPointerDown(info: ICellRenderContext, evt: IPointerEvent | IMouseEvent) {
        if (evt.button === 2) {
            return;
        }
        const { primaryWithCoord, unitId, subUnitId, worksheet, row, col } = info;
        const value = getCellValueOrigin(worksheet.getCellRaw(row, col));
        const rule = this._dataValidationModel.getRuleByLocation(unitId, subUnitId, row, col);
        if (!rule) {
            return;
        }
        const validator = this._dataValidationModel.getValidator(rule.type) as CheckboxValidator;
        if (!validator) {
            return;
        }

        if (!validator.skipDefaultFontRender?.(rule, value, { unitId, subUnitId, row, column: col })) {
            return;
        }

        const { formula1, formula2 } = await this._parseFormula(rule, unitId!, subUnitId);
        const params: ISetRangeValuesCommandParams = {
            range: {
                startColumn: primaryWithCoord.actualColumn,
                endColumn: primaryWithCoord.actualColumn,
                startRow: primaryWithCoord.actualRow,
                endRow: primaryWithCoord.actualRow,
            },
            value: {
                v: String(value) === transformCheckboxValue(String(formula1)) ? formula2 : formula1,
                p: null,
            },
        };

        this._commandService.executeCommand(
            SetRangeValuesCommand.id,
            params
        );
    };

    onPointerEnter(info: ICellRenderContext, evt: IPointerEvent | IMouseEvent) {
        getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._univerInstanceService, this._renderManagerService)
            ?.mainComponent
            ?.setCursor(CURSOR_TYPE.POINTER);
    }

    onPointerLeave(info: ICellRenderContext, evt: IPointerEvent | IMouseEvent) {
        getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET, this._univerInstanceService, this._renderManagerService)
            ?.mainComponent
            ?.setCursor(CURSOR_TYPE.DEFAULT);
    }
}
