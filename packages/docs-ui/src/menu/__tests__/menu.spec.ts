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

import { HorizontalAlign, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { isObservable, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AlignMenuItemFactory } from '../menu';

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        getMenuHiddenObservable: vi.fn(() => of(false)),
    };
});

describe('docs menu state', () => {
    it('shares and deduplicates paragraph alignment notifications', () => {
        let commandListener: ((command: { id: string }) => void) | undefined;
        const dispose = vi.fn();
        const commandService = {
            onCommandExecuted: vi.fn((listener) => {
                commandListener = listener;
                return { dispose };
            }),
        };
        const paragraph = {
            startIndex: 10,
            paragraphStyle: { horizontalAlign: HorizontalAlign.LEFT },
        };
        const document = {
            getSelfOrHeaderFooterModel: vi.fn(() => ({
                getBody: vi.fn(() => ({ paragraphs: [paragraph] })),
            })),
        };
        const instanceService = {
            getCurrentUnitOfType: vi.fn(() => document),
        };
        const selectionService = {
            getDocRanges: vi.fn(() => [{ isActive: true, startOffset: 1 }]),
            textSelection$: of({ textRanges: [], rectRanges: [] }),
        };
        const accessor = {
            get: vi.fn((id) => {
                if (id === ICommandService) return commandService;
                if (id === IUniverInstanceService) return instanceService;
                if (id === DocSelectionManagerService) return selectionService;
                throw new Error('not registered');
            }),
        };

        const menuItem = AlignMenuItemFactory(accessor as never);
        const alignments: HorizontalAlign[] = [];
        const icons: unknown[] = [];
        const valueSubscription = menuItem.value$?.subscribe((value) => alignments.push(value));
        expect(isObservable(menuItem.icon)).toBe(true);
        const iconSubscription = isObservable(menuItem.icon) ? menuItem.icon.subscribe((icon) => icons.push(icon)) : undefined;

        expect(commandService.onCommandExecuted).toHaveBeenCalledTimes(1);
        expect(alignments).toEqual([HorizontalAlign.LEFT]);
        expect(icons).toEqual(['LeftJustifyingIcon']);

        commandListener?.({ id: SetTextSelectionsOperation.id });
        expect(alignments).toEqual([HorizontalAlign.LEFT]);
        expect(icons).toEqual(['LeftJustifyingIcon']);

        paragraph.paragraphStyle.horizontalAlign = HorizontalAlign.CENTER;
        commandListener?.({ id: SetTextSelectionsOperation.id });
        expect(alignments).toEqual([HorizontalAlign.LEFT, HorizontalAlign.CENTER]);
        expect(icons).toEqual(['LeftJustifyingIcon', 'HorizontallyIcon']);

        valueSubscription?.unsubscribe();
        iconSubscription?.unsubscribe();
        expect(dispose).toHaveBeenCalledTimes(1);
    });
});
