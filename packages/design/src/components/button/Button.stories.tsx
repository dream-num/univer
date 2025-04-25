/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
                <div>
                    <Button>default button</Button>
                    <Button variant="primary">primary button</Button>
                    <Button variant="danger">danger button</Button>
                    <Button variant="text">text button</Button>
                    <Button variant="link">link button</Button>
                </div>
            </>
        );
    },
};

export const ButtonSize = {
    render() {
        return (
            <>
                <div>
                    <Button size="small">small button</Button>
                    <Button>medium button</Button>
                    <Button variant="primary" size="large">
                        large button
                    </Button>
                </div>
            </>
        );
    },
};

export const ButtonDisabled = {
    render() {
        return (
            <>
                <div>
                    <Button disabled>default button</Button>
                    <Button variant="text" disabled>
                        text button
                    </Button>
                    <Button variant="primary" disabled>
                        primary button
                    </Button>
                </div>
            </>
        );
    },
};
