import { Slider } from './Slider';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/Slider',
    component: Slider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
