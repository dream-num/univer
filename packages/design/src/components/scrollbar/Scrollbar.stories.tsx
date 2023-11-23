import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Scrollbar } from './Scrollbar';

const meta: Meta<typeof Scrollbar> = {
    title: 'Components / Scrollbar',
    component: Scrollbar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const ScrollbarBasic: StoryObj = {
    render() {
        return (
            <section style={{ display: 'flex', gap: '24px' }}>
                <section style={{ height: '320px' }}>
                    <Scrollbar>
                        top
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        bottom
                    </Scrollbar>
                </section>

                <section style={{ height: '30vh' }}>
                    <Scrollbar>
                        top
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        xxxx
                        <br />
                        bottom
                    </Scrollbar>
                </section>

                <section style={{ height: '100px' }}>
                    <Scrollbar>
                        <div>foo</div>
                        <div>foo</div>
                    </Scrollbar>
                </section>
            </section>
        );
    },
};
