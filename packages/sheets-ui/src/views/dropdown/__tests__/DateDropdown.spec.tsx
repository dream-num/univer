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

import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DateDropdown, formatDuration, parseDuration } from '../DateDropdown';

vi.mock('@univerjs/ui', async (importOriginal) => ({
    ...await importOriginal<typeof import('@univerjs/ui')>(),
    useDependency: () => ({ t: () => 'OK' }),
}));

vi.mock('react', async (importOriginal) => ({
    ...await importOriginal<typeof import('react')>(),
    useState: <T,>(initialValue: T | (() => T)) => [
        typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue,
        vi.fn(),
    ],
}));

describe('DateDropdown confirmation', () => {
    it('submits the displayed date when an empty cell is confirmed without a selection change', async () => {
        const onChange = vi.fn().mockResolvedValue(true);
        const dropdown = DateDropdown({
            popup: {
                extraProps: {
                    hideFn: vi.fn(),
                    onChange,
                    patternType: 'date',
                    preserveDefaultValue: true,
                },
            } as never,
        }) as ReactElement<{ children: ReactElement[] }>;
        const footer = dropdown.props.children[dropdown.props.children.length - 1] as ReactElement<{
            children: ReactElement<{ onClick: () => Promise<void> }>;
        }>;

        await footer.props.children.props.onClick();

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0]).toBeDefined();
    });
});

describe('DateDropdown duration conversion', () => {
    it('keeps accumulated hours and milliseconds without wrapping at 24 hours', () => {
        expect(formatDuration(1.25)).toBe('30:00:00');
        expect(formatDuration(-1.5)).toBe('-36:00:00');
        expect(parseDuration('36:00:00')).toBe(1.5);
        expect(parseDuration('12:34:56.789')).toBeCloseTo((12 * 3600 + 34 * 60 + 56.789) / 86400);
    });

    it('rejects invalid duration text', () => {
        expect(parseDuration('24:60:00')).toBeNull();
        expect(parseDuration('12:34')).toBeNull();
    });
});
