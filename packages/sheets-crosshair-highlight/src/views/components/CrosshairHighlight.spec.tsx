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

/* eslint-disable import/first */

import { describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({
    useDependency: vi.fn(),
    useObservable: vi.fn(),
}));

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        useDependency: mocked.useDependency,
        useObservable: mocked.useObservable,
    };
});

vi.mock('@univerjs/design', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/design')>('@univerjs/design');
    return {
        ...actual,
        borderClassName: 'border-class',
        clsx: (...args: Array<string | Record<string, boolean>>) => args
            .flatMap((arg) =>
                typeof arg === 'string'
                    ? [arg]
                    : Object.keys(arg).filter((k) => arg[k])
            )
            .join(' '),
    };
});

vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
    };
});

import { CROSSHAIR_HIGHLIGHT_COLORS } from '../../services/crosshair.service';
import { CrosshairOverlay } from './CrosshairHighlight';

describe('CrosshairOverlay', () => {
    it('should render color cells and trigger onChange', () => {
        mocked.useDependency.mockReturnValue({ color$: {} });
        mocked.useObservable.mockReturnValue(CROSSHAIR_HIGHLIGHT_COLORS[0]);
        const onChange = vi.fn();

        const element = CrosshairOverlay({ onChange });
        const children = element.props.children as Array<{ props: { onClick: () => void; style: { backgroundColor: string } } }>;

        expect(children).toHaveLength(CROSSHAIR_HIGHLIGHT_COLORS.length);
        expect(children[0].props.style.backgroundColor).toBe(CROSSHAIR_HIGHLIGHT_COLORS[0]);

        children[1].props.onClick();
        expect(onChange).toHaveBeenCalledWith(CROSSHAIR_HIGHLIGHT_COLORS[1]);
    });
});
