import type { Meta } from '@storybook/react';
import { useState } from 'react';

import { CascaderList } from './CascaderList';

const meta: Meta<typeof CascaderList> = {
    title: 'Components / CascaderList',
    component: CascaderList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState<string[]>([]);

        const options = [
            {
                value: '常规',
                label: '常规',
                children: [
                    {
                        value: 'hangzhou',
                        label: 'Hangzhou',
                    },
                ],
            },
            {
                value: '货币',
                label: '货币',
                children: [
                    {
                        value: 'nanjing',
                        label: 'Nanjing',
                    },
                ],
            },
            {
                value: '自定义',
                label: '自定义',
                children: [
                    {
                        value: 'beijing',
                        label: 'beijing',
                        children: [
                            {
                                value: '-1,234.00',
                                label: '-1,234.00',
                            },
                            {
                                value: '(1,234.00)',
                                label: '(1,234.00)',
                            },
                        ],
                    },
                ],
            },
            {
                value: '日期',
                label: '日期',
                children: [],
            },
            {
                value: '会计专用',
                label: '会计专用',
            },
        ];

        function handleChange(value: string[]) {
            setValue(value);
        }

        return <CascaderList value={value} options={options} onChange={handleChange} />;
    },
};
