import type { Meta } from '@storybook/react';
import React, { useState } from 'react';

import { Button } from '../button/Button';
import { Popup } from './Popup';

const meta: Meta<typeof Popup> = {
    title: 'Components / Popup',
    component: Popup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const PopupBasic = {
    render() {
        const [visible, setVisible] = useState(false);
        const [offset, setOffset] = useState<[number, number]>([0, 0]);

        function handleClick() {
            setVisible(!visible);
            setOffset([10, 10]);
        }

        return (
            <section>
                <Button onClick={handleClick}>Click me</Button>
                <Popup visible={visible} offset={offset}>
                    <span>xxxx</span>
                </Popup>
            </section>
        );
    },
};
