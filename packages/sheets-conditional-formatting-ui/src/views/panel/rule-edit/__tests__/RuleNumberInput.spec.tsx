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

import type { ComponentProps, ReactNode } from 'react';
import type { Root } from 'react-dom/client';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { RuleNumberInput } from '../RuleNumberInput';

let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});
afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
});
async function render(node: ReactNode) {
    await act(async () => root.render(node));
}
async function edit(input: HTMLInputElement, value: string) {
    await act(async () => {
        input.focus();
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

function ControlledInput(props: ComponentProps<typeof RuleNumberInput>) {
    const [value, setValue] = useState(props.value);
    return (
        <RuleNumberInput
            {...props}
            value={value}
            onChange={(next) => {
                setValue(next);
                props.onChange(next);
            }}
        />
    );
}

it('retains unfinished exponents and emits their numeric value when completed', async () => {
    const onChange = vi.fn();
    await render(<ControlledInput value={2} onChange={onChange} />);
    const input = container.querySelector('input')!;
    for (const draft of ['1', '1e', '1e-', '1e-3']) {
        await edit(input, draft);
        if (draft === '1e' || draft === '1e-') {
            expect(input.value).toBe(draft);
            expect(onChange).toHaveBeenLastCalledWith(1);
        }
    }
    expect(onChange).toHaveBeenLastCalledWith(0.001);
    await edit(input, '1e3');
    expect(onChange).toHaveBeenLastCalledWith(1000);
    await edit(input, '1e999');
    expect(onChange).toHaveBeenLastCalledWith(1000);
    await act(async () => input.blur());
    expect(input.value).toBe('1000');
});

it('preserves percentage bounds and the zero value for an empty condition', async () => {
    const onChange = vi.fn();
    await render(<ControlledInput value={20} min={0} max={100} onChange={onChange} />);
    const input = container.querySelector('input')!;
    await edit(input, '1e3');
    expect(onChange).toHaveBeenLastCalledWith(100);
    expect(input.value).toBe('100');
    await edit(input, '-1e3');
    expect(onChange).toHaveBeenLastCalledWith(0);
    await edit(input, '');
    await act(async () => input.blur());
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(input.value).toBe('0');
});
