/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
                <section style={{ maxHeight: '320px' }}>
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
