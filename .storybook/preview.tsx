import React from 'react';
import { type Preview } from '@storybook/react';
import { defaultTheme, greenTheme, themeInstance } from '@univerjs/design';

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
    },

    decorators: [(Story, context) => {
        themeInstance.setTheme(document.body, themes[context.globals.theme]);

        return (
            <Story />
        )
    }]
};

export default preview;
