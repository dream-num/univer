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
import { MobileDialog } from '../MobileDialog';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

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
});
