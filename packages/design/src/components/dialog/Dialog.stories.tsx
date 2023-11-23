import type { Meta } from '@storybook/react';
import { CloseSingle } from '@univerjs/icons';
import React, { useState } from 'react';

import { Button } from '../button/Button';
import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog> = {
    title: 'Components / Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const DialogBasic = {
    render() {
        const [visible, setVisible] = useState(false);

        function handleToggleVisible() {
            setVisible(!visible);
        }

        return (
            <>
                <Button onClick={handleToggleVisible}>open dialog</Button>
                <Dialog
                    visible={visible}
                    title="hello world"
                    draggable
                    closeIcon={<CloseSingle />}
                    footer={<footer>footer</footer>}
                    onClose={handleToggleVisible}
                >
                    xxxx
                </Dialog>
            </>
        );
    },
};
