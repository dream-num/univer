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

import { AUTO_FILL_APPLY_TYPE } from '@univerjs/sheets';
import { AddHyperLinkMutation, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import { describe, expect, it, vi } from 'vitest';
import { SheetsHyperLinkAutoFillController } from '../auto-fill.controller';

describe('SheetsHyperLinkAutoFillController', () => {
    it('should generate add/remove link mutations when copying', () => {
        let capturedHook: any;
        const addHook = vi.fn((hook) => {
            capturedHook = hook;
            return { dispose: vi.fn() };
        });

        const autoFillService = {
            addHook,
        } as any;

        const hyperLinkModel = {
            getHyperLinkByLocation: vi.fn((unitId: string, subUnitId: string, row: number, col: number) => {
                if (unitId !== 'u1' || subUnitId !== 's1') return null;
                if (row === 0 && col === 0) {
                    return { id: 'link-1', payload: '#gid=sheet&range=A1', row, column: col };
                }
                if (row === 1 && col === 0) {
                    return { id: 'current-link', payload: '#gid=sheet&range=A2', row, column: col };
                }
                return null;
            }),
        } as any;

        // init registers hook
        const controller = new SheetsHyperLinkAutoFillController(autoFillService, hyperLinkModel);
        expect(addHook).toHaveBeenCalledTimes(1);

        const res = capturedHook.onFillData({
            unitId: 'u1',
            subUnitId: 's1',
            source: { rows: [0], cols: [0] },
            // target should be the filled destination range, not including source
            target: { rows: [1], cols: [0] },
        }, 'DOWN', AUTO_FILL_APPLY_TYPE.COPY);

        expect(res.redos.map((m: any) => m.id)).toEqual([RemoveHyperLinkMutation.id, AddHyperLinkMutation.id]);
        expect(res.undos.map((m: any) => m.id)).toEqual([RemoveHyperLinkMutation.id, AddHyperLinkMutation.id]);

        controller.dispose();
    });

    it('should return noop mutations for non-copy apply type', () => {
        let capturedHook: any;
        const autoFillService = {
            addHook: vi.fn((hook) => {
                capturedHook = hook;
                return { dispose: vi.fn() };
            }),
        } as any;

        const hyperLinkModel = {
            getHyperLinkByLocation: vi.fn(() => null),
        } as any;

        const controller = new SheetsHyperLinkAutoFillController(autoFillService, hyperLinkModel);

        const res = capturedHook.onFillData({
            unitId: 'u1',
            subUnitId: 's1',
            source: { rows: [0], cols: [0] },
            target: { rows: [0, 1], cols: [0] },
        }, 'DOWN', AUTO_FILL_APPLY_TYPE.NO_FORMAT);

        expect(res).toEqual({ redos: [], undos: [] });

        controller.dispose();
    });
});
