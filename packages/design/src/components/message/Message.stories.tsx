import type { Meta } from '@storybook/react';

import { Button } from '../button/Button';
import { Message, message, type MessageType } from './Message';

const meta: Meta<typeof Message> = {
    title: 'Components / Message',
    component: Message,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

function handleOpen(type: MessageType) {
    message[type]({
        content: 'Hello world!',
    });
}

export const Playground = {
    render: () => (
        <>
            <Button type="primary" onClick={() => handleOpen('success')}>
                Click Me
            </Button>
            <Button type="primary" onClick={() => handleOpen('warning')}>
                Click Me
            </Button>
            <Button type="primary" onClick={() => handleOpen('error')}>
                Click Me
            </Button>
        </>
    ),
};
