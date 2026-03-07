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

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DraggableList } from '../DraggableList';
import '@testing-library/jest-dom/vitest';

vi.mock('react-dom', async () => {
    const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
    return {
        ...actual,
        createPortal: (node: any) => node,
    };
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

interface IItem {
    id: string;
    label: string;
}

const BASE_LIST: IItem[] = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
];

function mockRect(element: HTMLElement) {
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
        x: 10,
        y: 20,
        left: 10,
        top: 20,
        right: 110,
        bottom: 56,
        width: 100,
        height: 36,
        toJSON: () => ({}),
    } as DOMRect);
}

describe('DraggableList', () => {
    it('should reorder list and emit drag callbacks', async () => {
        const onListChange = vi.fn();
        const onDragStart = vi.fn();
        const onDragStop = vi.fn();

        const { container } = render(
            <DraggableList<IItem>
                list={BASE_LIST}
                idKey="id"
                rowHeight={36}
                margin={[4, 6]}
                onListChange={onListChange}
                onDragStart={onDragStart}
                onDragStop={onDragStop}
                itemRender={(item) => <div>{item.label}</div>}
            />
        );

        const listRoot = container.querySelector('.univer-flex-col') as HTMLElement;
        expect(listRoot.style.rowGap).toBe('6px');
        expect(listRoot.style.paddingLeft).toBe('4px');
        expect(listRoot.style.paddingRight).toBe('4px');

        const itemA = container.querySelector('[data-draggable-list-item-id="a"]') as HTMLDivElement;
        const itemB = container.querySelector('[data-draggable-list-item-id="b"]') as HTMLDivElement;
        expect(itemA.style.minHeight).toBe('36px');

        mockRect(itemA);
        Object.defineProperty(itemA, 'setPointerCapture', {
            configurable: true,
            value: vi.fn(),
        });

        const elementFromPointSpy = vi.spyOn(document, 'elementFromPoint').mockReturnValue(itemB);

        fireEvent.pointerDown(itemA, {
            pointerId: 1,
            clientX: 20,
            clientY: 24,
        });

        await waitFor(() => {
            expect(onDragStart).toHaveBeenCalledWith(undefined, { y: 0 });
        });

        expect(container.querySelector('.univer-pointer-events-none')).toBeInTheDocument();

        fireEvent.pointerMove(window, {
            pointerId: 1,
            clientX: 48,
            clientY: 50,
        });

        fireEvent.pointerUp(window, {
            pointerId: 1,
            clientX: 48,
            clientY: 50,
        });

        await waitFor(() => {
            expect(onDragStop).toHaveBeenCalledWith(undefined, { y: 0 }, { y: 1 });
            expect(onListChange).toHaveBeenCalledTimes(1);
        });

        const updatedList = onListChange.mock.calls[0][0] as IItem[];
        expect(updatedList.map((item) => item.id)).toEqual(['b', 'a', 'c']);

        elementFromPointSpy.mockRestore();
    });

    it('should only start drag when pointer down on draggable handle', async () => {
        const onListChange = vi.fn();
        const onDragStart = vi.fn();

        const { container } = render(
            <DraggableList<IItem>
                list={BASE_LIST.slice(0, 2)}
                idKey="id"
                draggableHandle=".drag-handle"
                onListChange={onListChange}
                onDragStart={onDragStart}
                itemRender={(item) => (
                    <div>
                        <span>{item.label}</span>
                        <button type="button" className="drag-handle">drag</button>
                    </div>
                )}
            />
        );

        const itemA = container.querySelector('[data-draggable-list-item-id="a"]') as HTMLDivElement;
        mockRect(itemA);

        Object.defineProperty(itemA, 'setPointerCapture', {
            configurable: true,
            value: vi.fn(),
        });

        fireEvent.pointerDown(screen.getByText('A'), {
            pointerId: 2,
            clientX: 20,
            clientY: 24,
        });

        fireEvent.pointerMove(window, {
            pointerId: 2,
            clientX: 26,
            clientY: 30,
        });
        fireEvent.pointerUp(window, {
            pointerId: 2,
            clientX: 26,
            clientY: 30,
        });

        expect(onDragStart).not.toHaveBeenCalled();
        expect(onListChange).not.toHaveBeenCalled();

        const handleButton = itemA.querySelector('.drag-handle') as HTMLButtonElement;
        fireEvent.pointerDown(handleButton, {
            pointerId: 3,
            clientX: 20,
            clientY: 24,
        });

        await waitFor(() => {
            expect(onDragStart).toHaveBeenCalledTimes(1);
        });
    });

    it('should ignore unrelated pointer events while dragging', async () => {
        const onListChange = vi.fn();

        const { container } = render(
            <DraggableList<IItem>
                list={BASE_LIST.slice(0, 2)}
                idKey="id"
                onListChange={onListChange}
                itemRender={(item) => <div>{item.label}</div>}
            />
        );

        const itemA = container.querySelector('[data-draggable-list-item-id="a"]') as HTMLDivElement;
        const itemB = container.querySelector('[data-draggable-list-item-id="b"]') as HTMLDivElement;
        mockRect(itemA);
        Object.defineProperty(itemA, 'setPointerCapture', {
            configurable: true,
            value: vi.fn(),
        });

        fireEvent.pointerDown(itemA, {
            pointerId: 10,
            clientX: 20,
            clientY: 24,
        });

        // pointerId mismatch should be ignored
        fireEvent.pointerMove(window, {
            pointerId: 999,
            clientX: 30,
            clientY: 34,
        });

        // target equals source should be ignored
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(itemA);
        fireEvent.pointerMove(window, {
            pointerId: 10,
            clientX: 32,
            clientY: 36,
        });

        // target not in current list should keep previous list
        const invalidTarget = document.createElement('div');
        invalidTarget.setAttribute('data-draggable-list-item-id', 'missing');
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(invalidTarget);
        fireEvent.pointerMove(window, {
            pointerId: 10,
            clientX: 34,
            clientY: 38,
        });

        // A second pointer down during active drag should be ignored.
        fireEvent.pointerDown(itemB, {
            pointerId: 11,
            clientX: 20,
            clientY: 24,
        });

        // pointerup mismatch should not end current dragging
        fireEvent.pointerUp(window, {
            pointerId: 999,
            clientX: 34,
            clientY: 38,
        });
        expect(onListChange).not.toHaveBeenCalled();

        fireEvent.pointerUp(window, {
            pointerId: 10,
            clientX: 34,
            clientY: 38,
        });
        expect(onListChange).toHaveBeenCalledTimes(1);
    });

    it('should render ghost with itemRender fallback when innerHTML is empty', async () => {
        const onListChange = vi.fn();
        const itemRender = vi.fn(() => null);

        const { container } = render(
            <DraggableList<IItem>
                list={BASE_LIST.slice(0, 1)}
                idKey="id"
                onListChange={onListChange}
                itemRender={itemRender}
            />
        );

        const itemA = container.querySelector('[data-draggable-list-item-id="a"]') as HTMLDivElement;
        mockRect(itemA);
        Object.defineProperty(itemA, 'setPointerCapture', {
            configurable: true,
            value: vi.fn(),
        });

        fireEvent.pointerDown(itemA, {
            pointerId: 20,
            clientX: 20,
            clientY: 24,
        });

        await waitFor(() => {
            expect(itemRender.mock.calls.length).toBeGreaterThanOrEqual(3);
        });

        fireEvent.pointerUp(window, {
            pointerId: 20,
            clientX: 20,
            clientY: 24,
        });
        expect(onListChange).toHaveBeenCalledTimes(1);
    });
});
