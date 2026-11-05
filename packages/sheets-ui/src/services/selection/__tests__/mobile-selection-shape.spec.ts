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

import type { ICellCustomRender, IWorkbookData, Workbook } from '@univerjs/core';
import type { Engine } from '@univerjs/engine-render';
import { EventSubject, InterceptorEffectEnum, RANGE_TYPE, ThemeService, Univer, UniverInstanceType } from '@univerjs/core';
import { Scene, SpreadsheetSkeleton, Vector2 } from '@univerjs/engine-render';
import { attachSelectionWithCoord, INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import { MobileSelectionControl } from '../mobile-selection-shape';

const disposals: Array<() => void> = [];

function createControl(alignment: 'left' | 'right', merged: boolean) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([SheetInterceptorService]);
    const interceptorService = injector.get(SheetInterceptorService);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'checkbox',
        sheetOrder: ['sheet'],
        sheets: {
            sheet: {
                id: 'sheet',
                name: 'Sheet',
                rowCount: 20,
                columnCount: 20,
                defaultRowHeight: 24,
                defaultColumnWidth: 88,
                mergeData: merged ? [{ startRow: 2, endRow: 2, startColumn: 1, endColumn: 2 }] : [],
            },
        },
    });
    let interactive = true;
    const widget: ICellCustomRender = {
        drawWith() {},
        onPointerDown() {},
        isHit(position, info) {
            const bounds = info.primaryWithCoord.isMergedMainCell ? info.primaryWithCoord.mergeInfo : info.primaryWithCoord;
            const left = alignment === 'left' ? bounds.startX + 6 : bounds.endX - 22;
            return interactive && position.x >= left && position.x <= left + 16 &&
                position.y >= bounds.startY + 4 && position.y <= bounds.startY + 20;
        },
    };
    interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
        effect: InterceptorEffectEnum.Style,
        handler: (cell, pos, next) => next(pos.row === 2 && pos.col === 1 ? { ...cell, customRender: [widget] } : cell),
    });
    const worksheet = workbook.getActiveSheet()!;
    const skeleton = injector.createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles());
    skeleton.calculate();
    const scene = new Scene('mobile-selection', {
        onTransformChange$: new EventSubject(),
        getParent: () => null,
    } as unknown as Engine, { width: 800, height: 600 });
    const control = new MobileSelectionControl(scene, 1, injector.get(ThemeService), {
        rowHeaderWidth: skeleton.rowHeaderWidth,
        columnHeaderHeight: skeleton.columnHeaderHeight,
        rangeType: RANGE_TYPE.NORMAL,
    });
    const selection = attachSelectionWithCoord({
        range: { startRow: 2, endRow: 2, startColumn: 1, endColumn: merged ? 2 : 1, rangeType: RANGE_TYPE.NORMAL },
        primary: worksheet.getCellInfoInMergeData(2, 1),
        style: null,
    }, skeleton);
    control.updateRangeBySelectionWithCoord(selection, skeleton);
    disposals.push(() => {
        control.dispose();
        scene.dispose();
        skeleton.dispose();
        univer.dispose();
    });
    return {
        control,
        selection,
        removeWidget: () => {
            interactive = false;
        },
    };
}

afterEach(() => disposals.splice(0).forEach((dispose) => dispose()));

describe('MobileSelectionControl widget hit testing', () => {
    it.each([
        { alignment: 'left' as const, merged: false },
        { alignment: 'right' as const, merged: false },
        { alignment: 'left' as const, merged: true },
        { alignment: 'right' as const, merged: true },
    ])('lets a $alignment-aligned widget receive taps while preserving the selection handle (merged=$merged)', ({ alignment, merged }) => {
        const { control, selection, removeWidget } = createControl(alignment, merged);
        const { startX, startY, endX, endY } = selection.rangeWithCoord;
        const left = alignment === 'left';
        const handle = left ? control.expandControlTopLeft! : control.expandControlBottomRight!;
        const widgetCenter = new Vector2(left ? startX + 14 : endX - 14, (startY + endY) / 2);
        const handleCenter = new Vector2(left ? startX : endX, left ? startY : endY);
        const padding = new Vector2(handleCenter.x + (left ? -15 : 15), handleCenter.y);

        expect(handle.isHit(widgetCenter)).toBe(false);
        expect(handle.isHit(handleCenter)).toBe(true);
        expect(handle.isHit(padding)).toBe(true);

        removeWidget();
        expect(handle.isHit(widgetCenter)).toBe(true);
    });
});
