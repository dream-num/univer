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

import type { FindModel, IFindMatch } from '../find-replace.service';
import { Subject } from 'rxjs';

import { describe, expect, it, vi } from 'vitest';
import { FindReplaceModel, FindReplaceState } from '../find-replace.service';

describe('FindReplaceModel', () => {
    it('replaceAll should stop searching when all succeed', async () => {
        const state = new FindReplaceState();
        state.changeState({ findString: 'a', replaceString: 'b', revealed: true });

        const univerInstanceService = { getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'u1' })) };
        const commandService = { onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })) };

        const matchesUpdate$ = new Subject<IFindMatch[]>();
        const activelyChangingMatch$ = new Subject<IFindMatch>();
        const match1: IFindMatch = { provider: 'p', unitId: 'u1', range: 1, replaceable: true } as any;

        const model: FindModel = {
            unitId: 'u1',
            matchesUpdate$,
            activelyChangingMatch$,
            getMatches: () => [match1],
            moveToNextMatch: vi.fn(() => match1),
            moveToPreviousMatch: vi.fn(() => match1),
            replace: vi.fn(async () => true),
            replaceAll: vi.fn(async () => ({ success: 1, failure: 0 })),
            focusSelection: vi.fn(),
            dispose: vi.fn(),
        } as any;

        const provider = {
            find: vi.fn(async () => [model]),
            terminate: vi.fn(),
        };

        const providers = new Set([provider as any]);
        const findReplaceModel = new FindReplaceModel(state, providers, univerInstanceService as any, commandService as any);

        await findReplaceModel.start();
        const res = await findReplaceModel.replaceAll();
        expect(res).toEqual({ success: 1, failure: 0 });
        expect(provider.terminate).toHaveBeenCalled();

        findReplaceModel.dispose();
    });
});
