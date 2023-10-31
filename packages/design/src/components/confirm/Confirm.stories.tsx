import type { Meta } from '@storybook/react';
import { useState } from 'react';

import { Button } from '../button/Button';
import { Confirm } from './Confirm';

const meta: Meta<typeof Confirm> = {
    title: 'Components / Confirm',
    component: Confirm,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const ConfirmBasic = {
    render() {
        const [visible, setVisible] = useState(false);

        function handleToggleVisible() {
            setVisible(!visible);
        }

        return (
            <>
                <Button onClick={handleToggleVisible}>open confirm</Button>
                <Confirm
                    visible={visible}
                    title="hello world"
                    onClose={handleToggleVisible}
                    onConfirm={handleToggleVisible}
                >
                    xxxx
                </Confirm>
            </>
        );
    },
};
