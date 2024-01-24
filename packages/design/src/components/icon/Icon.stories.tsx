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

import { Button } from '../button/Button';

const meta: Meta = {
    title: 'Components / Icon',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        function handleRedirect() {
            window.open('https://univer.ai/icons', '_blank');
        }

        return (
            <>
                Check out our icon library at
                <Button type="link" onClick={handleRedirect}>
                    https://univer.ai/icons
                </Button>
            </>
        );
    },
};
