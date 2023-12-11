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

import { defaultTheme, greenTheme } from '../../themes';
import { Palette } from './Palette';

const themes: Record<string, Record<string, string>> = {
    default: defaultTheme,
    green: greenTheme,
};

const meta: Meta = {
    title: 'Design / Design Token',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground: StoryObj = {
    render: (_, context) => <Palette theme={themes[context.globals.theme]} />,
};
