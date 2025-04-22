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

import type { Meta, StoryObj } from '@storybook/react';
import type { Dependency } from '@univerjs/core';
import type { ISheetNumfmtPanelProps } from '../index';
import { LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { useContext, useState } from 'react';
import { UserHabitController } from '../../../controllers/user-habit.controller';
import enUS from '../../../locale/en-US';
import ruRU from '../../../locale/ru-RU';
import zhCN from '../../../locale/zh-CN';
import { SheetNumfmtPanel } from '../index';

const meta: Meta = {
    title: 'numfmt',
    parameters: {
        layout: 'centered',
    },
};

export default meta;

export const NumfmtPanel: StoryObj<ISheetNumfmtPanelProps> = {
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
                <div className="univer-w-[340px]">
                    <SheetNumfmtPanel
                        value={{ defaultPattern: '', defaultValue: 123123, row: 2, col: 3 }}
                        onChange={(_pattern) => {
                        // empty
                        }}
                    />
                </div>
            </RediContext.Provider>
        );
    },
};
