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

import type { IFreeze, IRange, IRangeWithCoord, IWorkbookData, Workbook } from '@univerjs/core';
import type { IPointerEvent } from '@univerjs/engine-render';
import { ICommandService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    ScrollBar,
    SHEET_VIEWPORT_KEY,
    Spreadsheet,
    Viewport,
} from '@univerjs/engine-render';
import {
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    PlatformService,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { ISheetSelectionRenderService } from '../base-selection-render.service';
import { RANGE_FILL_PERMISSION_CHECK } from '../const';
import { SheetSelectionRenderService } from '../selection-render.service';

interface IFixtureOptions {
    scrollX?: number;
    scrollY?: number;
    scale?: number;
    viewportKey?: SHEET_VIEWPORT_KEY;
    range?: IRange;
    mergeData?: IRange[];
    freeze?: IFreeze;
}

let frameCallback: FrameRequestCallback | undefined;

const cleanups: Array<() => void> = [];

function createFixture(options: IFixtureOptions = {}) {
    const { scrollX = 0, scrollY = 0, scale = 1, viewportKey = SHEET_VIEWPORT_KEY.VIEW_MAIN } = options;
    const univer = new Univer({ locale: LocaleType.EN_US });
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([SheetSkeletonService]);
    injector.add([SheetInterceptorService]);
    injector.add([SheetsSelectionsService]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.get(SheetSkeletonService);
    injector.get(SheetInterceptorService);
    injector.get(ICommandService).registerCommand(SetSelectionsOperation);
    const renderManager = injector.get(IRenderManagerService);
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'fill-drag',
        sheetOrder: ['sheet'],
        sheets: {
            sheet: {
                id: 'sheet',
                rowCount: 300,
                columnCount: 100,
                defaultColumnWidth: 100,
                defaultRowHeight: 20,
                mergeData: options.mergeData ?? [],
                freeze: options.freeze,
            },
        },
    });
    const render = renderManager.createRender(workbook.getUnitId());
    const { engine, scene } = render;
    engine.resizeBySize(1200, 800);
    scene.transformByState({ width: 10000, height: 6000, scaleX: scale, scaleY: scale });
    const viewport = new Viewport(viewportKey, scene, { left: 0, top: 0, width: 1200, height: 800 });
    const scrollbar = new ScrollBar(viewport, { mainScene: scene });
    const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN);
    render.mainComponent = spreadsheet;
    render.components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
    scene.addObject(spreadsheet);
    const skeletonManager = render.with(SheetSkeletonManagerService);
    skeletonManager.setCurrent({ sheetId: 'sheet' });
    const skeleton = skeletonManager.getCurrentSkeleton()!;
    renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSelectionRenderService]);
    const selectionService = render.with(SheetSelectionRenderService);
    render.getInjector!().add([ISheetSelectionRenderService, { useValue: selectionService }]);
    const permission = selectionService.interceptor.intercept(RANGE_FILL_PERMISSION_CHECK, { handler: () => true });
    viewport.scrollToViewportPos({ viewportScrollX: scrollX, viewportScrollY: scrollY });
    const range = options.range ?? {
        startRow: scrollY / 20 + 3,
        endRow: scrollY / 20 + 7,
        startColumn: scrollX / 100 + 2,
        endColumn: scrollX / 100 + 2,
    };
    const control = selectionService.newSelectionControl(scene, skeleton, { range, primary: null });
    const previews: IRangeWithCoord[] = [];
    const fills: IRangeWithCoord[] = [];
    const previewSub = control.selectionFilling$.subscribe((value) => {
        if (value) {
            previews.push(value);
        }
    });
    const fillSub = control.selectionFilled$.subscribe((value) => {
        if (value) {
            fills.push(value);
        }
    });
    const endCell = skeleton.getNoMergeCellWithCoordByIndex(range.endRow, range.endColumn);
    const startX = (endCell.endX - scrollX) * scale;
    const startY = (endCell.endY - scrollY) * scale;
    const event = (x: number, y: number) => ({ offsetX: x, offsetY: y }) as IPointerEvent;
    cleanups.push(() => {
        previewSub.unsubscribe();
        fillSub.unsubscribe();
        permission();
        scrollbar.dispose();
    });
    return {
        viewport,
        scene,
        range,
        previews,
        fills,
        control,
        startX,
        startY,
        down: () => control.fillControl.onPointerDown$.emitEvent(event(startX, startY)),
        move: (dx: number, dy: number) => scene.onPointerMove$.emitEvent(event(startX + dx, startY + dy)),
        up: () => scene.onPointerUp$.emitEvent(event(startX, startY)),
    };
}

beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        setTransform: () => {},
        clearRect: () => {},
    } as unknown as CanvasRenderingContext2D);
    frameCallback = undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        frameCallback = callback;
        return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
    cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
    vi.restoreAllMocks();
});

describe('SelectionShapeExtension autofill', () => {
    it.each([0.5, 1, 2])('keeps horizontal fill stable around the bottom edge after scrolling at %sx zoom', (scale) => {
        const fixture = createFixture({ scrollY: 1320, scale });
        fixture.down();
        for (const dy of [-2, 2, -2, 2]) {
            fixture.move(200 * scale, dy * scale);
            expect(fixture.previews.at(-1)).toMatchObject({ ...fixture.range, endColumn: 5 });
        }
        fixture.up();
        expect(fixture.fills).toEqual([fixture.previews.at(-1)]);
    });

    it.each([
        { scrollX: 0, scrollY: 0 },
        { scrollX: 2000, scrollY: 0 },
        { scrollX: 2000, scrollY: 1320 },
    ])('preserves all four fill directions with initial scroll $scrollX, $scrollY', (scroll) => {
        const fixture = createFixture(scroll);
        const { range } = fixture;
        fixture.down();
        const gestures = [
            { dx: 200, dy: 2, expected: { ...range, endColumn: range.endColumn + 3 } },
            { dx: -250, dy: 2, expected: { ...range, startColumn: range.startColumn - 2 } },
            { dx: 2, dy: 80, expected: { ...range, endRow: range.endRow + 5 } },
            { dx: 2, dy: -130, expected: { ...range, startRow: range.startRow - 2 } },
        ];
        for (const { dx, dy, expected } of gestures) {
            fixture.move(dx, dy);
            expect(fixture.previews.at(-1)).toMatchObject(expected);
        }
        fixture.up();
        expect(fixture.fills).toEqual([fixture.previews.at(-1)]);
    });

    it.each([
        { dx: 120, dy: 50, endRow: 7, endColumn: 4 },
        { dx: 80, dy: 50, endRow: 10, endColumn: 2 },
    ])('preserves diagonal direction choice for ($dx, $dy)', ({ dx, dy, endRow, endColumn }) => {
        const fixture = createFixture();
        fixture.down();
        fixture.move(dx, dy);
        fixture.up();
        expect(fixture.fills.at(-1)).toMatchObject({ ...fixture.range, endRow, endColumn });
    });

    it.each([
        { dx: -150, dy: -2, endRow: 7, endColumn: 3 },
        { dx: -2, dy: -50, endRow: 5, endColumn: 4 },
    ])('preserves shrinking a selection by dragging inside ($dx, $dy)', ({ dx, dy, endRow, endColumn }) => {
        const fixture = createFixture({ range: { startRow: 3, endRow: 7, startColumn: 2, endColumn: 4 } });
        fixture.down();
        fixture.move(dx, dy);
        fixture.up();
        expect(fixture.fills.at(-1)).toMatchObject({ ...fixture.range, endRow, endColumn });
    });

    it.each([0.5, 1, 2])('counts horizontal scrolling during a drag at %sx zoom', (scale) => {
        const fixture = createFixture({ scrollY: 1320, scale });
        fixture.down();
        fixture.viewport.scrollToViewportPos({ viewportScrollX: 600 });
        fixture.move(2 * scale, 100 * scale);
        fixture.up();
        expect(fixture.fills.at(-1)).toMatchObject({ ...fixture.range, endColumn: 9 });
    });

    it.each([0.5, 1, 2])('counts vertical scrolling during a drag at %sx zoom', (scale) => {
        const fixture = createFixture({ scrollX: 2000, scale });
        fixture.down();
        fixture.viewport.scrollToViewportPos({ viewportScrollY: 200 });
        fixture.move(300 * scale, 2 * scale);
        fixture.up();
        expect(fixture.fills.at(-1)).toMatchObject({ ...fixture.range, endRow: 18 });
    });

    it('extends the preview as edge auto-scroll advances without further pointer movement', () => {
        const fixture = createFixture({ scrollY: 1320 });
        fixture.down();
        fixture.move(840, 2);
        const firstEndColumn = fixture.previews.at(-1)!.endColumn;
        for (let i = 0; i < 5; i++) {
            frameCallback!(i * 16);
        }
        expect(fixture.viewport.viewportScrollX).toBeGreaterThan(0);
        expect(fixture.previews.at(-1)).toMatchObject({
            startRow: fixture.range.startRow,
            endRow: fixture.range.endRow,
        });
        expect(fixture.previews.at(-1)!.endColumn).toBeGreaterThan(firstEndColumn);
        fixture.up();
        expect(fixture.fills).toEqual([fixture.previews.at(-1)]);
    });

    it.each([
        { viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP, scrollX: 2000, scrollY: 0, dx: 2, dy: 80 },
        { viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, scrollX: 0, scrollY: 1320, dx: 200, dy: 2 },
    ])('fills within frozen viewport $viewportKey using its own scroll', (options) => {
        const fixture = createFixture(options);
        fixture.down();
        fixture.move(options.dx, options.dy);
        fixture.up();
        const expected = options.dx === 2
            ? { ...fixture.range, endRow: fixture.range.endRow + 5 }
            : { ...fixture.range, endColumn: fixture.range.endColumn + 3 };
        expect(fixture.fills.at(-1)).toMatchObject(expected);
    });

    it('keeps merged fill targets aligned to the source block after scrolling', () => {
        const range = { startRow: 69, endRow: 70, startColumn: 2, endColumn: 3 };
        const fixture = createFixture({ scrollY: 1320, range, mergeData: [range] });
        fixture.down();
        fixture.move(250, 2);
        fixture.up();
        expect(fixture.fills.at(-1)).toMatchObject({ ...range, endColumn: 7 });
    });
    it('keeps horizontal fill stable when crossing from frozen columns into the scrolled main viewport', () => {
        const fixture = createFixture({
            scrollY: 1320,
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT,
            range: { startRow: 69, endRow: 73, startColumn: 1, endColumn: 1 },
            freeze: { startRow: -1, startColumn: 3, xSplit: 3, ySplit: 0 },
        });
        fixture.viewport.setViewportSize({ width: 346 });
        const main = new Viewport(SHEET_VIEWPORT_KEY.VIEW_MAIN, fixture.scene, {
            left: 346,
            top: 0,
            width: 854,
            height: 800,
        });
        const scrollbar = new ScrollBar(main, { mainScene: fixture.scene });
        main.scrollToViewportPos({ viewportScrollX: 500, viewportScrollY: 1320 });
        cleanups.push(() => scrollbar.dispose());
        fixture.down();
        fixture.move(250, 2);
        fixture.move(350, 2);
        fixture.up();
        expect(fixture.fills.at(-1)).toMatchObject({ ...fixture.range, endColumn: 5 });
        expect(main.viewportScrollX).toBe(0);
    });
});
