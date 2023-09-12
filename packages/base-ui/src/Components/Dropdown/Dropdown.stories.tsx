import { Input } from '../Input/input';
import { Dropdown } from './Dropdown';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: <Input type="number" value="test"></Input>,
        menu: {
            menu: [
                {
                    label: 'test',
                    value: 'test',
                    show: true,
                },
                {
                    label: 'test1',
                    value: 'test1',
                    show: true,
                },
            ],
        },
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
