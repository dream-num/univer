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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { MobileDialog } from '../MobileDialog';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe('MobileDialog', () => {
    it('keeps keyboard focus out of input fields until the user edits', () => {
        render(<MobileDialog open title="Print"><input aria-label="Page range" /></MobileDialog>);
        expect(screen.getByRole('dialog')).toHaveFocus();
        expect(screen.getByRole('textbox')).not.toHaveFocus();
        screen.getByRole('textbox').focus();
        expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('closes once when the close control is pressed', () => {
        const onClose = vi.fn();
        render(<MobileDialog open title="Print" onClose={onClose}>Preview</MobileDialog>);
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('keeps its original geometry while the keyboard viewport is visible', () => {
        vi.stubGlobal('CSS', { supports: () => false });
        vi.stubGlobal('innerHeight', 768);
        vi.stubGlobal('visualViewport', {
            height: 448,
            offsetTop: 0,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });
        render(
            <ConfigProvider
                mountContainer={document.body}
                mobileKeyboardViewport={{ top: 0, bottom: 448, height: 448, stableHeight: 768 }}
            >
                <MobileDialog open title="Edit">Content</MobileDialog>
            </ConfigProvider>
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog.style.bottom).toBe('0px');
        expect(dialog.style.maxHeight).toBe('80vh');
        expect(dialog.querySelector<HTMLElement>('.univer-overflow-y-auto')?.style.paddingBottom).toBe('');
    });
});
