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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tree, TreeSelectionMode } from '../Tree';
import { findNodeFromPath, findNodePathFromTree, findSubTreeFromPath, isIntermediated, mergeTreeSelected } from '../util';

afterEach(cleanup);

describe('Tree', () => {
    const data = [
        {
            key: '0',
            title: 'node 0',
            children: [
                { key: '0-0', title: 'node 0-0' },
                { key: '0-1', title: 'node 0-1' },
            ],
        },
    ];
    it('test findNodePathFromTree', () => {
        expect(findNodePathFromTree(data, '0-0')).toEqual(['0', '0-0']);
        expect(findNodePathFromTree(data, '2-0')).toEqual([]);
    });

    it('test findSubTreeFromPath', () => {
        expect(findSubTreeFromPath(data, ['0'])).toEqual([
            { key: '0-0', title: 'node 0-0' },
            { key: '0-1', title: 'node 0-1' },
        ]);
        expect(findSubTreeFromPath(data, [])).toEqual(data);
    });

    it('test findNodeFromPath', () => {
        expect(findNodeFromPath(data, ['0'])).toEqual({
            key: '0',
            title: 'node 0',
            children: [
                { key: '0-0', title: 'node 0-0' },
                { key: '0-1', title: 'node 0-1' },
            ],
        });
        expect(findNodeFromPath(data, [])).toEqual(undefined);
    });

    it('test mergeTreeSelected', () => {
        expect(mergeTreeSelected(data, [], ['0', '0-0'])).toEqual(['0', '0-0']);
    });

    it('test isIntermediated', () => {
        expect(isIntermediated(new Set(['0-0', '0']), {
            key: '0',
            title: 'node 0',
            children: [
                { key: '0-0', title: 'node 0-0' },
                { key: '0-1', title: 'node 0-1' },
            ],
        })).toBeTruthy();
        expect(isIntermediated(new Set(['0-1', '0-0', '0']), {
            key: '0',
            title: 'node 0',
            children: [
                { key: '0-0', title: 'node 0-0' },
                { key: '0-1', title: 'node 0-1' },
            ],
        })).toBeFalsy();
    });

    it('defaultExpandAll', async () => {
        const { container } = render(
            <Tree
                data={[
                    {
                        key: '0',
                        title: 'node 0',
                        children: [
                            { key: '0-0', title: 'node 0-0' },
                            { key: '0-1', title: 'node 0-1' },
                        ],
                    },
                ]}
                defaultExpandAll
            />
        );

        expect(container);
    });

    it('should call onChange for checkbox and onExpend for node title click', () => {
        const onChange = vi.fn();
        const onExpend = vi.fn();
        const { getByText, container } = render(
            <Tree
                data={data}
                onChange={onChange}
                onExpend={onExpend}
                defaultExpandAll
            />
        );

        const nodeTitle = getByText('node 0');
        fireEvent.click(nodeTitle);
        expect(onExpend).toHaveBeenCalledWith('0');

        const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ key: '0' }));
    });

    it('should avoid onExpend for parent in ONLY_LEAF_NODE mode and allow leaf', () => {
        const onExpend = vi.fn();
        const { getByText } = render(
            <Tree
                data={data}
                selectionMode={TreeSelectionMode.ONLY_LEAF_NODE}
                onExpend={onExpend}
                defaultExpandAll
            />
        );

        fireEvent.click(getByText('node 0'));
        fireEvent.click(getByText('node 0'));
        expect(onExpend).not.toHaveBeenCalledWith('0');

        fireEvent.click(getByText('node 0-0'));
        expect(onExpend).toHaveBeenCalledWith('0-0');
    });

    it('should derive selected node set from valueGroup and cached finder', () => {
        const cache = new Map<string, string[]>();
        const { container } = render(
            <Tree
                data={data}
                valueGroup={['0-0']}
                defaultCache={cache}
                defaultExpandAll
            />
        );

        const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
        expect(checkboxes.some((checkbox) => checkbox.checked)).toBe(true);
    });
});
