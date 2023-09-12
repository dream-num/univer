import { CanvasIcon } from './CanvasIcon';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Components/CanvasIcon',
    component: CanvasIcon,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        width: '100',
        height: '100',
        type: 'DASH_DOT',
        hv: 'h',
        mSt: 0,
        mEd: 5,
        lineSt: 100,
        lineEd: 5,
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Playground = {
    args: {},
};
