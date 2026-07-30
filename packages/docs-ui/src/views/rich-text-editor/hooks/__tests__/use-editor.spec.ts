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

import type { IDocumentData } from '@univerjs/core';
import type { RefObject } from 'react';
import { validateDocBodyStructure } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { useEditor } from '../use-editor';

const { editor, getEditor, register, setEditor } = vi.hoisted(() => ({
    editor: {},
    getEditor: vi.fn(),
    register: vi.fn(),
    setEditor: vi.fn(),
}));

vi.mock('@univerjs/ui', async (importOriginal) => ({
    ...await importOriginal<typeof import('@univerjs/ui')>(),
    useDependency: () => ({ getEditor, register }),
}));

vi.mock('react', async (importOriginal) => ({
    ...await importOriginal<typeof import('react')>(),
    useLayoutEffect: (effect: () => void) => effect(),
    useMemo: (factory: () => unknown) => factory(),
    useState: () => [undefined, setEditor],
}));

describe('useEditor', () => {
    it('registers a structurally valid document for a string initial value', () => {
        getEditor.mockReturnValue(editor);

        useEditor({
            editorId: 'range-editor',
            initialValue: 'A1',
            container: { current: { clientWidth: 320 } } as RefObject<HTMLDivElement>,
            isSingle: true,
        });

        const snapshot = register.mock.calls[0][0].initialSnapshot as IDocumentData;
        expect(validateDocBodyStructure(snapshot.body!)).toEqual([]);
        expect(snapshot.body?.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([2]);
    });

    it('registers an editor that preserves its host focus', () => {
        getEditor.mockReturnValue(editor);

        useEditor({
            editorId: 'range-editor',
            initialValue: 'A1',
            container: { current: { clientWidth: 320 } } as RefObject<HTMLDivElement>,
            preserveHostFocus: true,
        });

        expect(register).toHaveBeenLastCalledWith(
            expect.objectContaining({ preserveHostFocus: true }),
            expect.anything()
        );
    });
});
