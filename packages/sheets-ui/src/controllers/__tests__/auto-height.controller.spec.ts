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

import type { IUniverInstanceService, Workbook } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type { SheetInterceptorService } from '@univerjs/sheets';
import {
    CancelMarkDirtyRowAutoHeightOperation,
    MarkDirtyRowAutoHeightOperation,
    SetWorksheetRowAutoHeightMutation,
} from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { AutoHeightController } from '../auto-height.controller';

type AnyFn = (...args: unknown[]) => unknown;

describe('AutoHeightController', () => {
    it('intercepts auto height and appends lazy mark-dirty redo/undo', () => {
        const worksheet = {
            getSheetId: () => 's-1',
        } as unknown;

        const workbook = {
            getUnitId: () => 'u-1',
            getActiveSheet: () => worksheet,
            getSheetBySheetId: (sheetId: string) => (sheetId === 's-1' ? worksheet : null),
        } as unknown as Workbook;

        const univerInstanceService = {
            getCurrentUnitOfType: () => workbook,
            getUnit: () => workbook,
        } as unknown as IUniverInstanceService;

        const renderManagerService = {
            getRenderById: () => ({
                with: () => ({
                    ensureSkeleton: () => null,
                }),
            }),
        } as unknown as RenderManagerService;

        let getMutations: AnyFn | null = null;
        const sheetInterceptorService = {
            interceptAutoHeight: (config: { getMutations: AnyFn }) => {
                getMutations = config.getMutations;
                return { dispose: () => { } };
            },
        } as unknown as SheetInterceptorService;

        const controller = new AutoHeightController(
            renderManagerService,
            sheetInterceptorService,
            univerInstanceService
        );

        expect(controller).toBeTruthy();
        expect(getMutations).not.toBeNull();

        const result = getMutations!({
            unitId: 'u-1',
            subUnitId: 's-1',
            ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }],
            lazyAutoHeightRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }],
        }) as { redos: unknown[]; undos: unknown[] };

        const redo = result.redos[0] as { params: { id: string } };
        const undo = result.undos[0] as { params: { id: string } };
        expect(redo.params.id).toEqual(expect.any(String));
        expect(undo.params.id).toBe(redo.params.id);

        // If our inline execution happened, we should have redo/undo mutations appended.
        expect(result.redos).toEqual([
            {
                id: MarkDirtyRowAutoHeightOperation.id,
                params: {
                    unitId: 'u-1',
                    subUnitId: 's-1',
                    ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }],
                    id: redo.params.id,
                },
                options: {
                    onlyLocal: true,
                },
            },
        ]);

        expect(result.undos).toEqual([
            {
                id: CancelMarkDirtyRowAutoHeightOperation.id,
                params: {
                    unitId: 'u-1',
                    subUnitId: 's-1',
                    id: redo.params.id,
                },
                options: {
                    onlyLocal: true,
                },
            },
        ]);
    });

    it('builds row auto-height undo/redo only for rows whose calculated height changed', () => {
        const worksheet = {
            getSheetId: () => 's-1',
            getRowHeight: (row: number) => row === 1 ? 20 : 30,
            getRowManager: () => ({
                getRow: (row: number) => row === 1 ? { ah: 20 } : { ah: 30 },
            }),
            getConfig: () => ({ defaultRowHeight: 18 }),
        } as unknown;

        const workbook = {
            getUnitId: () => 'u-1',
            getActiveSheet: () => worksheet,
            getSheetBySheetId: (sheetId: string) => (sheetId === 's-1' ? worksheet : null),
        } as unknown as Workbook;

        const controller = new AutoHeightController(
            {
                getRenderById: () => ({
                    with: () => ({
                        ensureSkeleton: () => ({
                            calculateAutoHeightInRange: () => [
                                { row: 1, autoHeight: 24 },
                                { row: 2, autoHeight: 30 },
                                { row: 3, autoHeight: 0 },
                            ],
                        }),
                    }),
                }),
            } as unknown as RenderManagerService,
            { interceptAutoHeight: () => ({ dispose: () => { } }) } as unknown as SheetInterceptorService,
            {
                getCurrentUnitOfType: () => workbook,
                getUnit: () => workbook,
            } as unknown as IUniverInstanceService
        );

        expect(controller.getUndoRedoParamsOfAutoHeight([
            { startRow: 1, endRow: 3, startColumn: 0, endColumn: 0 },
        ])).toEqual({
            redos: [{
                id: SetWorksheetRowAutoHeightMutation.id,
                params: {
                    unitId: 'u-1',
                    subUnitId: 's-1',
                    rowsAutoHeightInfo: [{ row: 1, autoHeight: 24 }],
                },
            }],
            undos: [{
                id: SetWorksheetRowAutoHeightMutation.id,
                params: {
                    unitId: 'u-1',
                    subUnitId: 's-1',
                    rowsAutoHeightInfo: [{ row: 1, autoHeight: 20 }],
                },
            }],
        });
    });
});
