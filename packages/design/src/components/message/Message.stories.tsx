import type { Meta } from '@storybook/react';
import React from 'react';

import { Button } from '../button/Button';
import { Message, MessageType } from './Message';

const meta: Meta = {
    title: 'Components / Message',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground = {
    render: () => {
        const message = new Message(document.body);

        function handleOpen(type: MessageType) {
            message[type]({
                content: 'Hello world!',
            });
        }

        return (
            <>
                <Button type="primary" onClick={() => handleOpen(MessageType.Success)}>
                    Click Me
                </Button>
                <Button type="primary" onClick={() => handleOpen(MessageType.Warning)}>
                    Click Me
                </Button>
                <Button type="primary" onClick={() => handleOpen(MessageType.Error)}>
                    Click Me
                </Button>
            </>
        );
    },
};
