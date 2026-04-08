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

import { AddHyperLinkMutation, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import { COPY_TYPE, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetsHyperLinkCopyPasteController } from '../copy-paste.controller';

describe('SheetsHyperLinkCopyPasteController', () => {
    it('should generate remove/add mutations when pasting a copied hyperlink cell', () => {
        let hook: any;
        const addClipboardHook = vi.fn((h) => {
            hook = h;
        });

        const sheetClipboardService = {
            addClipboardHook,
        } as any;

        const hyperLinkModel = {
            getHyperLinkByLocation: vi.fn((unitId: string, subUnitId: string, row: number, col: number) => {
                if (unitId === 'u1' && subUnitId === 's1' && row === 0 && col === 0) {
                    return { id: 'old-id', payload: '#gid=s1&range=A1', row, column: col };
                }

                if (unitId === 'u2' && subUnitId === 's2' && row === 1 && col === 1) {
                    return { id: 'current-id', payload: '#gid=s2&range=B2', row, column: col };
                }

                return null;
            }),
            getHyperLink: vi.fn((unitId: string, subUnitId: string, id: string) => {
                if (unitId === 'u1' && subUnitId === 's1' && id === 'old-id') {
                    return { id, payload: '#gid=s1&range=A1', row: 0, column: 0 };
                }
                return null;
            }),
        } as any;

        const injector = {
            invoke: vi.fn(() => ({ rows: [0], cols: [0] })),
        } as any;

        const resolverService = {} as any;

        const controller = new SheetsHyperLinkCopyPasteController(sheetClipboardService, hyperLinkModel, injector, resolverService);
        expect(addClipboardHook).toHaveBeenCalledTimes(1);

        // Simulate copy stage
        hook.onBeforeCopy('u1', 's1', { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });

        const res = hook.onPasteCells(
            { range: { rows: [0], cols: [0] } },
            { unitId: 'u2', subUnitId: 's2', range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, copyRange: { rows: [0], cols: [0] } }
        );

        expect(res.redos.map((m: any) => m.id)).toEqual([RemoveHyperLinkMutation.id, AddHyperLinkMutation.id]);
        expect(res.undos.map((m: any) => m.id)).toEqual([RemoveHyperLinkMutation.id, AddHyperLinkMutation.id]);

        controller.dispose();
    });

    it('should ignore special paste types', () => {
        let hook: any;
        const sheetClipboardService = {
            addClipboardHook: vi.fn((h) => {
                hook = h;
            }),
        } as any;
        const hyperLinkModel = { getHyperLinkByLocation: vi.fn(), getHyperLink: vi.fn() } as any;
        const injector = { invoke: vi.fn(() => ({ rows: [0], cols: [0] })) } as any;
        const resolverService = {} as any;

        const controller = new SheetsHyperLinkCopyPasteController(sheetClipboardService, hyperLinkModel, injector, resolverService);
        hook.onBeforeCopy('u1', 's1', { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 });

        const res = hook.onPasteCells(
            { range: { rows: [0], cols: [0] } },
            { unitId: 'u2', subUnitId: 's2', range: { rows: [1], cols: [1] } },
            null,
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE, copyRange: { rows: [0], cols: [0] } }
        );

        expect(res).toEqual({ redos: [], undos: [] });

        controller.dispose();
    });
});
