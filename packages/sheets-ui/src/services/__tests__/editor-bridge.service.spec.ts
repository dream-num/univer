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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, TextDirection } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { EditorBridgeService } from '../editor-bridge.service';

interface IServiceOptions {
    hasFocusEditor?: boolean;
    editorBodyText?: string;
    explicitCellTd?: TextDirection;
}

function createService(options?: IServiceOptions) {
    const unitDisposed$ = new Subject<any>();
    const workbook = {
        getUnitId: () => 'unit-1',
        getSheetBySheetId: vi.fn(() => ({
            getComposedCellStyle: vi.fn(() => (options?.explicitCellTd != null ? { td: options.explicitCellTd } : {})),
        })),
    };

    // The editor docs unit. Its body is mutable so tests can simulate typing
    // between calls to `syncEditorTextDirection`. The default `getBody` mock
    // places the paragraph break right after the body text so the per-
    // paragraph direction detector sees the actual content.
    const seedText = options?.editorBodyText ?? '';
    const editorDoc = {
        documentStyle: {
            renderConfig: {
                textDirection: undefined as TextDirection | undefined,
            },
        },
        getBody: vi.fn(() => ({
            dataStream: `${seedText}\r\n`,
            paragraphs: [{ startIndex: seedText.length, paragraphStyle: {} }],
        })),
    };

    const mocks = {
        unitDisposed$,
        editorDoc,
        sheetInterceptorService: {
            writeCellInterceptor: {
                fetchThroughInterceptors: vi.fn(() => (cell: unknown) => cell),
            },
        },
        sheetSkeletonService: {
            getSkeleton: vi.fn(() => null),
        },
        renderManagerService: {
            getRenderUnitById: vi.fn(() => null),
        },
        themeService: {
            getColorFromTheme: vi.fn(() => '#d0d0d0'),
        },
        univerInstanceService: {
            getTypeOfUnitDisposed$: vi.fn(() => unitDisposed$.asObservable()),
            getCurrentUnitOfType: vi.fn(() => workbook),
            getUnit: vi.fn((unitId: string) => {
                if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) return editorDoc;
                return workbook;
            }),
        },
        editorService: {
            getFocusEditor: vi.fn(() => (options?.hasFocusEditor ? { id: 'existing' } : null)),
            focus: vi.fn(),
        },
        contextService: {
            setContextValue: vi.fn(),
        },
    };

    const service = new EditorBridgeService(
        mocks.sheetInterceptorService as any,
        mocks.sheetSkeletonService as any,
        mocks.renderManagerService as any,
        mocks.themeService as any,
        mocks.univerInstanceService as any,
        mocks.editorService as any,
        mocks.contextService as any
    );

    return { service, mocks };
}

function createLatestState() {
    return {
        unitId: 'unit-1',
        sheetId: 'sheet-1',
        row: 1,
        column: 2,
        documentLayoutObject: { id: 'doc-layout' },
        editorUnitId: 'doc-editor',
        position: {
            startX: 10,
            startY: 20,
            endX: 30,
            endY: 40,
        },
        canvasOffset: {
            left: 0,
            top: 0,
        },
        scaleX: 1,
        scaleY: 1,
    };
}

function createEditCellParam() {
    return {
        scene: {},
        engine: {},
        unitId: 'unit-1',
        sheetId: 'sheet-1',
        primary: {
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 2,
            actualRow: 1,
            actualColumn: 2,
            isMerged: false,
            isMergedMainCell: true,
        },
    } as any;
}

describe('EditorBridgeService', () => {
    it('syncs edit state/layout from latest state and reacts to disposed unit', () => {
        const { service, mocks } = createService();
        const latest = createLatestState();
        const currentEditCombined: any[] = [];
        service.currentEditCell$.subscribe((value) => currentEditCombined.push(value));

        const getLatestSpy = vi.spyOn(service, 'getLatestEditCellState');
        getLatestSpy.mockReturnValue(latest as any);
        service.setEditCell(createEditCellParam());

        expect(mocks.editorService.focus).toHaveBeenCalled();
        expect(mocks.contextService.setContextValue).toHaveBeenCalledTimes(2);
        expect(service.getEditCellState()).toEqual(latest);
        expect(service.getEditCellLayout()).toEqual({
            position: latest.position,
            canvasOffset: latest.canvasOffset,
            scaleX: 1,
            scaleY: 1,
        });
        expect(service.getEditLocation()).toEqual(
            expect.objectContaining({
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                row: 1,
                column: 2,
            })
        );
        expect(currentEditCombined.at(-1)).toEqual(expect.objectContaining({ row: 1, column: 2 }));

        service.updateEditLocation(8, 9);
        expect(service.getEditLocation()).toEqual(expect.objectContaining({ row: 8, column: 9 }));

        getLatestSpy.mockReturnValue(null as any);
        service.refreshEditCellState();
        expect(service.getEditCellState()).toBeNull();

        getLatestSpy.mockReturnValue(latest as any);
        service.refreshEditCellState();
        expect(service.getEditCellState()).toEqual(latest);

        mocks.unitDisposed$.next({
            getUnitId: () => 'unit-1',
        });
        expect(service.getEditCellState()).toBeNull();
        expect(service.getEditCellLayout()).toBeNull();
    });

    it('manages visible/dirty/force-keep states and null-latest branches', () => {
        const { service, mocks } = createService({ hasFocusEditor: true });
        const visibleValues: any[] = [];
        const afterVisibleValues: any[] = [];
        const forceValues: boolean[] = [];
        service.visible$.subscribe((value) => visibleValues.push(value));
        service.afterVisible$.subscribe((value) => afterVisibleValues.push(value));
        service.forceKeepVisible$.subscribe((value) => forceValues.push(value));

        expect(service.getCurrentEditorId()).toBe(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(service.getEditCellState()).toBeNull();
        expect(service.getEditCellLayout()).toBeNull();
        expect(service.getEditLocation()).toBeNull();
        expect(service.getEditorDirty()).toBe(false);

        service.changeEditorDirty(true);
        expect(service.getEditorDirty()).toBe(true);

        service.changeVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
        });
        expect(service.isVisible()).toEqual({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
        });
        expect(service.getEditorDirty()).toBe(false);
        expect(visibleValues.at(-1)).toEqual(expect.objectContaining({ visible: true }));
        expect(afterVisibleValues.at(-1)).toEqual(expect.objectContaining({ visible: true }));

        service.enableForceKeepVisible();
        service.disableForceKeepVisible();
        expect(service.isForceKeepVisible()).toBe(false);
        expect(forceValues.slice(-2)).toEqual([true, false]);

        const getLatestSpy = vi.spyOn(service, 'getLatestEditCellState').mockReturnValue(undefined);
        service.setEditCell(createEditCellParam());
        expect(service.getEditCellState()).toBeNull();

        service.refreshEditCellState();
        service.refreshEditCellPosition();
        expect(getLatestSpy).toHaveBeenCalled();
        expect(mocks.editorService.focus).not.toHaveBeenCalled();
    });

    describe('syncEditorTextDirection', () => {
        function seedEditingState(service: EditorBridgeService) {
            const latest = createLatestState();
            vi.spyOn(service, 'getLatestEditCellState').mockReturnValue(latest as any);
            service.setEditCell(createEditCellParam());
        }

        it('flips effective direction to RTL when the live body becomes Arabic', () => {
            const { service, mocks } = createService({ editorBodyText: '' });
            seedEditingState(service);
            expect(service.getEffectiveTextDirection()).toBe(TextDirection.LEFT_TO_RIGHT);

            // Simulate the user typing Arabic into a previously empty cell.
            const arabic = 'كتاب';
            mocks.editorDoc.getBody.mockReturnValue({
                dataStream: `${arabic}\r\n`,
                paragraphs: [{ startIndex: arabic.length, paragraphStyle: {} }],
            });
            service.syncEditorTextDirection();

            expect(service.getEffectiveTextDirection()).toBe(TextDirection.RIGHT_TO_LEFT);
            // Implicit (auto-detected) direction is written per-paragraph,
            // not to the document-level renderConfig, so multi-line cells
            // can mix LTR and RTL rows. RenderConfig only carries cell-level
            // explicit `style.td`.
            const liveBody = mocks.editorDoc.getBody.mock.results.at(-1)?.value;
            expect(liveBody.paragraphs[0].paragraphStyle.direction)
                .toBe(TextDirection.RIGHT_TO_LEFT);
        });

        it('flips back to LTR after the user deletes the Arabic and types Latin', () => {
            const { service, mocks } = createService({ editorBodyText: 'كتاب' });
            seedEditingState(service);
            service.syncEditorTextDirection();
            expect(service.getEffectiveTextDirection()).toBe(TextDirection.RIGHT_TO_LEFT);

            // Backspace, then type "Hello".
            mocks.editorDoc.getBody.mockReturnValue({
                dataStream: 'Hello\r\n',
                paragraphs: [{ startIndex: 5, paragraphStyle: { direction: TextDirection.RIGHT_TO_LEFT } }],
            });
            service.syncEditorTextDirection();

            expect(service.getEffectiveTextDirection()).toBe(TextDirection.LEFT_TO_RIGHT);
            const liveBody = mocks.editorDoc.getBody.mock.results.at(-1)?.value;
            expect(liveBody.paragraphs[0].paragraphStyle.direction)
                .toBe(TextDirection.LEFT_TO_RIGHT);
        });

        it('honours explicit cell-level style.td regardless of typed content', () => {
            // Cell has `td=RTL` set explicitly; even if the user types only
            // Latin, the direction must stay RTL because the author chose it.
            const { service, mocks } = createService({
                editorBodyText: 'Hello',
                explicitCellTd: TextDirection.RIGHT_TO_LEFT,
            });
            seedEditingState(service);
            service.syncEditorTextDirection();

            expect(service.getEffectiveTextDirection()).toBe(TextDirection.RIGHT_TO_LEFT);
            // Explicit `style.td` is propagated to renderConfig so the
            // document-level `_horizontalHandler` fallback also picks it up.
            expect(mocks.editorDoc.documentStyle.renderConfig.textDirection)
                .toBe(TextDirection.RIGHT_TO_LEFT);
        });

        it('emits a single value per actual direction change', () => {
            const { service, mocks } = createService({ editorBodyText: '' });
            seedEditingState(service);

            const emissions: TextDirection[] = [];
            service.effectiveTextDirection$.subscribe((d) => emissions.push(d));

            service.syncEditorTextDirection(); // still empty → LTR
            service.syncEditorTextDirection(); // still empty → LTR (no emit)

            const arabic = 'مرحبا';
            mocks.editorDoc.getBody.mockReturnValue({
                dataStream: `${arabic}\r\n`,
                paragraphs: [{ startIndex: arabic.length, paragraphStyle: {} }],
            });
            service.syncEditorTextDirection(); // flip → RTL

            // BehaviorSubject replays the seed value (LTR) on subscription,
            // then we expect exactly one additional RTL emission.
            const ltrCount = emissions.filter((d) => d === TextDirection.LEFT_TO_RIGHT).length;
            const rtlCount = emissions.filter((d) => d === TextDirection.RIGHT_TO_LEFT).length;
            expect(ltrCount).toBeGreaterThanOrEqual(1);
            expect(rtlCount).toBe(1);
        });

        it('assigns each paragraph an independent direction based on its own first-strong character', () => {
            // Simulate a list cell containing three bullets:
            //   * Arabic
            //   * Arabic
            //   * Latin
            // Each line must flip individually so the canvas /
            // `horizontalAlignHandler` aligns each row to its own side.
            const { service, mocks } = createService({ editorBodyText: '' });
            seedEditingState(service);

            const lines = ['كتاب', 'مرحبا', 'Hello'];
            const stream = `${lines.join('\r')}\r\n`;
            // Build paragraph startIndex list pointing at each `\r`.
            const paragraphs: any[] = [];
            let cursor = 0;
            for (const line of lines) {
                cursor += line.length;
                paragraphs.push({ startIndex: cursor, paragraphStyle: {} });
                cursor += 1; // skip the `\r`
            }

            mocks.editorDoc.getBody.mockReturnValue({
                dataStream: stream,
                paragraphs,
            });
            service.syncEditorTextDirection();

            const liveBody = mocks.editorDoc.getBody.mock.results.at(-1)?.value;
            expect(liveBody.paragraphs[0].paragraphStyle.direction)
                .toBe(TextDirection.RIGHT_TO_LEFT);
            expect(liveBody.paragraphs[1].paragraphStyle.direction)
                .toBe(TextDirection.RIGHT_TO_LEFT);
            expect(liveBody.paragraphs[2].paragraphStyle.direction)
                .toBe(TextDirection.LEFT_TO_RIGHT);
        });

        it('makes an empty paragraph created by Enter inherit the previous direction', () => {
            // Simulate the user pressing Enter at the end of an Arabic
            // paragraph: the live body now has two paragraphs, where the
            // second one is empty (no strong char yet) but should still
            // be treated as RTL so the caret stays on the visual right
            // and the next keystroke continues the Arabic flow.
            const { service, mocks } = createService({ editorBodyText: '' });
            seedEditingState(service);

            // Build dataStream = "كتاب\r\r\n":
            //   - paragraph 0: "كتاب" (RTL)
            //   - paragraph 1: empty (just inserted by Enter)
            //   - trailing \r\n is the sentinel terminator
            const arabic = 'كتاب';
            const stream = `${arabic}\r\r\n`;
            const paragraphs = [
                { startIndex: arabic.length, paragraphStyle: {} },
                { startIndex: arabic.length + 1, paragraphStyle: {} },
            ];

            mocks.editorDoc.getBody.mockReturnValue({
                dataStream: stream,
                paragraphs,
            });
            service.syncEditorTextDirection();

            const liveBody = mocks.editorDoc.getBody.mock.results.at(-1)?.value;
            expect(liveBody.paragraphs[0].paragraphStyle.direction)
                .toBe(TextDirection.RIGHT_TO_LEFT);
            expect(liveBody.paragraphs[1].paragraphStyle.direction)
                .toBe(TextDirection.RIGHT_TO_LEFT);
            // Outer baseline tracks the first paragraph for the cell.
            expect(service.getEffectiveTextDirection()).toBe(TextDirection.RIGHT_TO_LEFT);
        });

        it('forces every paragraph to the explicit cell-level direction', () => {
            // When the cell author explicitly set `style.td=RTL`, even a
            // paragraph whose own content is Latin must inherit RTL — the
            // author's choice trumps content auto-detection.
            const { service, mocks } = createService({
                editorBodyText: '',
                explicitCellTd: TextDirection.RIGHT_TO_LEFT,
            });
            seedEditingState(service);

            const lines = ['Hello', 'World'];
            const stream = `${lines.join('\r')}\r\n`;
            const paragraphs: any[] = [];
            let cursor = 0;
            for (const line of lines) {
                cursor += line.length;
                paragraphs.push({ startIndex: cursor, paragraphStyle: {} });
                cursor += 1;
            }

            mocks.editorDoc.getBody.mockReturnValue({
                dataStream: stream,
                paragraphs,
            });
            service.syncEditorTextDirection();

            const liveBody = mocks.editorDoc.getBody.mock.results.at(-1)?.value;
            expect(liveBody.paragraphs[0].paragraphStyle.direction)
                .toBe(TextDirection.RIGHT_TO_LEFT);
            expect(liveBody.paragraphs[1].paragraphStyle.direction)
                .toBe(TextDirection.RIGHT_TO_LEFT);
        });
    });
});
