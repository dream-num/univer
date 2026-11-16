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
import { HyperlinkPreview } from '../HyperlinkPreview';

afterEach(cleanup);
const labels = { copy: 'Copy', edit: 'Edit', remove: 'Remove link' };

it('exposes the available actions as named buttons and renders descriptions as text', () => {
    const open = vi.fn();
    const copy = vi.fn();
    const edit = vi.fn();
    const remove = vi.fn();
    const view = render(<HyperlinkPreview title="Example" description="<b>Tip</b>" labels={labels} onOpen={open} onCopy={copy} onEdit={edit} onRemove={remove} />);
    for (const name of ['Example', 'Copy', 'Edit', 'Remove link']) fireEvent.click(view.getByRole('button', { name }));
    expect(open).toHaveBeenCalledOnce();
    expect(copy).toHaveBeenCalledOnce();
    expect(edit).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(view.getByText('<b>Tip</b>')).toBeTruthy();
    expect(view.container.querySelector('b')).toBeNull();
});

it('prevents unavailable actions and keeps read-only previews free of editing controls', () => {
    const open = vi.fn();
    const copy = vi.fn();
    const view = render(<HyperlinkPreview title="Missing target" invalid labels={labels} onOpen={open} onCopy={copy} />);
    fireEvent.click(view.getByRole('button', { name: 'Missing target' }));
    fireEvent.click(view.getByRole('button', { name: 'Copy' }));
    expect(open).not.toHaveBeenCalled();
    expect(copy).not.toHaveBeenCalled();
    expect(view.queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(view.queryByRole('button', { name: 'Remove link' })).toBeNull();
    view.rerender(<HyperlinkPreview title="Example" copyDisabled labels={labels} onOpen={open} onCopy={copy} />);
    fireEvent.click(view.getByRole('button', { name: 'Copy' }));
    expect(copy).not.toHaveBeenCalled();
});
