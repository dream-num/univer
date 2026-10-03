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
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Select } from '../Select';

afterEach(cleanup);

it('opens a labelled select with the keyboard and applies an option', async () => {
    const onChange = vi.fn();
    const { getByRole, findByRole } = render(
        <ConfigProvider locale={enUS.design} mountContainer={document.body}>
            <Select aria-label="Date format" value="short" options={[{ label: 'Short', value: 'short' }, { label: 'Long', value: 'long' }]} onChange={onChange} />
        </ConfigProvider>
    );
    const trigger = getByRole('button', { name: 'Date format' });
    expect(trigger.tabIndex).toBe(0);
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const option = await findByRole('menuitemradio', { name: 'Long' });
    option.focus();
    fireEvent.keyDown(option, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('long');
});
