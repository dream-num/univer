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
import { HyperlinkEditor } from '../HyperlinkEditor';

afterEach(cleanup);
const labels = { address: 'Address', label: 'Label', cancel: 'Cancel', confirm: 'Confirm' };

it.each([false, true])('connects labels and errors and submits through the caller with mobile=%s', (mobile) => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onLabelChange = vi.fn();
    const onUrlChange = vi.fn();
    const view = render(<HyperlinkEditor mobile={mobile} labels={labels} url="example.com" label="Example" labelError="Required" urlError="Invalid address" onConfirm={onConfirm} onCancel={onCancel} onLabelChange={onLabelChange} onUrlChange={onUrlChange} />);
    const address = view.getByRole('textbox', { name: 'Address' });
    expect(address.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(address.getAttribute('aria-describedby')!)?.textContent).toBe('Invalid address');
    const label = view.getByRole('textbox', { name: 'Label' });
    expect(document.activeElement).toBe(label);
    fireEvent.change(label, { target: { value: 'Next label' } });
    fireEvent.change(address, { target: { value: 'https://example.com' } });
    expect(onLabelChange).toHaveBeenCalledWith('Next label');
    expect(onUrlChange).toHaveBeenCalledWith('https://example.com');
    fireEvent.click(view.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(view.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
});

it('hides the label for insertion and blocks whitespace-only submission', () => {
    const confirm = vi.fn();
    const view = render(<HyperlinkEditor labels={labels} url="  " onConfirm={confirm} onCancel={() => {}} onUrlChange={() => {}} />);
    expect(view.queryByRole('textbox', { name: 'Label' })).toBeNull();
    expect(document.activeElement).toBe(view.getByRole('textbox', { name: 'Address' }));
    fireEvent.submit(view.container.querySelector('form')!);
    expect(confirm).not.toHaveBeenCalled();
    expect((view.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement).disabled).toBe(true);
});
