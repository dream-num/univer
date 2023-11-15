import { type Preview } from '@storybook/react';
import { defaultTheme, greenTheme, themeInstance } from '@univerjs/design';
import { connectInjector, useDependency } from '@wendellhu/redi/react-bindings';
import { Injector } from '@wendellhu/redi';
import { LocaleService, LocaleType } from '@univerjs/core';
import { useEffect } from 'react';

export const themes: Record<string, Record<string, string>> = {
    default: defaultTheme,
    green: greenTheme
}

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
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
        locale: {
            name: 'Internationalization',
            description: 'Internationalization locale',
            defaultValue: LocaleType.ZH_CN,
            toolbar: {
                icon: 'globe',
                items: [LocaleType.ZH_CN, LocaleType.EN_US],
                showName: true,
            }
        }
    },

    decorators: [(Story, context) => {
        const { theme, locale } = context.globals;
        themeInstance.setTheme(document.body, themes[theme]);

        const injector = new Injector([
            [LocaleService],
        ]);

        const App = connectInjector(function () {
                const localeService = useDependency(LocaleService);
                localeService.load({
                    [LocaleType.EN_US]: {
                    },
                    [LocaleType.ZH_CN]: {
                    }
                })

                useEffect(() => {
                    localeService.setLocale(locale);
                }, [])

                return <Story locale={locale} />
            },
            injector
        )

        return (
            <App />
        )
    }]
};

export default preview;
