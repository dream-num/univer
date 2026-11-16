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
import { TableSizePicker } from '../TableSizePicker';

const labels = { rows: 'Rows', columns: 'Columns', customSize: 'Custom size', confirm: 'Insert', size: (columns: number, rows: number) => `${columns} columns, ${rows} rows` };
afterEach(cleanup);

describe('TableSizePicker', () => {
    it.each(['card', 'dropdown'] as const)('confirms the focused grid dimensions in the %s layout', (variant) => {
        const confirm = vi.fn();
        const view = render(<TableSizePicker labels={labels} variant={variant} direction="rtl" onConfirm={confirm} />);
        const cell = view.getByRole('button', { name: '4 columns, 2 rows' });
        fireEvent.focus(cell);
        expect(view.getByText('4 × 2')).toBeTruthy();
        fireEvent.click(cell);
        expect(confirm).toHaveBeenCalledExactlyOnceWith({ rows: 2, columns: 4 });
    });

    it('constrains initial values, custom input and grid choices to the supplied bounds', () => {
        const confirm = vi.fn();
        const view = render(<TableSizePicker labels={labels} initialRows={NaN} initialColumns={100} minRows={2} maxRows={5} maxColumns={6} onConfirm={confirm} />);
        expect(view.queryByRole('button', { name: '7 columns, 2 rows' })).toBeNull();
        const tooSmall = view.getByRole('button', { name: '1 columns, 1 rows' }) as HTMLButtonElement;
        expect(tooSmall.disabled).toBe(true);
        fireEvent.click(tooSmall);
        expect(confirm).not.toHaveBeenCalled();
        fireEvent.click(view.getByRole('button', { name: 'Insert' }));
        expect(confirm).toHaveBeenLastCalledWith({ rows: 2, columns: 6 });
        fireEvent.change(view.getByLabelText('Rows'), { target: { value: '100' } });
        fireEvent.change(view.getByLabelText('Columns'), { target: { value: '3' } });
        fireEvent.click(view.getByRole('button', { name: 'Insert' }));
        expect(confirm).toHaveBeenLastCalledWith({ rows: 5, columns: 3 });
    });
});
