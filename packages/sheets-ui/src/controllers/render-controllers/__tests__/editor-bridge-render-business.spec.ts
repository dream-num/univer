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

// @vitest-environment jsdom

import type { EmbedRuntimeFocusCoordinator } from '../../../services/sheet-embed-integration.service';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, FOCUSING_FX_BAR_EDITOR, FOCUSING_SHEET } from '@univerjs/core';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE } from '../../../services/sheet-embed-integration.service';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { ClearSelectionFormatCommand, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SetZoomRatioCommand } from '../../../commands/commands/set-zoom-ratio.command';
import { SetActivateCellEditOperation } from '../../../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { EditorBridgeRenderController } from '../editor-bridge.render-controller';

function createEventSubject() {
    const handlers = new Set<(evt: any) => void>();

    return {
        subscribeEvent: vi.fn((arg: any) => {
            const handler = typeof arg === 'function' ? arg : arg.next;
            handlers.add(handler);
            return { dispose: vi.fn(() => handlers.delete(handler)) };
        }),
        emit: (evt: any) => handlers.forEach((handler) => handler(evt)),
    };
}

function createCommandService() {
    const afterHandlers = new Set<(command: any, options?: any) => void>();
    const beforeHandlers = new Set<(command: any, options?: any) => void>();

    return {
        executeCommand: vi.fn(),
        syncExecuteCommand: vi.fn(),
        onCommandExecuted: vi.fn((handler: (command: any, options?: any) => void) => {
            afterHandlers.add(handler);
            return { dispose: vi.fn(() => afterHandlers.delete(handler)) };
        }),
        beforeCommandExecuted: vi.fn((handler: (command: any, options?: any) => void) => {
            beforeHandlers.add(handler);
            return { dispose: vi.fn(() => beforeHandlers.delete(handler)) };
        }),
        emitAfter: (command: any, options?: any) => afterHandlers.forEach((handler) => handler(command, options)),
        emitBefore: (command: any, options?: any) => beforeHandlers.forEach((handler) => handler(command, options)),
    };
}

function createController(options?: {
    currentEditLocation?: { unitId: string; sheetId: string; row: number; column: number };
    currentEditCellState?: { documentLayoutObject?: { documentModel?: { getSnapshot?: () => { body?: { dataStream?: string } } } } };
    editorVisible?: boolean;
    forceKeepVisible?: boolean;
    focusedUnitId?: string;
    isEmbedRuntimeEvent?: boolean;
    isEmbedActiveSession?: boolean;
    focusingSheet?: boolean;
    isEmbedRuntimeEventImpl?: (unitId: string | undefined, target?: EventTarget | null, event?: Event) => boolean;
}) {
    const workbook$ = new Subject<any>();
    const selectionMoveEnd$ = new Subject<any>();
    const selectionMoveStart$ = new Subject<any>();
    const selectionSet$ = new Subject<any>();
    const inputBefore$ = new Subject<any>();
    const spreadsheet = {
        onDblclick$: createEventSubject(),
        onPointerDown$: createEventSubject(),
    };
    const spreadsheetRowHeader = { onPointerDown$: createEventSubject() };
    const spreadsheetColumnHeader = { onPointerDown$: createEventSubject() };
    const spreadsheetLeftTopPlaceholder = { onPointerDown$: createEventSubject() };
    const scene = {};
    const engine = {};
    const worksheet = { getSheetId: vi.fn(() => 'sheet-1') };
    const workbook = {
        getUnitId: vi.fn(() => 'unit-1'),
        getActiveSheet: vi.fn(() => worksheet),
        getCurrentUnitOfType: vi.fn(() => null as any),
    };
    workbook.getCurrentUnitOfType.mockReturnValue(workbook as any);
    const commandService = createCommandService();
    const contextValues = new Map<string, unknown>([
        [FOCUSING_SHEET, options?.focusingSheet ?? true],
        [FOCUSING_FX_BAR_EDITOR, false],
    ]);
    const focusingSheet$ = new Subject<boolean>();
    const context = {
        unitId: 'unit-1',
        unit: workbook,
        isMainScene: true,
        scene,
        engine,
        mainComponent: spreadsheet,
        components: new Map([
            [SHEET_VIEW_KEY.ROW, spreadsheetRowHeader],
            [SHEET_VIEW_KEY.COLUMN, spreadsheetColumnHeader],
            [SHEET_VIEW_KEY.LEFT_TOP, spreadsheetLeftTopPlaceholder],
        ]),
    };
    const docSelectionRenderService = { onInputBefore$: inputBefore$ };
    const renderManagerService = {
        created$: new Subject<any>(),
        getRenderById: vi.fn((unitId: string) => unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY
            ? {
                unitId,
                with: vi.fn((token) => token === DocSelectionRenderService ? docSelectionRenderService : null),
            }
            : null),
    };
    const editorBridgeService = {
        getEditCellState: vi.fn(() => options?.currentEditCellState ?? null),
        getEditLocation: vi.fn(() => options?.currentEditLocation ?? null),
        isVisible: vi.fn(() => ({ visible: options?.editorVisible ?? false })),
        isForceKeepVisible: vi.fn(() => options?.forceKeepVisible ?? false),
        refreshEditCellState: vi.fn(),
    };
    const controller = new EditorBridgeRenderController(
        context as any,
        {
            getCurrentTypeOfUnit$: vi.fn(() => workbook$),
            getFocusedUnit: vi.fn(() => ({
                getUnitId: () => options?.focusedUnitId ?? 'unit-1',
            })),
            getUnit: vi.fn(() => ({
                getBody: () => ({ dataStream: '=\r\n' }),
            })),
        } as any,
        commandService as any,
        editorBridgeService as any,
        {
            selectionMoveEnd$,
            selectionMoveStart$,
            selectionSet$,
            getWorkbookSelections: vi.fn(() => ({
                getCurrentSelections: vi.fn(() => [{
                    primary: {
                        actualRow: 3,
                        actualColumn: 4,
                        startRow: 3,
                        startColumn: 4,
                        endRow: 3,
                        endColumn: 4,
                    },
                }]),
            })),
        } as any,
        {
            getContextValue: vi.fn((key: string) => contextValues.get(key)),
            setContextValue: vi.fn((key: string, value: unknown) => contextValues.set(key, value)),
            subscribeContextValue$: vi.fn((key: string) => key === FOCUSING_SHEET ? focusingSheet$ : new Subject<unknown>()),
        } as any,
        renderManagerService as any,
        {
            getSkeletonParam: vi.fn(() => ({
                skeleton: {
                    getCellWithCoordByIndex: vi.fn(() => ({
                        actualRow: 1,
                        actualColumn: 2,
                        isMerged: true,
                        isMergedMainCell: true,
                        mergeInfo: {
                            startRow: 1,
                            startColumn: 2,
                            endRow: 4,
                            endColumn: 5,
                        },
                    })),
                },
            })),
        } as any,
        {
            isChildUnitRuntimeEvent: vi.fn((unitId, target, event) => options?.isEmbedRuntimeEventImpl?.(unitId, target, event) ?? options?.isEmbedRuntimeEvent ?? false),
            isChildUnitInActiveSession: vi.fn(() => options?.isEmbedActiveSession ?? false),
        } as unknown as EmbedRuntimeFocusCoordinator
    );
    workbook$.next(workbook);

    return {
        commandService,
        controller,
        editorBridgeService,
        inputBefore$,
        selectionMoveEnd$,
        selectionSet$,
        spreadsheet,
        spreadsheetColumnHeader,
        spreadsheetLeftTopPlaceholder,
        spreadsheetRowHeader,
        workbook,
        workbook$,
    };
}

describe('EditorBridgeRenderController business flows', () => {
    it('moves the sheet editor to the latest selected cell and respects merged-cell coordinates', () => {
        const { commandService, controller, selectionMoveEnd$ } = createController();

        selectionMoveEnd$.next([{
            primary: {
                actualRow: 3,
                actualColumn: 4,
                startRow: 3,
                startColumn: 4,
                endRow: 3,
                endColumn: 4,
            },
        }]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(SetActivateCellEditOperation.id, {
            scene: expect.any(Object),
            engine: expect.any(Object),
            primary: {
                actualRow: 1,
                actualColumn: 2,
                isMerged: true,
                startRow: 1,
                startColumn: 2,
                endRow: 4,
                endColumn: 5,
                isMergedMainCell: true,
            },
            unitId: 'unit-1',
            sheetId: 'sheet-1',
        });

        controller.refreshEditorPosition();
        expect(commandService.executeCommand).toHaveBeenCalledTimes(2);

        controller.dispose();
    });

    it('does not reactivate the same edit cell for repeated selection sync events', () => {
        const { commandService, controller, selectionMoveEnd$, selectionSet$ } = createController({
            currentEditLocation: {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                row: 1,
                column: 2,
            },
        });

        const selection = [{
            primary: {
                actualRow: 3,
                actualColumn: 4,
                startRow: 3,
                startColumn: 4,
                endRow: 3,
                endColumn: 4,
            },
        }];

        selectionSet$.next(selection);
        selectionMoveEnd$.next(selection);

        expect(commandService.executeCommand).not.toHaveBeenCalledWith(SetActivateCellEditOperation.id, expect.anything());

        controller.dispose();
    });

    it('opens sheet editing from double click and keyboard input, then refreshes a hidden editor after formatting commands', () => {
        const { commandService, controller, editorBridgeService, inputBefore$, spreadsheet } = createController();

        spreadsheet.onDblclick$.emit({ button: 2 });
        expect(commandService.executeCommand).not.toHaveBeenCalledWith(SetCellEditVisibleOperation.id, expect.anything());

        spreadsheet.onDblclick$.emit({ button: 0 });
        expect(commandService.executeCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'unit-1',
        });

        inputBefore$.next({ event: { data: 'A', which: 65 } });
        inputBefore$.next({ event: { inputType: 'deleteContentBackward', which: 8 } });
        expect(commandService.syncExecuteCommand).toHaveBeenCalledTimes(1);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: 65,
            initialValue: 'A',
            unitId: 'unit-1',
        });

        commandService.emitAfter({ id: ClearSelectionFormatCommand.id });
        commandService.emitAfter({ id: SetZoomRatioCommand.id });
        expect(editorBridgeService.refreshEditCellState).toHaveBeenCalledTimes(2);

        controller.dispose();
    });

    it('opens sheet editing from keyboard input while the sheet is an active embed child session', () => {
        const { commandService, controller, inputBefore$ } = createController({
            focusingSheet: false,
            focusedUnitId: 'host-unit',
            isEmbedActiveSession: true,
        });

        inputBefore$.next({ event: { data: '=', which: 187 } });

        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: 187,
            initialValue: '=',
            unitId: 'unit-1',
        });

        controller.dispose();
    });

    it('does not stack keyboard input listeners when the current workbook emits repeatedly', () => {
        const { commandService, controller, inputBefore$, workbook, workbook$ } = createController();

        workbook$.next(workbook);
        workbook$.next(workbook);
        inputBefore$.next({ event: { data: '=', which: 187 } });

        expect(commandService.syncExecuteCommand).toHaveBeenCalledTimes(1);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: 187,
            initialValue: '=',
            unitId: 'unit-1',
        });

        controller.dispose();
    });

    it('hides a visible editor from sheet pointer actions but keeps it while formula range input is active', () => {
        const keepVisible = createController({ editorVisible: true, forceKeepVisible: true });
        keepVisible.spreadsheet.onPointerDown$.emit({});
        expect(keepVisible.commandService.syncExecuteCommand).not.toHaveBeenCalled();
        keepVisible.controller.dispose();

        const normal = createController({ editorVisible: true });
        normal.spreadsheetColumnHeader.onPointerDown$.emit({});
        expect(normal.commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: 'unit-1',
        });

        normal.commandService.syncExecuteCommand.mockClear();
        normal.commandService.emitBefore({ id: SetWorksheetActiveOperation.id });
        expect(normal.commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: 'unit-1',
        });

        normal.commandService.syncExecuteCommand.mockClear();
        normal.commandService.emitBefore({ id: SetWorksheetActiveOperation.id }, { fromCollab: true });
        expect(normal.commandService.syncExecuteCommand).not.toHaveBeenCalled();

        normal.controller.dispose();
    });

    it('keeps a visible embedded cell editor when pointer down originates inside the same embed owner', () => {
        const normal = createController({ editorVisible: true });
        const embedRoot = document.createElement('div');
        const editorTarget = document.createElement('div');
        embedRoot.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        editorTarget.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        editorTarget.setAttribute('data-u-comp', 'editor');
        document.body.append(embedRoot, editorTarget);

        normal.spreadsheet.onPointerDown$.emit({ target: editorTarget });
        expect(normal.commandService.syncExecuteCommand).not.toHaveBeenCalled();

        editorTarget.getBoundingClientRect = () => ({
            x: 100,
            y: 200,
            left: 100,
            top: 200,
            right: 180,
            bottom: 224,
            width: 80,
            height: 24,
            toJSON: () => {},
        });
        normal.spreadsheet.onPointerDown$.emit({ clientX: 120, clientY: 210 });
        expect(normal.commandService.syncExecuteCommand).not.toHaveBeenCalled();

        normal.spreadsheet.onPointerDown$.emit({ target: document.createElement('div') });
        expect(normal.commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: 'unit-1',
        });

        normal.controller.dispose();
        embedRoot.remove();
        editorTarget.remove();
    });

    it('hides a visible embedded cell editor when a regular edit points at the child runtime canvas', () => {
        const normal = createController({ editorVisible: true, isEmbedRuntimeEvent: true });
        const runtimeCanvas = document.createElement('canvas');

        normal.spreadsheet.onPointerDown$.emit({ target: runtimeCanvas });

        expect(normal.commandService.syncExecuteCommand).toHaveBeenCalledWith(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: 'unit-1',
        });

        normal.controller.dispose();
    });

    it('keeps a visible embedded cell editor when formula range selection points at the child runtime canvas', () => {
        const normal = createController({
            editorVisible: true,
            isEmbedRuntimeEvent: true,
            isEmbedActiveSession: true,
            currentEditCellState: {
                documentLayoutObject: {
                    documentModel: {
                        getSnapshot: () => ({ body: { dataStream: '=SUM(' } }),
                    },
                },
            },
        });
        const runtimeCanvas = document.createElement('canvas');

        normal.spreadsheet.onPointerDown$.emit({ target: runtimeCanvas });

        expect(normal.commandService.syncExecuteCommand).not.toHaveBeenCalled();

        normal.controller.dispose();
    });

    it('passes engine pointer coordinates to embed runtime detection for formula range selection', () => {
        const runtimeCanvas = document.createElement('canvas');
        const normal = createController({
            editorVisible: true,
            isEmbedActiveSession: true,
            currentEditCellState: {
                documentLayoutObject: {
                    documentModel: {
                        getSnapshot: () => ({ body: { dataStream: '=SUM(' } }),
                    },
                },
            },
            isEmbedRuntimeEventImpl: (_unitId, _target, event) => (
                (event as unknown as { clientX?: number; clientY?: number })?.clientX === 120 &&
                (event as unknown as { clientX?: number; clientY?: number })?.clientY === 210
            ),
        });

        normal.spreadsheet.onPointerDown$.emit({ target: runtimeCanvas, clientX: 120, clientY: 210 });

        expect(normal.commandService.syncExecuteCommand).not.toHaveBeenCalled();

        normal.controller.dispose();
    });

    it('keeps an embedded formula editor visible during worksheet activation without a pointer event', () => {
        const normal = createController({
            editorVisible: true,
            isEmbedActiveSession: true,
            currentEditCellState: {
                documentLayoutObject: {
                    documentModel: {
                        getSnapshot: () => ({ body: { dataStream: '=A1\r\n' } }),
                    },
                },
            },
        });

        normal.commandService.emitBefore({ id: SetWorksheetActiveOperation.id });

        expect(normal.commandService.syncExecuteCommand).not.toHaveBeenCalled();

        normal.controller.dispose();
    });
});
