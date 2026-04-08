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
import { VirtualList } from '../VirtualList';
import '@testing-library/jest-dom/vitest';

describe('VirtualList', () => {
    afterEach(cleanup);

    const data = Array.from({ length: 20 }, (_, i) => ({ id: `id-${i}`, label: `Item ${i}` }));

    it('should render all items when height/itemHeight are not provided', () => {
        const { queryByText } = render(
            <VirtualList data={data} itemKey="id">
                {(item) => <span>{item.label}</span>}
            </VirtualList>
        );

        expect(queryByText('Item 0')).toBeInTheDocument();
        expect(queryByText('Item 19')).toBeInTheDocument();
    });

    it('should render virtualized items and react to scroll', () => {
        const { container } = render(
            <VirtualList
                data={data}
                itemKey={(item) => item.id}
                height={40}
                itemHeight={10}
                overscan={1}
            >
                {(item) => <span>{item.label}</span>}
            </VirtualList>
        );

        const scroller = container.firstElementChild as HTMLDivElement;
        expect(scroller).toBeInTheDocument();

        expect(scroller.textContent).toContain('Item 0');
        scroller.scrollTop = 80;
        fireEvent.scroll(scroller);

        expect(scroller.textContent).toContain('Item 10');
    });
});
