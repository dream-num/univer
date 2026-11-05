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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import {
    CommandType,
    ICommandService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CanvasColorService,
    DRAWING_OBJECT_LAYER_INDEX,
    Engine,
    ICanvasColorService,
    Image,
    Rect,
    Scene,
    SHEET_VIEWPORT_KEY,
    Vector2,
    Viewport,
} from '@univerjs/engine-render';
import {
    RangeProtectionRuleModel,
    SelectRangeCommand,
    SheetInterceptorService,
    SheetRangeThemeModel,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { DeleteSheetTableCommand, DeleteSheetTableMutation, SheetTableService, TableManager } from '@univerjs/sheets-table';
import {
    ISheetSelectionRenderService,
    MoveSelectionCommand,
    SelectAllCommand,
    SheetCanvasPopManagerService,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import {
    DesktopDialogService,
    DesktopSidebarService,
    IDialogService,
    ISidebarService,
    IUIPartsService,
    UIPartsService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ISheetTableMenuExtraProps } from '../../views/components/SheetTableMenu';
import type { SheetTableControlsShape } from '../../views/widgets/table-controls.shape';
import { SHEET_TABLE_MENU } from '../../const';
import enUS from '../../locale/en-US';
import { SheetTableControlsMobileRenderController } from '../mobile/sheet-table-controls-render.controller';
import { SheetTableControlsRenderController } from '../sheet-table-controls-render.controller';
import { SheetTableThemeUIController } from '../sheet-table-theme-ui.controller';

const disposables: Array<{ dispose: () => void }> = [];

afterEach(() => {
    disposables.reverse().forEach((disposable) => disposable.dispose());
    disposables.length = 0;
    vi.restoreAllMocks();
});

function createTestBed(hasSkeleton = true, controllerType = SheetTableControlsRenderController) {
    // happy-dom has no native canvas; scene ordering and hit testing stay real.
    const context2d = new Proxy({
        canvas: document.createElement('canvas'),
        getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    }, {
        get: (target, key) => Reflect.get(target, key) ?? (() => {}),
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context2d as never);
    const univer = new Univer();
    disposables.push(univer);
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([SheetInterceptorService]);
    injector.add([SheetRangeThemeModel]);
    injector.add([SheetSkeletonService]);
    injector.add([SheetsSelectionsService]);
    injector.add([RangeProtectionRuleModel]);
    injector.add([WorksheetProtectionRuleModel]);
    injector.add([WorksheetProtectionPointModel]);
    injector.add([WorkbookPermissionService]);
    injector.add([TableManager]);
    injector.add([SheetTableService]);
    injector.add([SheetTableThemeUIController]);
    const popupDisposable = { dispose: vi.fn(), canDispose: () => true };
    const attachPopupByPosition = vi.fn((_bound: unknown, _popup: unknown, _location: unknown) => popupDisposable);
    injector.add([SheetCanvasPopManagerService, { useValue: { attachPopupByPosition } as unknown as SheetCanvasPopManagerService }]);
    injector.add([ISheetSelectionRenderService, { useValue: { resetSelectionsByModelData: vi.fn() } as unknown as ISheetSelectionRenderService }]);
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IDialogService, { useClass: DesktopDialogService }]);
    injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
    const unit = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit-1',
        sheetOrder: ['sheet-1'],
        sheets: { 'sheet-1': { id: 'sheet-1', rowCount: 20, columnCount: 10 } },
    });
    const engine = injector.createInstance(Engine, 'unit-1', { elementWidth: 800, elementHeight: 600 });
    disposables.push(engine);
    const scene = new Scene('test', engine, { width: 800, height: 600 });
    const viewport = new Viewport(SHEET_VIEWPORT_KEY.VIEW_MAIN, scene, { left: 0, top: 0, right: 0, bottom: 0 });
    disposables.push(viewport);
    const context = { unit, unitId: unit.getUnitId(), engine, scene, components: new Map() } as IRenderContext<Workbook>;
    injector.add([SheetSkeletonManagerService, {
        useFactory: function createSkeletonManager() {
            return injector.createInstance(SheetSkeletonManagerService, context);
        },
    }]);
    injector.add([SheetTableControlsRenderController, {
        useFactory: function createController() {
            return injector.createInstance(controllerType, context);
        },
    }]);
    if (hasSkeleton) {
        injector.get(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet-1' });
    }
    const tables = injector.get(TableManager);
    const addTable = () => tables.addTable('unit-1', 'sheet-1', 'Orders', {
        startRow: 2,
        endRow: 4,
        startColumn: 2,
        endColumn: 4,
    }, ['Name', 'Amount', 'Tax'], 'table-1');
    return { injector, scene, engine, addTable, attachPopupByPosition, popupDisposable };
}

describe('SheetTableControlsRenderController', () => {
    it('keeps sheet caches for selection refreshes and invalidates them for table refreshes', () => {
        const { injector, scene, addTable } = createTestBed();
        injector.get(SheetTableControlsRenderController);
        const sceneMakeDirty = vi.spyOn(scene, 'makeDirty');
        const commands = injector.get(ICommandService);
        injector.get(SheetsSelectionsService).setSelections('unit-1', 'sheet-1', []);
        for (const id of [MoveSelectionCommand.id, SelectAllCommand.id, SelectRangeCommand.id]) {
            commands.registerCommand({ id, type: CommandType.COMMAND, handler: () => true });
            commands.syncExecuteCommand(id);
        }
        commands.registerCommand({ id: 'doc.mutation.rich-text-editing', type: CommandType.MUTATION, handler: () => true });
        commands.syncExecuteCommand('doc.mutation.rich-text-editing');
        expect(sceneMakeDirty).not.toHaveBeenCalled();

        addTable();
        expect(sceneMakeDirty).toHaveBeenCalledOnce();
    });

    it('hides unavailable controls without invalidating sheet caches on selection changes', () => {
        const { injector, scene } = createTestBed(false);
        injector.get(SheetTableControlsRenderController);
        const sceneMakeDirty = vi.spyOn(scene, 'makeDirty');

        injector.get(SheetsSelectionsService).setSelections('unit-1', 'sheet-1', []);

        expect(scene.getAllObjectsByOrder()).toEqual([]);
        expect(sceneMakeDirty).not.toHaveBeenCalled();
    });

    it('opens the table menu and routes deletion through the command service', async () => {
        const { injector, scene, engine, addTable, attachPopupByPosition, popupDisposable } = createTestBed();
        addTable();
        injector.get(SheetTableControlsRenderController);
        const shape = scene.getObject('SheetTableControlsShape') as SheetTableControlsShape;
        shape.render(engine.getCanvas().getContext());
        const anchor = shape.getAnchorRegion('table-1')!;
        shape.onPointerDown$.emitEvent({
            offsetX: anchor.left + anchor.width - 10,
            offsetY: anchor.top + 10,
            stopPropagation: () => {},
            preventDefault: () => {},
        } as never);

        expect(attachPopupByPosition).toHaveBeenCalledWith(
            { left: anchor.left, right: anchor.left + anchor.width, top: anchor.top, bottom: anchor.top + anchor.height },
            expect.objectContaining({ componentKey: SHEET_TABLE_MENU }),
            { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 2 }
        );
        const popup = attachPopupByPosition.mock.calls[0][1] as { extraProps: ISheetTableMenuExtraProps };
        const commands = injector.get(ICommandService);
        commands.registerCommand(DeleteSheetTableCommand);
        commands.registerCommand(DeleteSheetTableMutation);
        const executeCommand = vi.spyOn(commands, 'executeCommand');

        await popup.extraProps.onSelect('delete');
        await executeCommand.mock.results[0].value;

        expect(injector.get(TableManager).getTableById('unit-1', 'table-1')).toBeUndefined();
        expect(popupDisposable.dispose).toHaveBeenCalledOnce();
        expect(executeCommand).toHaveBeenCalledWith(DeleteSheetTableCommand.id, {
            tableId: 'table-1',
            subUnitId: 'sheet-1',
            unitId: 'unit-1',
        });
    });

    it.each([SheetTableControlsRenderController, SheetTableControlsMobileRenderController])(
        'renders and picks floating images above exposed table controls with %s',
        (controllerType) => {
            const { injector, scene, engine, addTable } = createTestBed(true, controllerType);
            addTable();
            injector.get(SheetTableControlsRenderController);
            const shape = scene.getObject('SheetTableControlsShape') as SheetTableControlsShape;
            shape.render(engine.getCanvas().getContext());
            const anchor = shape.getAnchorRegion('table-1')!;
            const selection = new Rect('selection', { left: 0, top: 0, width: 800, height: 600 });
            scene.addObject(selection, 1);
            const image = new Image('floating-image', {
                left: anchor.left + anchor.width / 2,
                top: anchor.top,
                width: 200,
                height: 150,
            });
            scene.addObject(image, DRAWING_OBJECT_LAYER_INDEX);

            const order = scene.getAllObjectsByOrder();
            expect(order.indexOf(selection)).toBeLessThan(order.indexOf(shape));
            expect(scene.pick(new Vector2(anchor.left + anchor.width - 10, anchor.top + 10))).toBe(image);
            expect(order.indexOf(shape)).toBeLessThan(order.indexOf(image));
            expect(scene.pick(new Vector2(anchor.left + 10, anchor.top + 10))).toBe(shape);

            image.hide();
            expect(scene.pick(new Vector2(anchor.left + anchor.width - 10, anchor.top + 10))).toBe(shape);
        }
    );
});
