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

import type { DocumentDataModel, ICommandInfo, IDocumentData } from '@univerjs/core';
import {
    BooleanNumber,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    Injector,
    IUniverInstanceService,
    ThemeService,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    MoveRangeMutation,
    RangeProtectionRuleModel,
    SetRangeValuesMutation,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { IFormulaEditorManagerService } from '../../../services/editor/formula-editor-manager.service';
import { EditorDataSyncController } from '../data-sync.controller';
import { FormulaEditorController } from '../formula-editor.controller';

interface ITestableEditorDataSyncController {
    _checkAndSetRenderStyleConfig: (documentDataModel: Pick<DocumentDataModel, 'getSnapshot'>) => void;
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
        formulaBarPosition?: { width: number; height: number } | null;
    } = {}) {
        const commandService = new TestCommandService();
        const editorBridgeService = {
            currentEditCellState$: new BehaviorSubject(null),
            getEditLocation: vi.fn(() => ({
                row: 1,
                column: 2,
            })),
            refreshEditCellState: vi.fn(),
            isForceKeepVisible: vi.fn(() => false),
        };
        const contextService = {
            getContextValue: vi.fn((key: string) =>
                key === FOCUSING_FX_BAR_EDITOR ? options.isFocusFxBar ?? false : false),
            subscribeContextValue$: vi.fn(() => EMPTY),
        };
        const currentTheme$ = new BehaviorSubject({});

        const injector = new Injector();
        injector.add([IUniverInstanceService, { useValue: {} as never }]);
        injector.add([IRenderManagerService, { useValue: {} as never }]);
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
                    : '#000000'),
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

    it('refreshes the current edit cell when set-values updates the edited cell', () => {
        const { commandService, editorBridgeService } = createController();

        commandService.emit({
            id: SetRangeValuesMutation.id,
            params: {
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
