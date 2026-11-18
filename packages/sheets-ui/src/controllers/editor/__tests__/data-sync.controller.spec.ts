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

import type { ICommandInfo, IDocumentBody, IDocumentData, IDrawings, Nullable } from '@univerjs/core';
import {
    BooleanNumber,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    Injector,
    IUniverInstanceService,
    ThemeService,
} from '@univerjs/core';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import {
    MoveRangeMutation,
    RangeProtectionRuleModel,
    SetRangeValuesMutation,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import type { ICellEditorState } from '../../../services/editor-bridge.service';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { IFormulaEditorManagerService } from '../../../services/editor/formula-editor-manager.service';
import { createChartRenderTestBed } from '../../render-controllers/__tests__/chart-render-test-bed';
import { EditorDataSyncController } from '../data-sync.controller';
import { FormulaEditorController } from '../formula-editor.controller';

interface ITestableEditorDataSyncController {
    _checkAndSetRenderStyleConfig: (documentDataModel: Pick<DocumentDataModel, 'getSnapshot'>) => void;
    _syncContentAndRender: (
        unitId: string,
        body: IDocumentBody,
        drawings: Nullable<IDrawings>,
        drawingsOrder: Nullable<string[]>
    ) => void;
}

class TestCommandService {
    private readonly _listeners = new Set<(command: ICommandInfo) => void>();

    onCommandExecuted(listener: (command: ICommandInfo) => void) {
        this._listeners.add(listener);

        return {
            dispose: () => this._listeners.delete(listener),
        };
    }

    emit(command: ICommandInfo) {
        this._listeners.forEach((listener) => listener(command));
    }
}

describe('EditorDataSyncController', () => {
    const controllers: EditorDataSyncController[] = [];

    afterEach(() => {
        controllers.splice(0).forEach((controller) => controller.dispose());
    });

    function createController(options: {
        isFocusFxBar?: boolean;
        themeTextColor?: string;
        isInArrayFormulaRange?: boolean;
        isEditorVisible?: boolean;
        eventType?: DeviceInputEventType;
        formulaBarPosition?: { width: number; height: number } | null;
        documentDataModel?: DocumentDataModel;
        editUnitId?: string;
        editSheetId?: string;
    } = {}) {
        const commandService = new TestCommandService();
        const editorBridgeService = {
            currentEditCellState$: new BehaviorSubject<Nullable<ICellEditorState>>(null),
            getEditLocation: vi.fn(() => ({
                unitId: options.editUnitId ?? 'test-unit',
                sheetId: options.editSheetId ?? 'sheet1',
                row: 1,
                column: 2,
                isInArrayFormulaRange: options.isInArrayFormulaRange ?? false,
            })),
            isVisible: vi.fn(() => ({
                visible: options.isEditorVisible ?? false,
                eventType: options.eventType ?? DeviceInputEventType.Dblclick,
            })),
            refreshEditCellState: vi.fn(),
            changeEditorDirty: vi.fn(),
            isForceKeepVisible: vi.fn(() => false),
        };
        const contextService = {
            getContextValue: vi.fn((key: string) => {
                if (key === FOCUSING_FX_BAR_EDITOR) return options.isFocusFxBar ?? false;
                return false;
            }),
            subscribeContextValue$: vi.fn(() => EMPTY),
        };
        const currentTheme$ = new BehaviorSubject({});
        const skeleton = { calculate: vi.fn() };
        const documentViewModel = { reset: vi.fn() };
        const currentRender = {
            mainComponent: { makeDirty: vi.fn() },
            with: vi.fn(() => ({
                getSkeleton: () => skeleton,
                getViewModel: () => documentViewModel,
            })),
        };

        const injector = new Injector();
        injector.add([IUniverInstanceService, {
            useValue: { getUnit: () => options.documentDataModel } as never,
        }]);
        injector.add([IRenderManagerService, {
            useValue: { getRenderUnitById: () => options.documentDataModel ? currentRender : undefined } as never,
        }]);
        injector.add([IEditorBridgeService, { useValue: editorBridgeService as never }]);
        injector.add([ICommandService, { useValue: commandService as never }]);
        injector.add([RangeProtectionRuleModel, { useValue: { getRangeRuleInitState: () => true } as never }]);
        injector.add([WorksheetProtectionRuleModel, { useValue: { getSheetRuleInitState: () => true } as never }]);
        injector.add([FormulaEditorController, { useValue: { autoScroll: vi.fn() } as never }]);
        injector.add([IFormulaEditorManagerService, {
            useValue: { getPosition: () => options.formulaBarPosition ?? null } as never,
        }]);
        injector.add([IContextService, { useValue: contextService as never }]);
        injector.add([ThemeService, {
            useValue: {
                currentTheme$,
                getColorFromTheme: vi.fn((token: string) => token === 'gray.900'
                    ? options.themeTextColor ?? '#1b1c1f'
                    : '#d1d5db'),
            } as never,
        }]);
        injector.add([EditorDataSyncController]);

        const controller = injector.get(EditorDataSyncController);

        controllers.push(controller);

        return {
            commandService,
            controller,
            editorBridgeService,
        };
    }

    function checkAndSetRenderStyleConfig(controller: EditorDataSyncController, snapshot: IDocumentData) {
        (controller as unknown as ITestableEditorDataSyncController)._checkAndSetRenderStyleConfig({
            getSnapshot: vi.fn(() => snapshot),
        });
    }

    function syncContentAndRender(
        controller: EditorDataSyncController,
        body: IDocumentBody
    ) {
        const testableController = controller as unknown as ITestableEditorDataSyncController;
        testableController._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, body, null, null);
    }

    it('ignores a zero-width formula bar position', () => {
        const { controller } = createController({ formulaBarPosition: { width: 0, height: 28 } });
        const formulaBarSnapshot: IDocumentData = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
            body: {
                dataStream: 'text\r\n',
            },
        };

        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);

        expect(formulaBarSnapshot.documentStyle?.pageSize?.width).toBe(Number.POSITIVE_INFINITY);
    });

    it('applies a measured formula bar width', () => {
        const { controller } = createController({ formulaBarPosition: { width: 320, height: 28 } });
        const formulaBarSnapshot: IDocumentData = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
            body: {
                dataStream: 'text\r\n',
            },
        };

        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);

        expect(formulaBarSnapshot.documentStyle?.pageSize?.width).toBe(320);
    });

    it('keeps the previous formula bar width when the latest position has zero width', () => {
        const formulaBarPosition = { width: 320, height: 28 };
        const { controller } = createController({ formulaBarPosition });
        const formulaBarSnapshot: IDocumentData = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
            body: {
                dataStream: 'text\r\n',
            },
        };

        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);
        formulaBarPosition.width = 0;
        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);

        expect(formulaBarSnapshot.documentStyle.pageSize?.width).toBe(320);
    });

    it('notifies formula bar content observers when the selected cell changes', () => {
        const documentDataModel = new DocumentDataModel({
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
            body: {
                dataStream: '=SUM(A1)\r\n',
            },
        });
        const { controller } = createController({ documentDataModel });
        let observedDataStream = '';
        const subscription = documentDataModel.change$.subscribe(() => {
            observedDataStream = documentDataModel.getBody()?.dataStream ?? '';
        });

        syncContentAndRender(controller, { dataStream: '\r\n' });

        expect(documentDataModel.getBody()?.dataStream).toBe('\r\n');
        expect(observedDataStream).toBe('\r\n');

        subscription.unsubscribe();
        documentDataModel.dispose();
    });

    it.each([
        { isEditorVisible: false, eventType: DeviceInputEventType.Dblclick },
        { isEditorVisible: true, eventType: DeviceInputEventType.Dblclick },
        { isEditorVisible: false, eventType: DeviceInputEventType.PointerDown },
        { isEditorVisible: true, eventType: DeviceInputEventType.PointerDown },
        { isEditorVisible: true, eventType: DeviceInputEventType.Keyboard },
    ])('clears inherited formulas only while editing (visible=$isEditorVisible, event=$eventType)', ({ isEditorVisible, eventType }) => {
        const documentDataModel = new DocumentDataModel({
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
            body: { dataStream: '\r\n' },
        });
        const sourceDocument = new DocumentDataModel({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            documentStyle: {},
            body: { dataStream: '=A1:B10\r\n' },
        });
        const { editorBridgeService } = createController({
            documentDataModel,
            isEditorVisible,
            eventType,
            isInArrayFormulaRange: true,
        });

        editorBridgeService.currentEditCellState$.next({
            isInArrayFormulaRange: true,
            documentLayoutObject: { documentModel: sourceDocument },
        } as ICellEditorState);

        expect(documentDataModel.getBody()?.dataStream).toBe(isEditorVisible ? '\r\n' : '=A1:B10\r\n');
        expect(sourceDocument.getBody()?.dataStream).toBe('=A1:B10\r\n');
        documentDataModel.dispose();
        sourceDocument.dispose();
    });

    it('refreshes the current edit cell when set-values updates the edited cell', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test-unit',
                subUnitId: 'sheet1',
                cellValue: {
                    1: {
                        2: { v: 'updated' },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.refreshEditCellState).toHaveBeenCalledTimes(1);
    });

    it('refreshes the current edit cell when set-values clears the edited cell', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test-unit',
                subUnitId: 'sheet1',
                cellValue: {
                    1: {
                        2: null,
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.refreshEditCellState).toHaveBeenCalledTimes(1);
    });

    it('refreshes the current edit cell when move-range changes the edited cell', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test-unit',
                from: {
                    subUnitId: 'sheet1',
                    value: {
                        1: {
                            2: null,
                        },
                    },
                },
                to: {
                    subUnitId: 'sheet1',
                    value: {},
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.refreshEditCellState).toHaveBeenCalledTimes(1);
    });

    it('refreshes the current edit cell when move-range writes into it', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test-unit',
                from: {
                    subUnitId: 'sheet2',
                    value: {
                        1: {
                            2: null,
                        },
                    },
                },
                to: {
                    subUnitId: 'sheet1',
                    value: {
                        1: {
                            2: { v: 'moved' },
                        },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.refreshEditCellState).toHaveBeenCalledTimes(1);
    });

    it('ignores set-values on the same coordinates of another sheet', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test-unit',
                subUnitId: 'sheet2',
                cellValue: {
                    1: {
                        2: { v: 'recalculated' },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('ignores set-values on the same coordinates of another workbook', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'other-unit',
                subUnitId: 'sheet1',
                cellValue: {
                    1: {
                        2: { v: 'updated' },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('ignores move-range on the same coordinates of another sheet', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test-unit',
                from: {
                    subUnitId: 'sheet2',
                    value: {
                        1: {
                            2: { v: 'moved' },
                        },
                    },
                },
                to: {
                    subUnitId: 'sheet3',
                    value: {},
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('marks the open editor dirty when an external update replaces the edited cell content', () => {
        const { commandService, editorBridgeService } = createController({ isEditorVisible: true });

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test-unit',
                subUnitId: 'sheet1',
                cellValue: {
                    1: {
                        2: { f: '=SUM(A1:A2)' },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.changeEditorDirty).toHaveBeenCalledWith(true);
        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('marks the open editor dirty when the edited cell is cleared externally', () => {
        const { commandService, editorBridgeService } = createController({ isEditorVisible: true });

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test-unit',
                subUnitId: 'sheet1',
                cellValue: {
                    1: {
                        2: null,
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.changeEditorDirty).toHaveBeenCalledWith(true);
    });

    it('leaves the open editor untouched when an external update only changes cell style', () => {
        const { commandService, editorBridgeService } = createController({ isEditorVisible: true });

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'test-unit',
                subUnitId: 'sheet1',
                cellValue: {
                    1: {
                        2: { s: { bg: { rgb: '#ff0000' }, bl: 1 } },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.changeEditorDirty).not.toHaveBeenCalled();
        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('marks the open editor dirty when move-range writes the edited cell', () => {
        const { commandService, editorBridgeService } = createController({ isEditorVisible: true });

        commandService.emit({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test-unit',
                from: {
                    subUnitId: 'sheet1',
                    value: {
                        1: {
                            2: null,
                        },
                    },
                },
                to: {
                    subUnitId: 'sheet1',
                    value: {},
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.changeEditorDirty).toHaveBeenCalledWith(true);
        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('marks the open editor dirty when move-range moves cells into the edited cell', () => {
        const { commandService, editorBridgeService } = createController({ isEditorVisible: true });

        commandService.emit({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test-unit',
                from: {
                    subUnitId: 'sheet2',
                    value: {},
                },
                to: {
                    subUnitId: 'sheet1',
                    value: {
                        1: {
                            2: { v: 'moved' },
                        },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.changeEditorDirty).toHaveBeenCalledWith(true);
    });

    it('leaves the open editor untouched when move-range does not involve the edited cell', () => {
        const { commandService, editorBridgeService } = createController({ isEditorVisible: true });

        commandService.emit({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test-unit',
                from: {
                    subUnitId: 'sheet1',
                    value: {
                        5: {
                            7: null,
                        },
                    },
                },
                to: {
                    subUnitId: 'sheet1',
                    value: {
                        6: {
                            8: { v: 'moved' },
                        },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.changeEditorDirty).not.toHaveBeenCalled();
        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('leaves the open editor untouched when move-range writes the edited coordinates on another sheet', () => {
        const { commandService, editorBridgeService } = createController({ isEditorVisible: true });

        commandService.emit({
            id: MoveRangeMutation.id,
            params: {
                unitId: 'test-unit',
                from: {
                    subUnitId: 'sheet2',
                    value: {
                        1: {
                            2: null,
                        },
                    },
                },
                to: {
                    subUnitId: 'sheet2',
                    value: {
                        1: {
                            2: { v: 'moved' },
                        },
                    },
                },
            },
        } as ICommandInfo);

        expect(editorBridgeService.changeEditorDirty).not.toHaveBeenCalled();
        expect(editorBridgeService.refreshEditCellState).not.toHaveBeenCalled();
    });

    it('renders formula reference styles in the cell editor when the cell editor is focused', () => {
        const { controller } = createController();
        const cellEditorSnapshot: IDocumentData = {
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: '=G10+G12+G13\r\n',
                textRuns: [
                    { st: 1, ed: 4, ts: { cl: { rgb: '#8f7cf6' }, fs: 11 } },
                ],
            },
            documentStyle: {},
        };
        const formulaBarSnapshot: IDocumentData = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: '=G10+G12+G13\r\n',
                textRuns: [
                    { st: 1, ed: 4, ts: { cl: { rgb: '#8f7cf6' }, fs: 11 } },
                ],
            },
            documentStyle: {},
        };

        checkAndSetRenderStyleConfig(controller, cellEditorSnapshot);
        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);

        expect(cellEditorSnapshot.documentStyle.renderConfig?.isRenderStyle).toBe(BooleanNumber.TRUE);
        expect(formulaBarSnapshot.documentStyle.renderConfig?.isRenderStyle).toBe(BooleanNumber.FALSE);
    });

    it('uses the resolved theme color for the formula bar default text', () => {
        const { controller } = createController({ themeTextColor: '#f7f9fc' });
        const formulaBarSnapshot: IDocumentData = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: 'A Schedule of Items\r\n',
            },
            documentStyle: {},
        };

        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);

        expect(formulaBarSnapshot.documentStyle.textStyle?.cl?.rgb).toBe('#f7f9fc');
    });

    it.each([false, true])('shows inherited spill formulas in gray until editing starts (visible=%s)', (isEditorVisible) => {
        const { controller } = createController({ isInArrayFormulaRange: true, isEditorVisible });
        const formulaBarSnapshot: IDocumentData = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: '=A1:B10\r\n',
                textRuns: [{ st: 0, ed: 7, ts: { cl: { rgb: '#d1d5db' } } }],
            },
            documentStyle: {},
        };

        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);

        expect(formulaBarSnapshot.documentStyle.renderConfig?.isRenderStyle).toBe(BooleanNumber.FALSE);
        expect(formulaBarSnapshot.documentStyle.textStyle?.cl?.rgb).toBe(isEditorVisible ? '#1b1c1f' : '#d1d5db');
    });

    it('renders formula reference styles in the formula bar when the formula bar is focused', () => {
        const { controller } = createController({ isFocusFxBar: true });
        const cellEditorSnapshot: IDocumentData = {
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: '=G10+G12+G13\r\n',
                textRuns: [
                    { st: 1, ed: 4, ts: { cl: { rgb: '#8f7cf6' }, fs: 11 } },
                ],
            },
            documentStyle: {},
        };
        const formulaBarSnapshot: IDocumentData = {
            id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            body: {
                dataStream: '=G10+G12+G13\r\n',
                textRuns: [
                    { st: 1, ed: 4, ts: { cl: { rgb: '#8f7cf6' }, fs: 11 } },
                ],
            },
            documentStyle: {},
        };

        checkAndSetRenderStyleConfig(controller, cellEditorSnapshot);
        checkAndSetRenderStyleConfig(controller, formulaBarSnapshot);

        expect(cellEditorSnapshot.documentStyle.renderConfig?.isRenderStyle).toBe(BooleanNumber.FALSE);
        expect(formulaBarSnapshot.documentStyle.renderConfig?.isRenderStyle).toBe(BooleanNumber.TRUE);
    });
});

describe('EditorDataSyncController cell refresh with real sheet providers', () => {
    function createRealController() {
        const { injector, workbook, render, manager, commands } = createChartRenderTestBed();
        const worksheet = workbook.getSheetBySheetId('grid')!;

        // The formula bar has its own unit and render stack; keep it out of this bed so the assertions
        // observe the cell editor snapshot only.
        injector.add([FormulaEditorController, { useValue: { autoScroll: vi.fn() } as never }]);
        injector.add([IFormulaEditorManagerService, { useValue: { getPosition: () => null } as never }]);
        injector.add([RangeProtectionRuleModel, { useValue: { getRangeRuleInitState: () => true } as never }]);
        injector.add([WorksheetProtectionRuleModel, { useValue: { getSheetRuleInitState: () => true } as never }]);
        injector.add([EditorDataSyncController]);

        commands.registerCommand(SetRangeValuesMutation);
        manager.setCurrent({ sheetId: 'grid' });
        worksheet.getCellMatrix().setValue(0, 0, { v: 'old' });

        const controller = injector.get(EditorDataSyncController);
        onTestFinished(() => controller.dispose());

        const bridge = injector.get(IEditorBridgeService);
        bridge.setEditCell({
            unitId: workbook.getUnitId(),
            sheetId: 'grid',
            scene: render.scene,
            engine: render.engine,
            primary: worksheet.getCellInfoInMergeData(0, 0),
        });
        // A closed editor is what #6715 (and the formula bar) relies on: the snapshot follows the model.
        bridge.changeVisible({
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            unitId: workbook.getUnitId(),
        });

        return {
            bridge,
            commands,
            worksheet,
            unitId: workbook.getUnitId(),
            editedDocumentModel: () => bridge.getEditCellState()?.documentLayoutObject.documentModel,
            editedBody: () => bridge.getEditCellState()?.documentLayoutObject.documentModel?.getBody()?.dataStream,
            writeCell: (value: string) => commands.syncExecuteCommand(SetRangeValuesMutation.id, {
                unitId: workbook.getUnitId(),
                subUnitId: 'grid',
                cellValue: { 0: { 0: { v: value } } },
            }),
        };
    }

    it('keeps a closed cell editor snapshot aligned with an external write to the edited cell (#6715)', () => {
        const { bridge, worksheet, writeCell, editedBody } = createRealController();
        expect(bridge.isVisible().visible).toBe(false);
        expect(editedBody()).toBe('old\r\n');

        writeCell('Hello World');

        expect(worksheet.getCellRaw(0, 0)?.v).toBe('Hello World');
        // #6715: opening the editor afterwards must show the written value, not the pre-write snapshot.
        expect(editedBody()).toBe('Hello World\r\n');
    });

    it('keeps the open draft and marks it for submission when an external write hits the edited cell', () => {
        const { bridge, worksheet, unitId, writeCell, editedBody, editedDocumentModel } = createRealController();
        const draftDocumentModel = editedDocumentModel();

        bridge.changeVisible({ visible: true, eventType: DeviceInputEventType.Keyboard, unitId });
        expect(bridge.getEditorDirty()).toBe(false);
        writeCell('remote value');

        expect(worksheet.getCellRaw(0, 0)?.v).toBe('remote value');
        // The draft is left alone, so the editor keeps showing it and submits it when editing ends.
        expect(editedDocumentModel()).toBe(draftDocumentModel);
        expect(editedBody()).toBe('old\r\n');
        expect(bridge.getEditorDirty()).toBe(true);
    });

    it('keeps the open draft clean when an external write only changes cell style', () => {
        const { bridge, unitId, commands } = createRealController();
        bridge.changeVisible({ visible: true, eventType: DeviceInputEventType.Keyboard, unitId });

        commands.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId,
            subUnitId: 'grid',
            cellValue: { 0: { 0: { s: { bg: { rgb: '#ff0000' } } } } },
        });

        expect(bridge.getEditorDirty()).toBe(false);
    });
});
