import type { Preview } from '@storybook/react';
import type { Theme } from '@univerjs/themes';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ErrorService,
    ICommandService,
    IConfigService,
    IContextService,
    ILocalStorageService,
    ILogService,
    Injector,
    IPermissionService,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleService,
    LocaleService,
    LocaleType,
    LocalUndoRedoService,
    PermissionService,
    ResourceManagerService,
    ThemeService,
    UniverInstanceService,
} from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import enUS from '@univerjs/design/locale/en-US';
import zhCN from '@univerjs/design/locale/zh-CN';
import { defaultTheme, greenTheme } from '@univerjs/themes';
import { DesktopLocalStorageService, RediContext, ThemeSwitcherService } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';
import './global.css';

export const themes: Record<string, Theme> = {
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
        backgrounds: {
            values: [
                { name: 'Light', value: '#F9FAFB' },
            ],
            default: 'Light',
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
            },
        },
        i18n: {
            name: 'i18n',
            description: 'Global theme for components',
            defaultValue: LocaleType.ZH_CN,
            toolbar: {
                icon: 'globe',
                items: [LocaleType.ZH_CN, LocaleType.EN_US],
            },
        },
        darkMode: {
            name: 'darkMode',
            description: 'Dark mode',
            defaultValue: 'light',
            toolbar: {
                icon: 'sun',
                items: ['light', 'dark'],
            },
        },
    },

    decorators: [(Story, context) => {
        // themeInstance.setTheme(document.body, themes[context.globals.theme]);
        const designLocale = context.globals.i18n === LocaleType.ZH_CN ? zhCN.design : enUS.design;

        if (context.globals.darkMode === 'dark') {
            document.body.classList.add('univer-dark');
        } else {
            document.body.classList.remove('univer-dark');
        }

        const rediContext = useMemo(() => {
            const injector = new Injector([
                [ThemeSwitcherService],
                [IUniverInstanceService, { useClass: UniverInstanceService }],
                [ErrorService],
                [LocaleService],
                [ThemeService],
                [LifecycleService],
                [ILogService, { useClass: DesktopLogService, lazy: true }],
                [ICommandService, { useClass: CommandService, lazy: true }],
                [IUndoRedoService, { useClass: LocalUndoRedoService, lazy: true }],
                [IConfigService, { useClass: ConfigService }],
                [IContextService, { useClass: ContextService }],
                [IResourceManagerService, { useClass: ResourceManagerService, lazy: true }],
                [IPermissionService, { useClass: PermissionService }],

                // services
                [ILocalStorageService, { useClass: DesktopLocalStorageService, lazy: true }],
            ]);

            injector.get(LocaleService).setLocale(context.globals.i18n);
            return {
                injector,
            };
        }, []);

        useEffect(() => {
            const theme = themes[context.globals.theme];

            rediContext.injector.get(ThemeSwitcherService).injectThemeToHead(theme);
        }, [context.globals.theme]);

        return (
            <RediContext.Provider value={rediContext}>
                <ConfigProvider locale={designLocale} mountContainer={document.body}>
                    <Story />
                </ConfigProvider>
            </RediContext.Provider>
        );
    }],
};

export default preview;
