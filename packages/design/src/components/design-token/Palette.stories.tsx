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
import React from 'react';

import { defaultTheme, greenTheme } from '../../themes';

import styles from './index.module.less';

const themes: Record<string, Record<string, string>> = {
    default: defaultTheme,
    green: greenTheme,
};

const meta: Meta = {
    title: 'Design / Design Token',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

interface IProps {
    theme: Record<string, string>;
}

const levelMap = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

function convertToCSSVar(input: string): string {
    const dashCase = input.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/(\d+)/g, '-$1');

    return `--${dashCase}`;
}

export function Palette(props: IProps) {
    const { theme } = props;

    function generateColors(name: string, maxLevel: number) {
        const colors = [];
        for (let i = 0; i < maxLevel; i++) {
            colors.push(`${name}${levelMap[i]}`);
        }

        return colors;
    }

    const palettes = [
        {
            title: 'Brand / 品牌',
            colors: ['primaryColor', 'primaryColorHover'],
        },
        {
            title: 'Functional / 功能',
            colors: ['infoColor', 'successColor', 'warningColor', 'errorColor'],
        },
        {
            title: 'Text Color',
            colors: ['textColor', 'textColorSecondary', 'textColorSecondaryDarker', 'textColorTertiary'],
        },
        {
            title: 'Link',
            colors: ['linkColor'],
        },
        {
            title: 'Background',
            colors: ['bgColor', 'bgColorHover', 'bgColorSecondary'],
        },
        {
            title: 'Font Size',
            colors: ['fontSizeXs', 'fontSizeSm', 'fontSizeBase', 'fontSizeLg', 'fontSizeXl', 'fontSizeXxl'],
        },
        {
            title: 'Margin',
            colors: ['marginXs', 'marginXxs', 'marginSm', 'marginBase', 'marginLg', 'marginXl'],
        },
        {
            title: 'Padding',
            colors: ['paddingXs', 'paddingSm', 'paddingBase', 'paddingLg', 'paddingXl'],
        },
        {
            title: 'Border Color',
            colors: ['borderColor'],
        },
        {
            title: 'Scrollbar Color',
            colors: ['scrollbarColor', 'scrollbarColorHover', 'scrollbarColorActive'],
        },
        {
            title: 'Border Radius',
            colors: ['borderRadiusBase', 'borderRadiusLg', 'borderRadiusXl'],
        },
        {
            title: 'Box Shadow',
            colors: ['boxShadowBase', 'boxShadowLg'],
        },
        {
            title: 'Breakpoint',
            colors: ['breakpointXs', 'breakpointSm', 'breakpointBase', 'breakpointLg'],
        },
        {
            title: 'Loop Color',
            colors: [
                'loopColor1',
                'loopColor2',
                'loopColor3',
                'loopColor4',
                'loopColor5',
                'loopColor6',
                'loopColor7',
                'loopColor8',
                'loopColor9',
                'loopColor10',
                'loopColor11',
                'loopColor12',
            ],
        },
        {
            title: 'Ramu / 瑞木 / Red',
            colors: generateColors('red', 9),
        },
        {
            title: 'Hemerocallis / 萱草 / Orange',
            colors: generateColors('orange', 9),
        },
        {
            title: 'Marigold / 万寿菊 / Gold',
            colors: generateColors('gold', 9),
        },
        {
            title: 'Forsythia Suspensa / 连翘 / Yellow',
            colors: generateColors('yellow', 9),
        },
        {
            title: 'Eustoma Grandiflorum / 洋桔梗 / Verdancy',
            colors: generateColors('verdancy', 9),
        },
        {
            title: 'Asparagus Fern / 文竹 / Green',
            colors: generateColors('green', 9),
        },
        {
            title: '霁 / Jiqing',
            colors: generateColors('jiqing', 9),
        },
        {
            title: 'Cornflower / 矢车菊 / Blue',
            colors: generateColors('blue', 9),
        },
        {
            title: 'Hyacinth / 风信子 / Hyacinth Blue',
            colors: generateColors('hyacinth', 9),
        },
        {
            title: 'Violet / 紫罗兰 / Purple',
            colors: generateColors('purple', 9),
        },
        {
            title: 'Sorrel pulp / 酢浆 / Magenta',
            colors: generateColors('magenta', 9),
        },
        {
            title: '灰 / Grey',
            colors: generateColors('grey', 9),
        },
        {
            title: '黑 / 白 / Black / White',
            colors: ['colorBlack', 'colorWhite'],
        },
    ];

    return (
        <section className={styles.palette}>
            {palettes.map((palette) => (
                <section key={palette.title}>
                    <h3>{palette.title}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>name</th>
                                <th>value</th>
                                <th>CSS variable</th>
                            </tr>
                        </thead>

                        <tbody>
                            {palette.colors.map((color) => (
                                <tr key={color}>
                                    <td>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                        >
                                            {theme[color].startsWith('#') && (
                                                <div
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '16px',
                                                        height: '16px',
                                                        backgroundColor: theme[color],
                                                    }}
                                                />
                                            )}
                                            <code>{color}</code>
                                        </div>
                                    </td>
                                    <td>
                                        <code>{theme[color]}</code>
                                    </td>
                                    <td>
                                        <code>{convertToCSSVar(color)}</code>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            ))}
        </section>
    );
}

export const Playground: StoryObj = {
    render: (_, context) => <Palette theme={themes[context.globals.theme]} />,
};
