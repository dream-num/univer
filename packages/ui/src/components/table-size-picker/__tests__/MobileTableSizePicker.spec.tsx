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
import { afterEach, expect, it, vi } from 'vitest';
import { MobileTableSizePicker } from '../MobileTableSizePicker';

afterEach(cleanup);

it('confirms custom dimensions with the mobile fields and supplied labels', () => {
    const confirm = vi.fn();
    const view = render(<MobileTableSizePicker labels={{ rows: 'Rows', columns: 'Columns', confirm: 'Apply', customSize: 'Custom', size: () => '' }} maxRows={20} maxColumns={20} onConfirm={confirm} />);
    fireEvent.change(view.getByLabelText('Rows'), { target: { value: '4' } });
    fireEvent.change(view.getByLabelText('Columns'), { target: { value: '2' } });
    fireEvent.click(view.getByRole('button', { name: 'Apply' }));
    expect(confirm).toHaveBeenCalledExactlyOnceWith({ rows: 4, columns: 2 });
});
