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

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { Injector, IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { afterEach, describe, expect, it } from 'vitest';
import { RediProvider } from '../../../utils/di';
import { EditorDropdown, EditorFloatingToolbar, resolveEditorDropdownSide } from '../EditorFloatingToolbar';

afterEach(cleanup);

describe('resolveEditorDropdownSide', () => {
    it.each([
        ['top-center', undefined, 'top'],
        ['bottom-center', undefined, 'bottom'],
        ['top-center', 'bottom', 'bottom'],
        ['bottom-center', 'top', 'top'],
    ] as const)('resolves %s with a %s override to %s', (direction, requestedSide, expectedSide) => {
        expect(resolveEditorDropdownSide(direction, requestedSide)).toBe(expectedSide);
    });
});

it.each(['restore', 'moved focus', 'reused editor', 'prevented close'] as const)('closes a real dropdown with %s', async (scenario) => {
    const editor = document.createElement('textarea');
    editor.dataset.uComp = 'editor';
    editor.setAttribute('data-embed-interaction-boundary-owner', 'owner-1');
    editor.setAttribute('data-embed-child-unit-id', 'child-1');
    const outside = document.createElement('button');
    document.body.append(editor, outside);
    const injector = new Injector([
        [IUniverInstanceService, { useValue: { getFocusedUnit: () => null } }],
        [IRenderManagerService, { useValue: { getRenderUnitById: () => undefined } }],
    ]);
    const content = (open: boolean) => <RediProvider value={{ injector }}><EditorDropdown open={open} overlay={<input aria-label="Popup input" />} onCloseAutoFocus={scenario === 'prevented close' ? (event) => event.preventDefault() : undefined}><button type="button">Tools</button></EditorDropdown></RediProvider>;
    const view = render(content(false));
    try {
        editor.focus();
        view.rerender(content(true));
        await waitFor(() => expect(document.activeElement).toBe(view.getByRole('textbox', { name: 'Popup input' })));
        if (scenario === 'moved focus') outside.focus();
        if (scenario === 'reused editor') editor.setAttribute('data-embed-child-unit-id', 'child-2');
        view.rerender(content(false));
        await waitFor(() => expect(view.queryByRole('textbox', { name: 'Popup input' })).toBeNull());
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
        if (scenario === 'restore') expect(document.activeElement).toBe(editor);
        else expect(document.activeElement).not.toBe(editor);
        if (scenario === 'moved focus') expect(document.activeElement).toBe(outside);
    } finally {
        view.unmount();
        injector.dispose();
        editor.remove();
        outside.remove();
    }
});

it('keeps editor selection for toolbar buttons while allowing editable controls to focus', () => {
    const view = render(
        <EditorFloatingToolbar>
            <button type="button">Bold</button>
            <input aria-label="Font size" />
        </EditorFloatingToolbar>
    );
    expect(fireEvent.mouseDown(view.getByRole('button', { name: 'Bold' }))).toBe(false);
    expect(fireEvent.mouseDown(view.getByRole('textbox', { name: 'Font size' }))).toBe(true);
});
