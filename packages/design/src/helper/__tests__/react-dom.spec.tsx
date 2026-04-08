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

import { describe, expect, it, vi } from 'vitest';
import { render, unmount } from '../react-dom';

const { mockRender, mockUnmount, mockCreateRoot } = vi.hoisted(() => {
    const hoistedRender = vi.fn();
    const hoistedUnmount = vi.fn();
    const hoistedCreateRoot = vi.fn(() => ({
        render: hoistedRender,
        unmount: hoistedUnmount,
    }));

    return {
        mockRender: hoistedRender,
        mockUnmount: hoistedUnmount,
        mockCreateRoot: hoistedCreateRoot,
    };
});

vi.mock('react-dom/client', () => ({
    createRoot: mockCreateRoot,
}));

describe('helper/react-dom', () => {
    it('should reuse root per container and unmount correctly', () => {
        const containerA = document.createElement('div');
        const containerB = document.createElement('div');

        render(<div>A1</div>, containerA);
        render(<div>A2</div>, containerA);
        render(<div>B1</div>, containerB);

        expect(mockCreateRoot).toHaveBeenCalledTimes(2);
        expect(mockCreateRoot).toHaveBeenNthCalledWith(1, containerA);
        expect(mockCreateRoot).toHaveBeenNthCalledWith(2, containerB);
        expect(mockRender).toHaveBeenCalledTimes(3);

        unmount(containerA);
        expect(mockUnmount).toHaveBeenCalledTimes(1);

        unmount(containerA);
        expect(mockUnmount).toHaveBeenCalledTimes(1);

        unmount(containerB);
        expect(mockUnmount).toHaveBeenCalledTimes(2);
    });
});
