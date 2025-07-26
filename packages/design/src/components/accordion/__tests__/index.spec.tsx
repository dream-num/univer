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
import { afterEach, describe, expect, it } from 'vitest';
import { Accordion } from '../Accordion';

afterEach(cleanup);

describe('Accordion', () => {
    it('should render all items and only open one at a time', () => {
        const items = [
            { label: 'Item 1', children: <div>Content 1</div> },
            { label: 'Item 2', children: <div>Content 2</div> },
            { label: 'Item 3', children: <div>Content 3</div> },
        ];
        const { getByText, queryByText } = render(<Accordion items={items} />);

        // Should be hidden by default
        expect(queryByText('Content 1')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 2')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 3')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');

        // Should expand the first item
        fireEvent.click(getByText('Item 1'));
        expect(getByText('Content 1').parentElement?.parentElement?.className).toContain('univer-max-h-screen');
        expect(queryByText('Content 2')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 3')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');

        // Should expand the second item
        fireEvent.click(getByText('Item 2'));
        expect(getByText('Content 2').parentElement?.parentElement?.className).toContain('univer-max-h-screen');
        expect(queryByText('Content 1')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
        expect(queryByText('Content 3')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');

        // Should collapse the second item
        fireEvent.click(getByText('Item 2'));
        expect(queryByText('Content 2')?.parentElement?.parentElement?.className).toContain('univer-max-h-0');
    });
});
