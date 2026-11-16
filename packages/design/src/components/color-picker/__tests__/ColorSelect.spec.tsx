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

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { MobileDropdown } from '../../dropdown/MobileDropdown';
import { ColorSelect } from '../ColorSelect';
import { MobileColorPicker } from '../MobileColorPicker';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe.each([false, true])('ColorSelect mobile=%s', (mobile) => {
    it('applies colors, transparency and reset independently and closes after a choice', async () => {
        const onChange = vi.fn();
        const onReset = vi.fn();
        const view = render(
            <ConfigProvider mountContainer={document.body} locale={enUS.design} direction="rtl">
                <ColorSelect
                    aria-label="Fill"
                    placeholder="Default"
                    resetLabel="Reset"
                    transparentLabel="Transparent"
                    onChange={onChange}
                    onReset={onReset}
                    DropdownComponent={mobile ? MobileDropdown : undefined}
                    ColorPickerComponent={mobile ? MobileColorPicker : undefined}
                />
            </ConfigProvider>
        );
        const trigger = view.getByRole('button', { name: 'Fill' });
        fireEvent.click(trigger);
        fireEvent.click(await view.findByRole('button', { name: '#FFFFFF' }));
        expect(onChange).toHaveBeenLastCalledWith('#ffffff');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(trigger);
        fireEvent.click(await view.findByRole('button', { name: 'Transparent' }));
        expect(onChange).toHaveBeenLastCalledWith('transparent');
        expect(onReset).not.toHaveBeenCalled();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(trigger);
        fireEvent.click(await view.findByRole('button', { name: 'Reset' }));
        expect(onReset).toHaveBeenCalledOnce();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await waitFor(() => expect(view.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument());
    });
});

it('closes an open picker when disabled and prevents further changes', async () => {
    const onChange = vi.fn();
    const view = render(<ColorSelect aria-label="Fill" value="#000000" onChange={onChange} />);
    fireEvent.click(view.getByRole('button', { name: 'Fill' }));
    expect(await view.findByRole('button', { name: '#000000' })).toBeInTheDocument();
    view.rerender(<ColorSelect aria-label="Fill" disabled value="#000000" onChange={onChange} />);
    const trigger = view.getByRole('button', { name: 'Fill' });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(onChange).not.toHaveBeenCalled();
});

it('dismisses with Escape without changing the color and restores trigger focus', async () => {
    const onChange = vi.fn();
    const view = render(<ColorSelect aria-label="Fill" value="#000000" onChange={onChange} />);
    const trigger = view.getByRole('button', { name: 'Fill' });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(await view.findByRole('button', { name: '#000000' }), { key: 'Escape' });
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
});
