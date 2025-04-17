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

import type { Meta } from '@storybook/react';
import type { ITreeNodeProps } from './Tree';

import React, { useState } from 'react';
import { Tree, TreeSelectionMode } from './Tree';

const meta: Meta<typeof Tree> = {
    title: 'Components / Tree',
    component: Tree,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
const data = [
    {
        key: '0',
        title: 'node 0',
        children: [
            { key: '0-0', title: 'node 0-0' },
            { key: '0-1', title: 'node 0-1' },
            {
                key: '0-2',
                title: 'node 0-2',
                children: [
                    { key: '0-2-0', title: 'node 0-2-0' },
                    { key: '0-2-1', title: 'node 0-2-1' },
                    { key: '0-2-2', title: 'node 0-2-2' },
                ],
            },
            { key: '0-3', title: 'node 0-3' },
            { key: '0-4', title: 'node 0-4' },
            { key: '0-5', title: 'node 0-5' },
            { key: '0-6', title: 'node 0-6' },
            { key: '0-7', title: 'node 0-7' },
            { key: '0-8', title: 'node 0-8' },
            {
                key: '0-9',
                title: 'node 0-9',
                children: [
                    { key: '0-9-0', title: 'node 0-9-0' },
                    {
                        key: '0-9-1',
                        title: 'node 0-9-1',
                        children: [
                            { key: '0-9-1-0', title: 'node 0-9-1-0' },
                            { key: '0-9-1-1', title: 'node 0-9-1-1' },
                            { key: '0-9-1-2', title: 'node 0-9-1-2' },
                            { key: '0-9-1-3', title: 'node 0-9-1-3' },
                            { key: '0-9-1-4', title: 'node 0-9-1-4' },
                        ],
                    },
                    {
                        key: '0-9-2',
                        title: 'node 0-9-2',
                        children: [
                            { key: '0-9-2-0', title: 'node 0-9-2-0' },
                            { key: '0-9-2-1', title: 'node 0-9-2-1' },
                        ],
                    },
                ],
            },
        ],
    },
    {
        key: '1',
        title: 'node 1',
        children: [
            {
                key: '1-0',
                title: 'node 1-0',
                children: [
                    { key: '1-0-0', title: 'node 1-0-0' },
                    {
                        key: '1-0-1',
                        title: 'node 1-0-1',
                        children: [
                            { key: '1-0-1-0', title: 'node 1-0-1-0' },
                            { key: '1-0-1-1', title: 'node 1-0-1-1' },
                        ],
                    },
                    { key: '1-0-2', title: 'node 1-0-2' },
                ],
            },
        ],
    },
];
export const TreeBasic = {
    render() {
        const [valueGroup] = useState<string[]>([]);

        function handleSelected(node: ITreeNodeProps) {
            // eslint-disable-next-line no-console
            console.log('all leafNode', node);
        }

        return (
            <Tree
                data={data}
                defaultExpandAll
                selectionMode={TreeSelectionMode.ONLY_LEAF_NODE}
                valueGroup={valueGroup}
                onChange={handleSelected}
            />
        );
    },
};
