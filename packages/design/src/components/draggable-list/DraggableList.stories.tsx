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
import React, { useState } from 'react';

import { DraggableList } from './DraggableList';

const meta: Meta<typeof DraggableList> = {
    title: 'Components / DraggableList',
    component: DraggableList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const DraggableListDemo = {
    render() {
        const [list, setList] = useState([{ title: '1', key: '1' }, { title: '11', key: '2' }]);

        return (
            <DraggableList
                list={list}
                onListChange={setList}
                idKey="key"
                itemRender={(item) => (
                    <div
                        style={{ width: 120, border: '1px solid #ccc', borderRadius: 4 }}
                    >
                        {item.title}
                    </div>
                )}
                rowHeight={32}
                margin={[0, 12]}
            />
        );
    },
};
