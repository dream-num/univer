import { defaultSkin } from '../src/Basics/CSS';

const currentSkin = Object.fromEntries(Object.keys(defaultSkin).map((item) => [`--${item.replace(/([A-Z0-9])/g, '-$1').toLowerCase()}`, defaultSkin[item]]));

document.documentElement.style.cssText = Object.keys(currentSkin).map((item) => `${item}: ${currentSkin[item]};`).join(' ');

/** @type { import('@storybook/react').Preview } */
const preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
};

export default preview;
