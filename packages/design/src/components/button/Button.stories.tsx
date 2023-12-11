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

import type { Meta } from '@storybook/react';
import React from 'react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
    title: 'Components / Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const ButtonType = {
    render() {
        return (
            <>
                <Button>default button</Button>
                <Button type="primary">primary button</Button>
                <Button type="text">text button</Button>
                <Button type="link">link button</Button>
            </>
        );
    },
};

export const ButtonSize = {
    render() {
        return (
            <>
                <Button size="small">small button</Button>
                <Button>medium button</Button>
                <Button type="primary" size="large">
                    large button
                </Button>
            </>
        );
    },
};

export const ButtonBlock = {
    render() {
        return (
            <>
                <Button size="small" block>
                    small button
                </Button>
                <Button type="primary" block>
                    primary button
                </Button>
            </>
        );
    },
};

export const ButtonDisabled = {
    render() {
        return (
            <>
                <Button disabled>default button</Button>
                <Button type="text" disabled>
                    text button
                </Button>
                <Button type="primary" disabled>
                    primary button
                </Button>
            </>
        );
    },
};
