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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FindBy, FindDirection, FindReplaceModel, FindReplaceService, FindScope } from '../find-replace.service';

describe('FindReplaceService', () => {
    beforeEach(() => {
        vi.useRealTimers();
    });

    it('should start session and move to next match', async () => {
        const contextService = { setContextValue: vi.fn() };

        const focused$ = new Subject<any>();
        const univerInstanceService = {
            getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'u1' })),
            focused$,
        };

        const commandService = {
            onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const matchesUpdate$ = new Subject<IFindMatch[]>();
        const activelyChangingMatch$ = new Subject<IFindMatch>();
        const match1: IFindMatch = { provider: 'p', unitId: 'u1', range: { i: 1 }, replaceable: true } as any;
        const match2: IFindMatch = { provider: 'p', unitId: 'u1', range: { i: 2 }, replaceable: false } as any;

        const model: FindModel = {
            unitId: 'u1',
            matchesUpdate$,
            activelyChangingMatch$,
            getMatches: () => [match1, match2],
            moveToNextMatch: vi.fn(() => match1),
            moveToPreviousMatch: vi.fn(() => match2),
            replace: vi.fn(async () => true),
            replaceAll: vi.fn(async () => ({ success: 2, failure: 0 })),
            focusSelection: vi.fn(),
            dispose: vi.fn(),
        } as any;

        const provider = {
            find: vi.fn(async () => [model]),
            terminate: vi.fn(),
        };

        const injector = {
            createInstance: vi.fn((_cls: any, _state: any, _providers: any) => {
                return new FindReplaceModel(_state, _providers, univerInstanceService as any, commandService as any);
            }),
        };

        const service = new FindReplaceService(injector as any, contextService as any);
        service.registerFindReplaceProvider(provider as any);
        expect(service.start(false)).toBe(true);

        service.changeFindString('hello');
        service.changeFindDirection(FindDirection.ROW);
        service.changeFindScope(FindScope.SUBUNIT);
        service.changeFindBy(FindBy.VALUE);

        service.find();
        // wait for provider find to resolve
        await new Promise((r) => setTimeout(r, 0));

        service.moveToNextMatch();
        expect(service.getCurrentMatch()).toEqual(match1);

        const replaceables = await new Promise<IFindMatch[]>((resolve) => {
            service.replaceables$.subscribe((r) => {
                if (r.length) resolve(r);
            });
        });
        expect(replaceables).toEqual([match1]);

        service.terminate();
        service.dispose();
    });
});
