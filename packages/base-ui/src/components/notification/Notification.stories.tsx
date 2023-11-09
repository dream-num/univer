import type { Meta } from '@storybook/react';
import { Button } from '@univerjs/design';

import { Notification, notification } from './Notification';

const meta: Meta<typeof Notification> = {
    title: 'Components / Notification',
    component: Notification,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground = {
    render: () => (
        <>
            <Notification />
            <Button
                type="primary"
                onClick={() =>
                    notification.show({
                        type: 'success',
                        title: 'Notification Success',
                        content: 'Notification content',
                    })
                }
            >
                Notification Success
            </Button>
            <Button
                onClick={() =>
                    notification.show({ type: 'info', title: 'Notification Info', content: 'Notification content' })
                }
            >
                Notification Info
            </Button>
            <Button
                type="primary"
                onClick={() =>
                    notification.show({
                        type: 'warning',
                        title: 'Notification Warning',
                        content: 'Notification content',
                    })
                }
            >
                Notification Warning
            </Button>
            <Button
                type="primary"
                onClick={() =>
                    notification.show({ type: 'error', title: 'Notification Error', content: 'Notification content' })
                }
            >
                Notification Error
            </Button>
        </>
    ),
};
