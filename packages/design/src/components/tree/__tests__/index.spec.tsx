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

import { Tree } from '../Tree';
import { findNodeFromPath, findNodePathFromTree, findSubTreeFromPath, isIntermediated, mergeTreeSelected } from '../util';

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
});
