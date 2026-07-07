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
} from '@univerjs/core';
import { MoveRangeMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorDataSyncController } from '../data-sync.controller';

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

    function createController(options: { isFocusFxBar?: boolean } = {}) {
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

        const controller = new EditorDataSyncController(
            {} as never,
            {} as never,
            editorBridgeService as never,
            commandService as never,
            { getRangeRuleInitState: () => true } as never,
            { getSheetRuleInitState: () => true } as never,
            { autoScroll: vi.fn() } as never,
            { getPosition: () => null } as never,
            contextService as never
        );

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
