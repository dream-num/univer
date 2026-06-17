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

import type { IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import type {
    ICellEditorLayout,
    ICellEditorState,
    IEditorBridgeServiceParam,
    IEditorBridgeServiceVisibleParam,
} from '../../../services/editor-bridge.service';
import {
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IConfigService,
    IUniverInstanceService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import {
    DefinedNamesService,
    FunctionService,
    IDefinedNamesService,
    IFunctionService,
    ISuperTableService,
    LexerTreeBuilder,
    SuperTableService,
} from '@univerjs/engine-formula';
import { DeviceInputEventType } from '@univerjs/engine-render';
import {
    RangeProtectionCache,
    RangeProtectionRuleModel,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { ComponentManager, ILayoutService, IUIPartsService, KeyCode, RediContext, UIPartsService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../../common/keys';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../../config/config';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { FormulaEditorManagerService, IFormulaEditorManagerService } from '../../../services/editor/formula-editor-manager.service';
import { FormulaBar } from '../FormulaBar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'formula-bar-unit';
const SHEET_ID = 'sheet-1';

class TestResizeObserver {
    observe(): void {}
    disconnect(): void {}
    unobserve(): void {}
}

class TestEditorBridgeService implements IEditorBridgeService {
    private readonly _currentEditCellState$ = new BehaviorSubject<Nullable<ICellEditorState>>(null);
    readonly currentEditCellState$ = this._currentEditCellState$.asObservable();

    private readonly _currentEditCellLayout$ = new BehaviorSubject<Nullable<ICellEditorLayout>>(null);
    readonly currentEditCellLayout$ = this._currentEditCellLayout$.asObservable();

    private readonly _currentEditCell$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly currentEditCell$ = this._currentEditCell$.asObservable();

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>({
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
        unitId: '',
    });

    readonly visible$ = this._visible$.asObservable();

    private readonly _forceKeepVisible$ = new BehaviorSubject(false);
    readonly forceKeepVisible$ = this._forceKeepVisible$.asObservable();

    readonly helpFunctionVisible$ = new BehaviorSubject(true);

    private _visibleState = this._visible$.getValue();
    readonly visibleHistory: IEditorBridgeServiceVisibleParam[] = [this._visibleState];

    setCurrentEditCell(state: ICellEditorState): void {
        this._currentEditCellState$.next(state);
    }

    refreshEditCellState(): void {}
    refreshEditCellPosition(): void {}
    setEditCell(): void {}
    getEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        return null;
    }

    getEditCellLayout(): Readonly<Nullable<ICellEditorLayout>> {
        return null;
    }

    getEditLocation(): Readonly<Nullable<ICellEditorState>> {
        return this._currentEditCellState$.getValue();
    }

    updateEditLocation(): void {}
    getLatestEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        return null;
    }

    changeVisible(param: IEditorBridgeServiceVisibleParam): void {
        this._visibleState = param;
        this.visibleHistory.push(param);
        this._visible$.next(param);
    }

    changeEditorDirty(): void {}
    getEditorDirty(): boolean {
        return false;
    }

    isVisible(): IEditorBridgeServiceVisibleParam {
        return this._visibleState;
    }

    enableForceKeepVisible(): void {
        this._forceKeepVisible$.next(true);
    }

    disableForceKeepVisible(): void {
        this._forceKeepVisible$.next(false);
    }

    isForceKeepVisible(): boolean {
        return this._forceKeepVisible$.getValue();
    }

    getCurrentEditorId(): string {
        return DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    }

    dispose(): void {
        this._currentEditCellState$.complete();
        this._currentEditCellLayout$.complete();
        this._currentEditCell$.complete();
        this._visible$.complete();
        this._forceKeepVisible$.complete();
        this.helpFunctionVisible$.complete();
    }
}

class TestEditorService {
    readonly focusedEditorIds: string[] = [];
    readonly blurHistory: boolean[] = [];

    focus(editorId: string): void {
        this.focusedEditorIds.push(editorId);
    }

    blur(force?: boolean): void {
        this.blurHistory.push(!!force);
    }
}

class TestLayoutService {
    focus(): void {}
}

function TestFormulaEditor(props: { editorId: string; unitId?: string }) {
    return <div data-editor-id={props.editorId} data-unit-id={props.unitId} />;
}

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Formula Bar',
        sheetOrder: [SHEET_ID],
        styles: {},
        sheets: {
            [SHEET_ID]: {
                id: SHEET_ID,
                name: 'Sheet1',
                cellData: {},
            },
        },
    };
}

function createCellEditState(): ICellEditorState {
    return {
        unitId: UNIT_ID,
        sheetId: SHEET_ID,
        row: 0,
        column: 0,
        editorUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        documentLayoutObject: {
            documentModel: {
                getBody: () => ({ customBlocks: [] }),
                getDrawingsOrder: () => [],
            },
        } as never,
    };
}

function createFormulaBarTestBed() {
    const originalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = TestResizeObserver as typeof ResizeObserver;

    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
    injector.add([ISuperTableService, { useClass: SuperTableService }]);
    injector.add([IFunctionService, { useClass: FunctionService }]);
    injector.add([LexerTreeBuilder, { useClass: LexerTreeBuilder }]);
    injector.add([ComponentManager, { useClass: ComponentManager }]);
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([SheetsSelectionsService, { useClass: SheetsSelectionsService }]);
    injector.add([WorksheetProtectionRuleModel, { useClass: WorksheetProtectionRuleModel }]);
    injector.add([RangeProtectionRuleModel, { useClass: RangeProtectionRuleModel }]);
    injector.add([RangeProtectionCache, { useClass: RangeProtectionCache }]);
    injector.add([SheetPermissionCheckController, { useClass: SheetPermissionCheckController }]);
    injector.add([IFormulaEditorManagerService, { useClass: FormulaEditorManagerService }]);
    injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    injector.add([IEditorService, { useClass: TestEditorService as never }]);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(IConfigService).setConfig(SHEETS_UI_PLUGIN_CONFIG_KEY, {});

    const componentManager = injector.get(ComponentManager);
    componentManager.register(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, TestFormulaEditor);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(SetCellEditVisibleOperation);

    const editorBridgeService = injector.get(IEditorBridgeService) as TestEditorBridgeService;
    editorBridgeService.setCurrentEditCell(createCellEditState());
    editorBridgeService.changeVisible({
        visible: true,
        eventType: DeviceInputEventType.PointerDown,
        unitId: UNIT_ID,
    });

    return {
        univer,
        injector,
        workbook,
        editorBridgeService,
        restoreResizeObserver: () => {
            globalThis.ResizeObserver = originalResizeObserver;
        },
    };
}

function renderWithDependencies(element: ReactElement, injector: ReturnType<typeof createFormulaBarTestBed>['injector']) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function getActionElement(container: HTMLElement, index: number): HTMLElement {
    const formulaBar = container.querySelector('[data-u-comp="formula-bar"]');
    if (!(formulaBar instanceof HTMLElement)) {
        throw new TypeError('Formula bar not rendered');
    }

    const elements = formulaBar.querySelectorAll('span');
    const element = elements.item(index);
    if (!(element instanceof HTMLElement)) {
        throw new TypeError(`Formula bar action ${index} not rendered`);
    }

    return element;
}

async function clickElement(element: HTMLElement): Promise<void> {
    await act(async () => {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
    });
}

describe('FormulaBar', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentBed: ReturnType<typeof createFormulaBarTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentBed?.univer.dispose();
        currentBed?.restoreResizeObserver();
        root = undefined;
        container = undefined;
        currentBed = undefined;
    });

    it('closes editing through the command service when cancel is clicked', async () => {
        currentBed = createFormulaBarTestBed();
        const rendered = renderWithDependencies(<FormulaBar disableDefinedName />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        await clickElement(getActionElement(rendered.container, 0));

        expect(currentBed.editorBridgeService.visibleHistory.at(-1)).toEqual({
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            keycode: KeyCode.ESC,
            unitId: UNIT_ID,
        });
    });

    it('commits editing through the command service when confirm is clicked', async () => {
        currentBed = createFormulaBarTestBed();
        const rendered = renderWithDependencies(<FormulaBar disableDefinedName />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        await clickElement(getActionElement(rendered.container, 1));

        expect(currentBed.editorBridgeService.visibleHistory.at(-1)).toEqual({
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: UNIT_ID,
        });
    });
});
