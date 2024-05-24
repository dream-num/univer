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
import { LocaleService, LocaleType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { RediContext } from '@wendellhu/redi/react-bindings';
import React, { useContext, useState } from 'react';
import enUS from '../../locale/en-US';
import zhCN from '../../locale/zh-CN';
import ruRU from '../../locale/ru-RU';
import type { ISheetNumfmtPanelProps } from '../index';
import { SheetNumfmtPanel } from '../index';
import { UserHabitController } from '../../controllers/user-habit.controller';

const meta: Meta = {
    title: 'numfmt',
    parameters: {
        layout: 'centered',
    },
};

export default meta;

export const Test: StoryObj<ISheetNumfmtPanelProps> = {

    render() {
        const { injector } = useContext(RediContext);

        const [inject] = useState(() => {
            const deps: Dependency[] = [
                [UserHabitController],
            ];

            injector?.get(LocaleService).load({
                [LocaleType.EN_US]: enUS,
                [LocaleType.ZH_CN]: zhCN,
                [LocaleType.RU_RU]: ruRU,
            });

            deps.forEach((dependency) => injector?.add(dependency));

            return injector;
        });

        return (
            <RediContext.Provider value={{ injector: inject }}>
                <SheetNumfmtPanel
                    value={{ defaultPattern: '', defaultValue: 123123, row: 2, col: 3 }}
                    onChange={(_pattern) => {
                        // empty
                    }}
                />
            </RediContext.Provider>
        );
    },
};
