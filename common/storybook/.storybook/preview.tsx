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

import React from 'react';
import type { Preview } from '@storybook/react';
import { ConfigProvider, defaultTheme, enUS, greenTheme, themeInstance, zhCN } from '@univerjs/design';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ErrorService,
    FloatingObjectManagerService,
    ICommandService,
    IConfigService,
    IContextService,
    IFloatingObjectManagerService,
    ILocalStorageService,
    ILogService,
    IPermissionService,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleInitializerService,
    LifecycleService,
    LocaleService,
    LocaleType,
    LocalUndoRedoService,
    PermissionService,
    ResourceManagerService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { RediContext } from '@wendellhu/redi/react-bindings';
import { DesktopLocalStorageService } from '@univerjs/ui';

export const themes: Record<string, Record<string, string>> = {
    default: defaultTheme,
    green: greenTheme,
};

const preview: Preview = {
    parameters: {
        // actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },

    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: 'default',
            toolbar: {
                icon: 'cog',
                items: Object.keys(themes),
                showName: true,
            },
        },
        i18n: {
            name: 'i18n',
            description: 'Global theme for components',
            defaultValue: LocaleType.ZH_CN,
            toolbar: {
                icon: 'globe',
                items: [LocaleType.ZH_CN, LocaleType.EN_US],
                showName: true,
            },
        },
    },

    decorators: [(Story, context) => {
        const injector = new Injector([
            [IUniverInstanceService, { useClass: UniverInstanceService }],
            [ErrorService],
            [LocaleService],
            [ThemeService],
            [LifecycleService],
            [LifecycleInitializerService],
            [ILogService, { useClass: DesktopLogService, lazy: true }],
            [ICommandService, { useClass: CommandService, lazy: true }],
            [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
            [IConfigService, { useClass: ConfigService }],
            [IContextService, { useClass: ContextService }],
            [IFloatingObjectManagerService, { useClass: FloatingObjectManagerService, lazy: true }],
            [IResourceManagerService, { useClass: ResourceManagerService, lazy: true }],
            [IPermissionService, { useClass: PermissionService }],

            // services
            [ILocalStorageService, { useClass: DesktopLocalStorageService, lazy: true }],
        ]);

        injector.get(LocaleService).setLocale(context.globals.i18n);
        themeInstance.setTheme(document.body, themes[context.globals.theme]);
        const designLocale = context.globals.i18n === LocaleType.ZH_CN ? zhCN : enUS;

        return (
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider locale={designLocale} mountContainer={document.body}>
                    <Story />
                </ConfigProvider>
            </RediContext.Provider>
        );
    }],
};

export default preview;
