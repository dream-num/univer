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

import { DocumentEditArea } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';

import { AddDocCommentMenuItemFactory, shouldDisableAddComment, ToolbarDocCommentMenuItemFactory } from '../menu';

vi.mock('@univerjs/engine-render', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/engine-render')>('@univerjs/engine-render');
    return {
        ...actual,
        withCurrentTypeOfRenderer: vi.fn(() => ({
            getSkeleton: () => ({
                getViewModel: () => ({
                    getEditArea: () => DocumentEditArea.BODY,
                }),
            }),
        })),
    };
});

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        getMenuHiddenObservable: vi.fn(() => null),
    };
});

describe('docs-thread-comment-ui menu', () => {
    it('shouldDisableAddComment returns true when selection is collapsed', () => {
        const accessor = {
            get: vi.fn((token) => {
                if (token.name === 'IRenderManagerService') return {};
                if (token.name === 'DocSelectionManagerService') {
                    return { getActiveTextRange: () => ({ collapsed: true }) };
                }
                if (token.name === 'IUniverInstanceService') return {};
                return {};
            }),
        } as any;

        expect(shouldDisableAddComment(accessor)).toBe(true);
    });

    it('menu factories should return correct ids', () => {
        const accessor = { get: vi.fn(() => ({ textSelection$: { pipe: () => ({ subscribe: () => ({ unsubscribe: vi.fn() }) }) } })) } as any;

        const addItem = AddDocCommentMenuItemFactory(accessor);
        const toolbarItem = ToolbarDocCommentMenuItemFactory(accessor);
        expect(addItem.id).toBe('docs.operation.start-add-comment');
        expect(toolbarItem.id).toBe('docs.operation.toggle-comment-panel');
    });
});
