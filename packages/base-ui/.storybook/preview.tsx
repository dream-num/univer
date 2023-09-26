import React from 'react';
import { type Preview } from '@storybook/react';
import { defaultTheme } from '../src/Basics/CSS';
import { ThemeService } from '@univerjs/core'

const themeService = new ThemeService();

const themes = {
    default: defaultTheme,
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
        themeService.setTheme(themes[context.globals.theme]);

        return (
            <Story />
        )
    }]
};

export default preview;
