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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsDataValidationReRenderController } from '../dv-rerender.controller';

describe('SheetsDataValidationReRenderController', () => {
    it('marks affected skeletons dirty and forces a rerender when validation status changes', async () => {
        const validStatusChange$ = new Subject<{ subUnitId: string }>();
        const makeDirty1 = vi.fn();
        const makeDirty2 = vi.fn();
        const makeForceDirty = vi.fn();

        const controller = new SheetsDataValidationReRenderController(
            { mainComponent: { makeForceDirty } } as never,
            { validStatusChange$ } as never,
            {
                getSkeletonParam: vi.fn((sheetId: string) => {
                    if (sheetId === 'sheet-1') return { skeleton: { makeDirty: makeDirty1 } };
                    if (sheetId === 'sheet-2') return { skeleton: { makeDirty: makeDirty2 } };
                    return undefined;
                }),
            } as never
        );

        validStatusChange$.next({ subUnitId: 'sheet-1' });
        validStatusChange$.next({ subUnitId: 'sheet-2' });
        validStatusChange$.next({ subUnitId: 'sheet-1' });
        expect(controller).toBeTruthy();

        await new Promise((resolve) => setTimeout(resolve, 30));

        expect(makeDirty1).toHaveBeenCalledTimes(1);
        expect(makeDirty2).toHaveBeenCalledTimes(1);
        expect(makeForceDirty).toHaveBeenCalledTimes(1);
    });
});
