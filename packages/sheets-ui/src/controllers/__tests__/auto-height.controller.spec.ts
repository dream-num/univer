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

import type { IConfigService, IUniverInstanceService, Workbook } from '@univerjs/core';
import type { RenderManagerService } from '@univerjs/engine-render';
import type { SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import {
    CancelMarkDirtyRowAutoHeightMutation,
    MarkDirtyRowAutoHeightMutation,
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
            getCurrentUnitForType: () => workbook,
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
            { } as unknown as SheetsSelectionsService,
            univerInstanceService,
            {} as IConfigService
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
                id: MarkDirtyRowAutoHeightMutation.id,
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
                id: CancelMarkDirtyRowAutoHeightMutation.id,
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
});
