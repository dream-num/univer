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

import type { IContextService } from '@univerjs/core';
import type { ISequenceNode } from '@univerjs/engine-formula';
import { Direction } from '@univerjs/core';
import { sequenceNodeType } from '@univerjs/engine-formula';
import { map, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FORMULA_PROMPT_ACTIVATED, FormulaPromptService } from '../prompt.service';

function createReferenceNode(token: string, startIndex: number, endIndex: number): ISequenceNode {
    return {
        token,
        startIndex,
        endIndex,
        nodeType: sequenceNodeType.REFERENCE,
    } as ISequenceNode;
}

function createContextService(): IContextService {
    const contextChanged$ = new Subject<{ [key: string]: boolean }>();
    const contextMap = new Map<string, boolean>();

    return {
        contextChanged$: contextChanged$.asObservable(),
        getContextValue: vi.fn((key: string) => contextMap.get(key) ?? false),
        setContextValue: vi.fn((key: string, value: boolean) => {
            contextMap.set(key, value);
            contextChanged$.next({ [key]: value });
        }),
        subscribeContextValue$: vi.fn((key: string) => contextChanged$.pipe(map((event) => event[key] ?? false))),
    };
}

describe('FormulaPromptService', () => {
    it('tracks prompt visibility and forwards prompt events', () => {
        const contextService = createContextService();
        const service = new FormulaPromptService(contextService);
        const searchEvents: unknown[] = [];
        const helpEvents: unknown[] = [];
        const navigateEvents: unknown[] = [];
        const acceptEvents: boolean[] = [];
        const acceptedNames: string[] = [];

        service.search$.subscribe((event) => searchEvents.push(event));
        service.help$.subscribe((event) => helpEvents.push(event));
        service.navigate$.subscribe((event) => navigateEvents.push(event));
        service.accept$.subscribe((event) => acceptEvents.push(event));
        service.acceptFormulaName$.subscribe((event) => acceptedNames.push(event));

        service.search({ visible: true, searchText: 'su', searchList: [] });
        service.help({ visible: true, paramIndex: 1, functionInfo: { functionName: 'SUM' } as never });
        service.navigate({ direction: Direction.DOWN });
        service.accept(true);
        service.acceptFormulaName('SUM');

        expect(contextService.setContextValue).toHaveBeenCalledWith(FORMULA_PROMPT_ACTIVATED, true);
        expect(service.isSearching()).toBe(true);
        expect(service.isHelping()).toBe(true);
        expect(searchEvents).toEqual([{ visible: true, searchText: 'su', searchList: [] }]);
        expect(helpEvents).toEqual([{ visible: true, paramIndex: 1, functionInfo: { functionName: 'SUM' } }]);
        expect(navigateEvents).toEqual([{ direction: Direction.DOWN }]);
        expect(acceptEvents).toEqual([true]);
        expect(acceptedNames).toEqual(['SUM']);

        service.dispose();
    });

    it('updates and inserts sequence nodes while keeping later reference indexes aligned', () => {
        const service = new FormulaPromptService(createContextService());

        service.setSequenceNodes([
            '=',
            createReferenceNode('A1', 1, 2),
            '+',
            createReferenceNode('B2', 4, 5),
        ]);

        expect(service.getCurrentSequenceNodeIndex(1)).toBe(1);
        expect(service.getCurrentSequenceNodeByIndex(1)).toMatchObject({ token: 'A1' });

        service.updateSequenceRef(1, 'Sheet1!A1');

        expect(service.getSequenceNodes()).toEqual([
            '=',
            createReferenceNode('Sheet1!A1', 1, 9),
            '+',
            createReferenceNode('B2', 11, 12),
        ]);

        service.insertSequenceString(1, '(');
        service.insertSequenceRef(2, 'C3');

        expect(service.getSequenceNodes()).toEqual([
            '=',
            '(',
            createReferenceNode('C3', 2, 3),
            createReferenceNode('Sheet1!A1', 4, 12),
            '+',
            createReferenceNode('B2', 14, 15),
        ]);

        service.enableLockedSelectionChange();
        service.enableLockedSelectionInsert();
        expect(service.isLockedSelectionChange()).toBe(true);
        expect(service.isLockedSelectionInsert()).toBe(true);

        service.disableLockedSelectionChange();
        service.disableLockedSelectionInsert();
        service.clearSequenceNodes();

        expect(service.isLockedSelectionChange()).toBe(false);
        expect(service.isLockedSelectionInsert()).toBe(false);
        expect(service.getSequenceNodes()).toEqual([]);

        service.dispose();
    });
});
