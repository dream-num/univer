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

import { cleanup, createEvent, fireEvent, render } from '@testing-library/react';
import { DropdownMenu } from '@univerjs/design';
import { afterEach, describe, expect, it } from 'vitest';
import { FontSize } from '../FontSize';

describe('FontSize input ownership', () => {
    afterEach(cleanup);

    it('preserves native pointer focus without opening the surrounding dropdown', () => {
        const changes: number[] = [];
        const rendered = render(
            <DropdownMenu items={[{ type: 'item', children: '24' }]}>
                <div>
                    <FontSize value={11} min={6} max={400} onChange={(value) => changes.push(value)} />
                    <span>Open sizes</span>
                </div>
            </DropdownMenu>
        );
        const input = rendered.container.querySelector('input')!;
        const pointer = createEvent.pointerDown(input, { bubbles: true, cancelable: true });
        Object.defineProperties(pointer, {
            button: { value: 0 },
            pointerType: { value: 'mouse' },
            ctrlKey: { value: false },
        });
        fireEvent(input, pointer);
        expect(pointer.defaultPrevented).toBe(false);
        expect(rendered.queryByRole('menu')).toBeNull();
        expect(changes).toEqual([]);
    });

    it.each(['Escape', 'blur'])('discards numeric and empty drafts on %s without a command', (action) => {
        const changes: number[] = [];
        const rendered = render(<FontSize value={11} min={6} max={400} onChange={(value) => changes.push(value)} />);
        const input = rendered.container.querySelector('input')!;
        for (const draft of ['24', '']) {
            fireEvent.change(input, { target: { value: draft } });
            expect(input.value).toBe(draft);
            if (action === 'blur') {
                fireEvent.blur(input);
            } else {
                fireEvent.keyDown(input, { key: action, code: action });
            }
            expect(input.value).toBe('11');
            expect(changes).toEqual([]);
        }
    });

    it('does not submit a previous draft when confirming an empty input', () => {
        const changes: number[] = [];
        const rendered = render(<FontSize value={11} min={6} max={400} onChange={(value) => changes.push(value)} />);
        const input = rendered.container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '24' } });
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        expect(input.value).toBe('11');
        expect(changes).toEqual([]);
    });

    it('uses the new selected size instead of a stale draft after the controlled value changes', () => {
        const changes: number[] = [];
        const onChange = (value: number) => changes.push(value);
        const rendered = render(<FontSize value={11} min={6} max={400} onChange={onChange} />);
        const input = rendered.container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '24' } });
        rendered.rerender(<FontSize value={18} min={6} max={400} onChange={onChange} />);
        expect(input.value).toBe('18');
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        expect(changes).toEqual([18]);
    });

    it.each([['2', 6], ['999', 400]] as const)('commits bounded size %s only after confirmation', (text, expected) => {
        const changes: number[] = [];
        const rendered = render(<FontSize value={11} min={6} max={400} onChange={(value) => changes.push(value)} />);
        const input = rendered.container.querySelector('input')!;
        fireEvent.change(input, { target: { value: text } });
        expect(input.value).toBe(text);
        expect(changes).toEqual([]);
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        expect(changes).toEqual([expected]);
    });

    it('retains a below-minimum prefix while typing a valid multi-digit size', () => {
        const changes: number[] = [];
        const rendered = render(<FontSize value={11} min={6} max={400} onChange={(value) => changes.push(value)} />);
        const input = rendered.container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '2' } });
        expect(input.value).toBe('2');
        fireEvent.change(input, { target: { value: `${input.value}4` } });
        expect(input.value).toBe('24');
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        expect(changes).toEqual([24]);
    });

    it('does not commit while Enter accepts an IME candidate', () => {
        const changes: number[] = [];
        const rendered = render(<FontSize value={11} min={6} max={400} onChange={(value) => changes.push(value)} />);
        const input = rendered.container.querySelector('input')!;
        fireEvent.change(input, { target: { value: '24' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', isComposing: true });
        expect(input.value).toBe('24');
        expect(changes).toEqual([]);
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        expect(changes).toEqual([24]);
    });
});
