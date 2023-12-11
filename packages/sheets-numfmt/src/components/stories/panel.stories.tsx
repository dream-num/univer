/**
 * Copyright 2023 DreamNum Inc.
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
import { LocaleService, ThemeService } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import React, { useMemo } from 'react';

import { zhCN } from '../../locale';
import type { ISheetNumfmtPanelProps } from '../index';
import { SheetNumfmtPanel } from '../index';

const Index = (props: any) => {
    const inject = useMemo(() => new Injector([[LocaleService], [ThemeService]]), []);
    const Wrap = useMemo(() => connectInjector(SheetNumfmtPanel, inject), []) as any;

    useMemo(() => {
        const localeService = inject.get(LocaleService);
        localeService.load({ zhCN });
    }, []);

    return <Wrap {...props} />;
};
const meta: Meta = {
    title: 'numfmt',
    component: Index,
    parameters: {
        layout: 'centered',
    },
};

export default meta;

export const Test: StoryObj<ISheetNumfmtPanelProps> = {
    args: {
        value: { defaultPattern: '', defaultValue: 123123, row: 2, col: 3 },
        onChange(pattern) {
            console.log(pattern);
        },
    },
};
