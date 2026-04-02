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

import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { of, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SaveCellImagesMenuFactory } from '../save-images.menu';

vi.mock('@univerjs/ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/ui')>();

    return {
        ...actual,
        getMenuHiddenObservable: vi.fn(() => of(false)),
    };
});

describe('SaveCellImagesMenuFactory', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('shows the menu only when file system access is supported and the current selection contains images', async () => {
        const selectionMoveEnd$ = new Subject<void>();
        let selections = [{
            range: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            },
        }];

        const workbook = {
            getActiveSheet: () => ({
                getCellMatrix: () => ({
                    getValue: () => ({
                        p: {
                            drawingsOrder: ['img-1'],
                        },
                    }),
                }),
            }),
        };

        vi.stubGlobal('window', {
            showDirectoryPicker: vi.fn(),
        });

        const menu = SaveCellImagesMenuFactory({
            get: (token: unknown) => {
                if (token === IUniverInstanceService) {
                    return {
                        getCurrentTypeOfUnit$: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET
                            ? of(workbook)
                            : of(null),
                    };
                }
                if (token === SheetsSelectionsService) {
                    return {
                        selectionMoveEnd$,
                        getCurrentSelections: () => selections,
                    };
                }

                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as never);

        const values: boolean[] = [];
        const subscription = menu.hidden$!.subscribe((value) => values.push(value));

        selectionMoveEnd$.next();
        expect(values.at(-1)).toBe(false);

        vi.stubGlobal('window', {});
        selectionMoveEnd$.next();
        expect(values.at(-1)).toBe(true);

        selections = [];
        vi.stubGlobal('window', {
            showDirectoryPicker: vi.fn(),
        });
        selectionMoveEnd$.next();
        expect(values.at(-1)).toBe(true);

        subscription.unsubscribe();
    });
});
