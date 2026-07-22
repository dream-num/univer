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

import type { IZoomInputProps } from '@univerjs/ui';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SheetZoomInput } from '../SheetZoomInput';

vi.mock('@univerjs/ui', async (importOriginal) => ({
    ...await importOriginal<typeof import('@univerjs/ui')>(),
    useDependency: () => ({ executeCommand: () => true }),
}));

describe('SheetZoomInput', () => {
    it('forwards a layout class to the shared zoom input', () => {
        const element = SheetZoomInput({
            className: '!univer-w-full',
            shortcuts: [50, 100, 200],
        } as IZoomInputProps) as ReactElement<IZoomInputProps>;

        expect(element.props.className).toContain('!univer-w-full');
    });
});
