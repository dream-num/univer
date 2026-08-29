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

import type { IDocumentData, IStyleData, IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import type {
    ICellEditorLayout,
    ICellEditorState,
    IEditorBridgeServiceParam,
    IEditorBridgeServiceVisibleParam,
} from '../../../services/editor-bridge.service';
import {
    CommandType,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IConfigService,
    IUniverInstanceService,
    LocaleService,
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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../../common/keys';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../../config/config';
import { MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID } from '../../../consts/mobile-context';
import enUS from '../../../locale/en-US';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { FormulaEditorManagerService, IFormulaEditorManagerService } from '../../../services/editor/formula-editor-manager.service';
import { MobileFormulaBar } from '../../mobile/formula-bar/MobileFormulaBar';
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

    readonly refreshEditCellState = vi.fn();
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

const testFormulaEditor = {
    getDocumentData: (): IDocumentData => ({
        id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
        body: { dataStream: 'Existing\r\n' },
        documentStyle: {},
    }),
    getSelectionRanges: () => [],
    setSelectionRanges: vi.fn(),
};

class TestEditorService {
    readonly focusedEditorIds: string[] = [];
    readonly blurHistory: boolean[] = [];

    getEditor(editorId: string) {
        return editorId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY ? testFormulaEditor : null;
    }

    getFocusId(): null {
        return null;
    }

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

function TestFormulaEditor(props: {
    editorId: string;
    unitId?: string;
}) {
    return <div data-editor-id={props.editorId} data-unit-id={props.unitId} />;
}

function createWorkbookData(cellStyle?: IStyleData): IWorkbookData {
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
                cellData: cellStyle ? { 0: { 0: { s: cellStyle } } } : {},
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
                getSnapshot: () => ({ id: 'doc-1', documentStyle: {}, drawingsOrder: [] }),
            },
        } as never,
    };
}

function createFormulaBarTestBed(cellStyle?: IStyleData) {
    const originalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = TestResizeObserver as typeof ResizeObserver;

    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

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
    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        createWorkbookData(cellStyle)
    );
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(IConfigService).setConfig(SHEETS_UI_PLUGIN_CONFIG_KEY, {});

    const componentManager = injector.get(ComponentManager);
    componentManager.register(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, TestFormulaEditor);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(SetCellEditVisibleOperation);
    const mobileSubmit = vi.fn(() => true);
    commandService.registerCommand({
        id: MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID,
        type: CommandType.COMMAND,
        handler: mobileSubmit,
    });

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
        mobileSubmit,
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

    const elements = formulaBar.querySelectorAll(
        '[data-u-comp="formula-bar-actions"] > button, [data-u-comp="formula-bar-actions"] > span'
    );
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
        vi.unstubAllGlobals();
    });

    it('replays the selected cell after the lazy mobile formula editor mounts', async () => {
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        currentBed = createFormulaBarTestBed();
        const rendered = renderWithDependencies(<MobileFormulaBar />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        await act(async () => Promise.resolve());

        expect(currentBed.editorBridgeService.refreshEditCellState).toHaveBeenCalledOnce();
        expect(testFormulaEditor.setSelectionRanges).toHaveBeenCalledWith([{
            startOffset: 8,
            endOffset: 8,
        }], false);
    });

    it('keeps its toolbar layout LTR when the sheet host is RTL', () => {
        currentBed = createFormulaBarTestBed();
        const rendered = renderWithDependencies(
            <div dir="rtl">
                <FormulaBar disableDefinedName />
            </div>,
            currentBed.injector
        );
        root = rendered.root;
        container = rendered.container;

        const formulaBar = rendered.container.querySelector('[data-u-comp="formula-bar"]');
        const definedName = formulaBar?.querySelector('[data-u-comp="defined-name"]');
        const input = definedName?.querySelector('input');
        const dropdownTrigger = definedName?.querySelector('a');

        expect(formulaBar?.getAttribute('dir')).toBe('ltr');
        expect(input?.classList).toContain('univer-pl-1.5');
        expect(input?.classList).toContain('univer-pr-5');
        expect(input?.className).not.toContain('rtl:');
        expect(dropdownTrigger?.classList).toContain('univer-right-0');
        expect(dropdownTrigger?.className).not.toContain('rtl:');
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

    it('commits and moves down from the compact mobile formula bar', async () => {
        currentBed = createFormulaBarTestBed();
        const rendered = renderWithDependencies(<FormulaBar disableDefinedName mobile />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        const editorHost = rendered.container.querySelector('[data-editor-id]')?.parentElement;
        expect(editorHost?.classList).toContain('univer-my-2');

        await clickElement(getActionElement(rendered.container, 1));

        expect(currentBed.mobileSubmit).toHaveBeenCalledOnce();
        expect(currentBed.editorBridgeService.visibleHistory.at(-1)?.visible).toBe(true);
    });

    it('inherits the selected cell background in the mobile editor', () => {
        currentBed = createFormulaBarTestBed({
            bg: { rgb: '#000000' },
            cl: { rgb: '#0000FF' },
        });
        const rendered = renderWithDependencies(<FormulaBar disableDefinedName mobile />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        const editorHost = rendered.container.querySelector('[data-editor-id]')?.parentElement;
        expect(editorHost?.style.backgroundColor).toBe('#000000');
    });

    it('opens immersive mobile editing from the compact up arrow', async () => {
        currentBed = createFormulaBarTestBed();
        const onExpandedChange = vi.fn();
        const rendered = renderWithDependencies(
            <FormulaBar disableDefinedName mobile onExpandedChange={onExpandedChange} />,
            currentBed.injector
        );
        root = rendered.root;
        container = rendered.container;

        const expandButton = rendered.container.querySelector<HTMLElement>('[data-u-comp="formula-bar-expand"]');
        const icon = expandButton?.querySelector('svg');
        expect(icon?.classList).toContain('univer-rotate-180');
        expect(icon?.classList).toContain('univer-size-5');

        if (!expandButton) throw new Error('Expected the formula bar expand button to be rendered.');
        await clickElement(expandButton);
        expect(onExpandedChange).toHaveBeenCalledWith(true);
    });

    it('commits, moves down, and collapses immersive mobile editing', async () => {
        currentBed = createFormulaBarTestBed();
        const onExpandedChange = vi.fn();
        const rendered = renderWithDependencies(
            <FormulaBar disableDefinedName expanded mobile onExpandedChange={onExpandedChange} />,
            currentBed.injector
        );
        root = rendered.root;
        container = rendered.container;

        await clickElement(getActionElement(rendered.container, 1));

        expect(currentBed.mobileSubmit).toHaveBeenCalledOnce();
        expect(currentBed.editorBridgeService.visibleHistory.at(-1)?.visible).toBe(true);
        expect(onExpandedChange).toHaveBeenCalledWith(false);
    });

    it('fills the mobile viewport while the formula bar is expanded', () => {
        currentBed = createFormulaBarTestBed();
        const onExpandedChange = vi.fn();
        const rendered = renderWithDependencies(
            <FormulaBar disableDefinedName expanded mobile onExpandedChange={onExpandedChange} />,
            currentBed.injector
        );
        root = rendered.root;
        container = rendered.container;

        const formulaBar = rendered.container.querySelector('[data-u-comp="formula-bar"]');
        const editorHost = rendered.container.querySelector('[data-editor-id]')?.parentElement;
        expect(formulaBar?.getAttribute('data-expanded')).toBe('true');
        expect(formulaBar?.classList).toContain('!univer-h-full');
        expect(editorHost?.classList).not.toContain('univer-my-2');
    });
});
