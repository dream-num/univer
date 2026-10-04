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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../Dialog';

afterEach(() => cleanup());

describe('Dialog', () => {
    it('keeps the dialog open for IME candidate Escape and closes after composition ends', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();
        const { getByRole } = render(
            <Dialog open onOpenChange={onOpenChange} onClose={onClose}>
                <input aria-label="HEX color" />
            </Dialog>
        );
        const input = getByRole('textbox');
        input.focus();
        fireEvent.compositionStart(input);
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', isComposing: true });
        expect(onOpenChange).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(input);
        fireEvent.compositionEnd(input);
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
        expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
