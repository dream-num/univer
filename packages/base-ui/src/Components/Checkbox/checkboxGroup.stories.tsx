import { CheckboxGroup } from './Group';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/CheckboxGroup',
    component: CheckboxGroup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        options: [
            {
                checked: true,
                name: 'checked',
                label: 'checked',
                value: 'checked',
            },
            {
                name: 'test',
                label: 'test',
                value: 'test',
            },
        ],
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
