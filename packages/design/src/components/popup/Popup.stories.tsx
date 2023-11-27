import type { Meta } from '@storybook/react';
import React from 'react';

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
        return (
            <section>
                <Button>Click me</Button>
                <Popup>
                    <span>xxxx</span>
                </Popup>
            </section>
        );
    },
};
