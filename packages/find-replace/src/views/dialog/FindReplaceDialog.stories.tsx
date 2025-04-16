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
import type { Dependency } from '@univerjs/core';
import { LocaleService, LocaleType } from '@univerjs/core';
import { DesktopLayoutService, ILayoutService, RediContext } from '@univerjs/ui';

import React, { useContext, useMemo, useState } from 'react';
import { FindReplaceController } from '../../controllers/find-replace.controller';
import enUS from '../../locale/en-US';
import ruRU from '../../locale/ru-RU';
import zhCN from '../../locale/zh-CN';
import { FindReplaceService, IFindReplaceService } from '../../services/find-replace.service';
import { FindReplaceDialog } from './FindReplaceDialog';

const meta: Meta = {
    title: 'Find Replace Dialog',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

function FindDialogDemo() {
    const { injector } = useContext(RediContext);

    const [inject] = useState(() => {
        const deps: Dependency[] = [
            [IFindReplaceService, { useClass: FindReplaceService }],
            [ILayoutService, { useClass: DesktopLayoutService }],
            [FindReplaceController],
        ];

        injector?.get(LocaleService).load({
            [LocaleType.EN_US]: enUS,
            [LocaleType.ZH_CN]: zhCN,
            [LocaleType.RU_RU]: ruRU,
        });

        deps.forEach((dependency) => injector?.add(dependency));

        return injector;
    });

    const memoizedValue = useMemo(() => ({ injector: inject }), [inject]);

    return (
        <RediContext.Provider value={memoizedValue}>
            <FindReplaceDialog />
        </RediContext.Provider>
    );
}

export const FindDialog = {
    render() {
        return <FindDialogDemo />;
    },
};

function ReplaceDialogDemo() {
    const { injector } = useContext(RediContext);

    const [inject] = useState(() => {
        const deps: Dependency[] = [
            [IFindReplaceService, { useClass: FindReplaceService }],
            [ILayoutService, { useClass: DesktopLayoutService }],
            [FindReplaceController],
        ];

        injector?.get(LocaleService).load({
            [LocaleType.EN_US]: enUS,
            [LocaleType.ZH_CN]: zhCN,
            [LocaleType.RU_RU]: ruRU,
        });

        deps.forEach((dependency) => injector?.add(dependency));

        return injector;
    });

    const memoizedValue = useMemo(() => ({ injector: inject }), [inject]);

    return (
        <RediContext.Provider value={memoizedValue}>
            <FindReplaceDialog />
        </RediContext.Provider>
    );
}

export const ReplaceDialog = {
    render() {
        return <ReplaceDialogDemo />;
    },
};
