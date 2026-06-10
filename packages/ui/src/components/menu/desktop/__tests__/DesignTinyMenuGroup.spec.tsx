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

import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { DesignTinyMenuGroup } from '../DesignTinyMenuGroup';

describe('DesignTinyMenuGroup', () => {
    it('uses a tighter compact footprint for paragraph T color swatches', () => {
        const Icon = ({ className }: { className?: string }) => React.createElement('span', { 'data-testid': 'swatch-icon', className });
        const { container } = render(
            <DesignTinyMenuGroup
                columns={8}
                sizeVariant="paragraph-t"
                layoutVariant="compact"
                items={[{
                    key: 'swatch',
                    onClick: () => {},
                    className: '',
                    Icon,
                }]}
            />
        );

        const group = container.firstChild as HTMLDivElement | null;
        const button = group?.querySelector('div');
        const icon = group?.querySelector('[data-testid="swatch-icon"]');

        expect(group?.className ?? '').toContain('univer-gap-0.5');
        expect(group?.className ?? '').toContain('univer-p-0');
        expect(button?.className ?? '').toContain('univer-size-6');
        expect(button?.className ?? '').toContain('univer-rounded-sm');
        expect(icon?.className ?? '').toContain('univer-size-4');
    });
});
