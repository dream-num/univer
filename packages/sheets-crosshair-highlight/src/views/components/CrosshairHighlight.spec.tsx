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

import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS } from '../../services/crosshair.service';
import { CrosshairOverlay } from './CrosshairHighlight';

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

describe('CrosshairOverlay', () => {
    it('should render theme color cells and trigger onChange with token path', () => {
        const themeService = {
            currentTheme$: of({}),
            getColorFromTheme: vi.fn((path: string) => ({
                'highlight.background.1': { color: 'purple.500', alpha: 0.3 },
                'highlight.background.2': { color: 'red.500', alpha: 0.15 },
                'purple.500': '#010203',
                'red.500': '#040506',
            })[path] ?? { color: 'purple.500', alpha: 0.3 }),
        };

        mocked.useDependency
            .mockReturnValueOnce({ color$: of('rgba(1,2,3,0.3)') })
            .mockReturnValueOnce(themeService);
        mocked.useObservable.mockReturnValueOnce('rgba(1,2,3,0.3)').mockReturnValueOnce({});
        const onChange = vi.fn();

        const element = CrosshairOverlay({ onChange });
        const children = element.props.children as Array<{ props: { onClick: () => void; style: { backgroundColor: string } } }>;

        expect(children).toHaveLength(CROSSHAIR_HIGHLIGHT_COLOR_THEME_PATHS.length);
        expect(children[0].props.style.backgroundColor).toBe('rgba(1,2,3,0.3)');
        expect(children[1].props.style.backgroundColor).toBe('rgba(4,5,6,0.15)');

        children[1].props.onClick();
        expect(onChange).toHaveBeenCalledWith('highlight.background.2');
    });
});
