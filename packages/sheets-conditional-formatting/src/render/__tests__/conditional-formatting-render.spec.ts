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

import type { ICellData, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import { BooleanNumber, LocaleService, LocaleType, ObjectMatrix, Univer, UniverInstanceType } from '@univerjs/core';
import { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IIconSetType } from '../../models/icon-map';
import { DataBar } from '../data-bar.render';
import { ConditionalFormattingIcon } from '../icon.render';

function createCtx() {
    const gradient = { addColorStop: vi.fn() };
    const native = {
        canvas: document.createElement('canvas'),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arcTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        drawImage: vi.fn(),
        createLinearGradient: vi.fn(() => gradient),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        getTransform: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const injector = univer.__getInjector();
    injector.add([UniverRenderingContext, {
        useFactory: () => injector.createInstance(UniverRenderingContext, native),
    }]);
    const context = injector.get(UniverRenderingContext);
    for (const method of ['save', 'restore', 'beginPath', 'fill', 'stroke', 'drawImage', 'createLinearGradient'] as const) {
        vi.spyOn(context, method);
    }
    return Object.assign(context, { gradient });
}

let univer: Univer;

function createSkeleton(
    cells: Record<string, unknown>,
    hiddenRows = new Set<number>(),
    hiddenCols = new Set<number>(),
    mergeData: IRange[] = [],
    size = { width: 80, height: 24 }
) {
    const cellData = new ObjectMatrix<ICellData>();
    for (const [position, cell] of Object.entries(cells)) {
        const [row, column] = position.split(',').map(Number);
        cellData.setValue(row, column, cell as ICellData);
    }
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit-1',
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet',
                rowCount: Math.max(3, ...mergeData.map((range) => range.endRow + 1)),
                columnCount: Math.max(3, ...mergeData.map((range) => range.endColumn + 1)),
                defaultColumnWidth: size.width,
                defaultRowHeight: size.height,
                rowData: Object.fromEntries([...hiddenRows].map((row) => [row, { hd: BooleanNumber.TRUE }])),
                columnData: Object.fromEntries([...hiddenCols].map((column) => [column, { hd: BooleanNumber.TRUE }])),
                cellData: cellData.getMatrix(),
                mergeData,
            },
        },
    });
    const injector = univer.__getInjector();
    injector.add([SpreadsheetSkeleton, {
        useFactory: () => injector.createInstance(SpreadsheetSkeleton, workbook.getActiveSheet()!, workbook.getStyles()),
    }]);
    const skeleton = injector.get(SpreadsheetSkeleton);
    vi.spyOn(skeleton.worksheet, 'getCell');
    return skeleton;
}

describe('conditional formatting render extensions', () => {
    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DataBar]);
        injector.add([ConditionalFormattingIcon]);
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: {} });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it('draws data bars for positive and negative cell values in visible cells', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton({
            '0,0': {
                dataBar: {
                    color: '#2f56ef',
                    value: 75,
                    startPoint: 25,
                    isGradient: false,
                    isShowValue: true,
                },
            },
            '0,1': {
                dataBar: {
                    color: '#f45531',
                    value: -50,
                    startPoint: 60,
                    isGradient: true,
                    isShowValue: true,
                },
            },
            '1,0': {
                dataBar: {
                    color: '#111111',
                    value: 100,
                    startPoint: 0,
                    isGradient: false,
                    isShowValue: true,
                },
            },
        }, new Set([1]));

        univer.__getInjector().get(DataBar).draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        ]);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalledTimes(2);
        expect(ctx.createLinearGradient).toHaveBeenCalledTimes(1);
        expect(ctx.gradient.addColorStop).toHaveBeenCalledWith(0, 'rgb(255 255 255)');
        expect(ctx.gradient.addColorStop).toHaveBeenCalledWith(1, '#f45531');
        expect(ctx.stroke).toHaveBeenCalledTimes(1);
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('skips data bar drawing when worksheet is missing or bar dimensions collapse', () => {
        const ctx = createCtx();
        const dataBar = univer.__getInjector().get(DataBar);
        expect(dataBar.draw(ctx, { scaleX: 1, scaleY: 1 }, { worksheet: undefined } as any, [])).toBe(false);

        (dataBar as any)._drawRectWithRoundedCorner(ctx, 0, 0, 0, 10, true, true, true, true);
        (dataBar as any)._drawRectWithRoundedCorner(ctx, 0, 0, 10, 0, true, true, true, true);
        expect(ctx.beginPath).not.toHaveBeenCalled();
    });

    it('skips data bar cell visits only when a configured rule-range resolver confirms no matching rule', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton({
            '0,0': {
                dataBar: {
                    color: '#2f56ef',
                    value: 75,
                    startPoint: 25,
                    isGradient: false,
                    isShowValue: true,
                },
            },
        });
        const dataBar = univer.__getInjector().get(DataBar);
        const resolver = vi.fn(() => []);
        dataBar.setRenderRangeResolver(resolver);

        const ranges = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }];
        dataBar.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, ranges);

        expect(resolver).toHaveBeenCalledWith('unit-1', 'sheet-1', ranges);
        expect(skeleton.worksheet.getCell).not.toHaveBeenCalled();
        expect(ctx.save).not.toHaveBeenCalled();
    });

    it('falls back when indexed ranges are unavailable but skips unmatched merged cells', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton({
            '0,0': {
                dataBar: {
                    color: '#2f56ef',
                    value: 75,
                    startPoint: 25,
                    isGradient: false,
                    isShowValue: true,
                },
            },
        });
        const dataBar = univer.__getInjector().get(DataBar);
        const resolver = vi.fn<() => IRange[] | null>(() => null);
        dataBar.setRenderRangeResolver(resolver);

        const ranges = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }];
        dataBar.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, ranges);
        expect(ctx.fill).toHaveBeenCalledTimes(1);

        resolver.mockReturnValue([]);
        skeleton.worksheet.setMergeData([ranges[0]]);
        dataBar.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, ranges);

        expect(resolver).toHaveBeenCalledTimes(2);
        expect(ctx.fill).toHaveBeenCalledTimes(1);
    });

    it.each(['dataBar', 'icon'])('does not scan merged cells without %s rules', (kind) => {
        const merge = { startRow: 0, endRow: 100000, startColumn: 0, endColumn: 20 };
        const skeleton = createSkeleton({}, undefined, undefined, [merge]);
        const extension = kind === 'dataBar' ? univer.__getInjector().get(DataBar) : univer.__getInjector().get(ConditionalFormattingIcon);
        const resolver = vi.fn(() => []);
        extension.setRenderRangeResolver(resolver);

        extension.draw(createCtx(), { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 10, endRow: 12, startColumn: 4, endColumn: 5 },
        ]);

        expect(resolver).toHaveBeenCalledOnce();
        expect(skeleton.worksheet.getCell).not.toHaveBeenCalled();
    });

    it.each(['dataBar', 'icon'])('keeps offscreen merged %s anchors and only visits visible repair cells', (kind) => {
        const ctx = createCtx();
        const anchor = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
        const merge = { ...anchor, endRow: 100000, endColumn: 20 };
        const repair = { startRow: 10, endRow: 12, startColumn: 4, endColumn: 5 };
        const skeleton = createSkeleton({
            '0,0': {
                dataBar: { color: '#2f56ef', value: 75, startPoint: 0, isGradient: false },
                iconSet: { iconType: IIconSetType.threeArrows, iconId: '0' },
            },
        }, new Set([10]), new Set([4]), [merge]);
        const extension = kind === 'dataBar' ? univer.__getInjector().get(DataBar) : univer.__getInjector().get(ConditionalFormattingIcon);
        if (extension instanceof ConditionalFormattingIcon) {
            (extension as any)._imageMap.set(`${IIconSetType.threeArrows}_0`, document.createElement('img'));
        }
        const resolver = vi.fn((_unitId: string, _sheetId: string, ranges: IRange[]) => (
            ranges.some((range) => range.startRow === 0 && range.startColumn === 0) ? [anchor] : []
        ));
        extension.setRenderRangeResolver(resolver);

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [repair]);

        expect(resolver).toHaveBeenCalledOnce();
        expect(kind === 'dataBar' ? ctx.fill : ctx.drawImage).toHaveBeenCalledOnce();
        expect(vi.mocked(skeleton.worksheet.getCell).mock.calls.length).toBeLessThanOrEqual(4);
        expect(vi.mocked(skeleton.worksheet.getCell).mock.calls).toEqual(expect.arrayContaining([[11, 5], [0, 0]]));
        expect(vi.mocked(skeleton.worksheet.getCell).mock.calls.every(([row, col]: [number, number]) => (
            (row === 0 && col === 0) || (row >= 11 && row <= 12 && col === 5)
        ))).toBe(true);
    });

    it('draws configured conditional-formatting icons and skips unavailable icons', () => {
        const ctx = createCtx();
        const icon = univer.__getInjector().get(ConditionalFormattingIcon);
        const nativeImage = document.createElement('img');
        (icon as any)._imageMap.set(`${IIconSetType.threeArrows}_0`, nativeImage);

        const skeleton = createSkeleton({
            '0,0': {
                iconSet: {
                    iconType: IIconSetType.threeArrows,
                    iconId: '0',
                    isShowValue: true,
                },
            },
            '0,1': {
                iconSet: {
                    iconType: IIconSetType.empty,
                    iconId: '0',
                    isShowValue: true,
                },
            },
            '0,2': {
                iconSet: {
                    iconType: IIconSetType.threeArrows,
                    iconId: '99',
                    isShowValue: true,
                },
            },
        });

        icon.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 },
        ]);

        expect(ctx.drawImage).toHaveBeenCalledTimes(1);
        expect(ctx.drawImage).toHaveBeenCalledWith(nativeImage, 2, 4.5, 15, 15);
    });

    it('skips icon drawing for missing worksheet and cells too small for the icon', () => {
        const ctx = createCtx();
        const icon = univer.__getInjector().get(ConditionalFormattingIcon);
        const nativeImage = document.createElement('img');
        (icon as any)._imageMap.set(`${IIconSetType.threeArrows}_0`, nativeImage);

        expect(icon.draw(ctx, { scaleX: 1, scaleY: 1 }, { worksheet: undefined } as any, [])).toBe(false);

        const skeleton = createSkeleton({
            '0,0': {
                iconSet: {
                    iconType: IIconSetType.threeArrows,
                    iconId: '0',
                    isShowValue: true,
                },
            },
        }, undefined, undefined, [], { width: 10, height: 10 });

        icon.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        ]);
        expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('skips icon cell visits when a configured rule-range resolver confirms no matching rule', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton({});
        const icon = univer.__getInjector().get(ConditionalFormattingIcon);
        const resolver = vi.fn(() => []);
        icon.setRenderRangeResolver(resolver);

        const ranges = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 }];
        icon.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, ranges);

        expect(resolver).toHaveBeenCalledWith('unit-1', 'sheet-1', ranges);
        expect(skeleton.worksheet.getCell).not.toHaveBeenCalled();
        expect(ctx.save).not.toHaveBeenCalled();
    });
});
