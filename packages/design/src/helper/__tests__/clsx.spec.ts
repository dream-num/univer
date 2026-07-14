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
});
