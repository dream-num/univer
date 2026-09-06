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

import { cva } from 'class-variance-authority';
import { describe, expect, it } from 'vitest';

import { clsx } from '../clsx';

describe('clsx', () => {
    it('flattens conditional values without caching mutable arrays or objects by identity', () => {
        const active = { 'univer-h-8': false };
        const values = ['univer-h-6'];
        const inputs = [values, active, [false, null, undefined, 0, Number.NaN, '', true, 7, 1n]];

        expect(clsx(...inputs)).toBe('univer-h-6 7');
        active['univer-h-8'] = true;
        expect(clsx(...inputs)).toBe('univer-h-8 7');
        values.push('univer-p-2');
        expect(clsx(...inputs)).toBe('univer-p-2 univer-h-8 7');
        expect(clsx()).toBe('');
        expect(clsx(' \n univer-p-2\t univer-p-4  ')).toBe('univer-p-4');
    });

    it('merges Univer-prefixed conflicting utilities', () => {
        expect(clsx('univer-h-6', 'univer-h-[78px]')).toBe('univer-h-[78px]');
        expect(clsx('univer-px-3', 'univer-px-8')).toBe('univer-px-8');
        expect(clsx('univer-bg-transparent', 'univer-bg-[#e8eefc]')).toBe('univer-bg-[#e8eefc]');
        expect(clsx('dark:!univer-h-6', 'dark:!univer-h-[78px]')).toBe('dark:!univer-h-[78px]');
    });

    it('merges a className appended by CVA', () => {
        const buttonVariants = cva('', {
            variants: {
                size: {
                    small: 'univer-h-6',
                },
            },
        });

        expect(clsx(buttonVariants({ size: 'small', className: 'univer-h-[78px]' }))).toBe('univer-h-[78px]');
    });

    it.each([
        ['univer-pr-2 univer-px-4', 'univer-px-4'],
        ['univer-px-4 univer-pr-2', 'univer-px-4 univer-pr-2'],
        ['univer-p-2 univer-px-4', 'univer-p-2 univer-px-4'],
        ['univer-px-4 univer-p-2', 'univer-p-2'],
        ['univer-w-2 univer-h-4 univer-size-8', 'univer-size-8'],
        ['univer-size-8 univer-w-2', 'univer-size-8 univer-w-2'],
        ['-univer-m-2 univer-m-4', 'univer-m-4'],
        ['univer-p-2 !univer-p-4 !univer-p-8', 'univer-p-2 !univer-p-8'],
        ['univer-leading-8 univer-text-sm/6', 'univer-text-sm/6'],
        ['univer-text-sm/6 univer-leading-8', 'univer-text-sm/6 univer-leading-8'],
        ['univer-w-1/2 univer-w-3/4', 'univer-w-3/4'],
        ['univer-bg-opacity-25 univer-bg-opacity-50 univer-bg-red-500/50', 'univer-bg-opacity-50 univer-bg-red-500/50'],
        ['univer-text-opacity-25 univer-text-opacity-75', 'univer-text-opacity-75'],
    ])('resolves directional and v3-specific conflicts: %s', (input, expected) => {
        expect(clsx(input)).toBe(expected);
    });

    it.each([
        ['hover:focus:univer-p-2 focus:hover:univer-p-4', 'focus:hover:univer-p-4'],
        ['hover:univer-p-2 focus:univer-p-4', 'hover:univer-p-2 focus:univer-p-4'],
        ['dark:hover:!univer-p-2 hover:dark:!univer-p-4', 'hover:dark:!univer-p-4'],
        ['[&:nth-child(2)]:univer-p-2 [&:nth-child(2)]:univer-p-4', '[&:nth-child(2)]:univer-p-4'],
        ['hover:[&_a]:univer-p-2 [&_a]:hover:univer-p-4', 'hover:[&_a]:univer-p-2 [&_a]:hover:univer-p-4'],
        ['group-hover/menu:univer-p-2 group-hover/menu:univer-p-4', 'group-hover/menu:univer-p-4'],
        ['data-[state=open]:univer-p-2 data-[state=open]:univer-p-4', 'data-[state=open]:univer-p-4'],
    ])('keeps variant scopes distinct: %s', (input, expected) => {
        expect(clsx(input)).toBe(expected);
    });

    it.each([
        ['univer-text-[length:var(--size)] univer-text-[color:var(--color)]', 'univer-text-[length:var(--size)] univer-text-[color:var(--color)]'],
        ['univer-bg-[url(https://example.com/a-b.svg)] univer-bg-red-500', 'univer-bg-[url(https://example.com/a-b.svg)] univer-bg-red-500'],
        ['univer-bg-[size:20px_30px] univer-bg-cover', 'univer-bg-cover'],
        ['univer-shadow-[0_1px_2px_black] univer-shadow-red-500', 'univer-shadow-[0_1px_2px_black] univer-shadow-red-500'],
        ['[color:red] [color:blue] [background:red]', '[color:blue] [background:red]'],
        ['hover:[--gutter:1rem] hover:[--gutter:2rem]', 'hover:[--gutter:2rem]'],
        ['p-2 p-4 univer-custom univer-custom', 'p-2 p-4 univer-custom univer-custom'],
        ['univer-p-unknown univer-p-2', 'univer-p-unknown univer-p-2'],
        ['constructor toString __proto__ univer-constructor univer-toString', 'constructor toString __proto__ univer-constructor univer-toString'],
    ])('recognizes arbitrary values and preserves external classes: %s', (input, expected) => {
        expect(clsx(input)).toBe(expected);
    });

    it('handles the v3 leading important marker before a font-size/line-height postfix', () => {
        expect(clsx('!univer-leading-8 !univer-text-sm/6')).toBe('!univer-text-sm/6');
        expect(clsx('!univer-text-red-500 !univer-text-sm/6')).toBe('!univer-text-red-500 !univer-text-sm/6');
    });
});
