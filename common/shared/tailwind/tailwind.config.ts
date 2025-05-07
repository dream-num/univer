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

import type { Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar';
import remToPx from 'tailwindcss-rem-to-px';

const config: Omit<Config, 'content'> = {
    prefix: 'univer-',
    darkMode: 'selector',
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                white: 'var(--univer-white)',
                black: 'var(--univer-black)',
                primary: {
                    50: 'var(--univer-primary-50)',
                    100: 'var(--univer-primary-100)',
                    200: 'var(--univer-primary-200)',
                    300: 'var(--univer-primary-300)',
                    400: 'var(--univer-primary-400)',
                    500: 'var(--univer-primary-500)',
                    600: 'var(--univer-primary-600)',
                    700: 'var(--univer-primary-700)',
                    800: 'var(--univer-primary-800)',
                    900: 'var(--univer-primary-900)',
                },
                gray: {
                    50: 'var(--univer-gray-50)',
                    100: 'var(--univer-gray-100)',
                    200: 'var(--univer-gray-200)',
                    300: 'var(--univer-gray-300)',
                    400: 'var(--univer-gray-400)',
                    500: 'var(--univer-gray-500)',
                    600: 'var(--univer-gray-600)',
                    700: 'var(--univer-gray-700)',
                    800: 'var(--univer-gray-800)',
                    900: 'var(--univer-gray-900)',
                },
                blue: {
                    50: 'var(--univer-blue-50)',
                    100: 'var(--univer-blue-100)',
                    200: 'var(--univer-blue-200)',
                    300: 'var(--univer-blue-300)',
                    400: 'var(--univer-blue-400)',
                    500: 'var(--univer-blue-500)',
                    600: 'var(--univer-blue-600)',
                    700: 'var(--univer-blue-700)',
                    800: 'var(--univer-blue-800)',
                    900: 'var(--univer-blue-900)',
                },
                red: {
                    50: 'var(--univer-red-50)',
                    100: 'var(--univer-red-100)',
                    200: 'var(--univer-red-200)',
                    300: 'var(--univer-red-300)',
                    400: 'var(--univer-red-400)',
                    500: 'var(--univer-red-500)',
                    600: 'var(--univer-red-600)',
                    700: 'var(--univer-red-700)',
                    800: 'var(--univer-red-800)',
                    900: 'var(--univer-red-900)',
                },
                orange: {
                    50: 'var(--univer-orange-50)',
                    100: 'var(--univer-orange-100)',
                    200: 'var(--univer-orange-200)',
                    300: 'var(--univer-orange-300)',
                    400: 'var(--univer-orange-400)',
                    500: 'var(--univer-orange-500)',
                    600: 'var(--univer-orange-600)',
                    700: 'var(--univer-orange-700)',
                    800: 'var(--univer-orange-800)',
                    900: 'var(--univer-orange-900)',
                },
                yellow: {
                    50: 'var(--univer-yellow-50)',
                    100: 'var(--univer-yellow-100)',
                    200: 'var(--univer-yellow-200)',
                    300: 'var(--univer-yellow-300)',
                    400: 'var(--univer-yellow-400)',
                    500: 'var(--univer-yellow-500)',
                    600: 'var(--univer-yellow-600)',
                    700: 'var(--univer-yellow-700)',
                    800: 'var(--univer-yellow-800)',
                    900: 'var(--univer-yellow-900)',
                },
                green: {
                    50: 'var(--univer-green-50)',
                    100: 'var(--univer-green-100)',
                    200: 'var(--univer-green-200)',
                    300: 'var(--univer-green-300)',
                    400: 'var(--univer-green-400)',
                    500: 'var(--univer-green-500)',
                    600: 'var(--univer-green-600)',
                    700: 'var(--univer-green-700)',
                    800: 'var(--univer-green-800)',
                    900: 'var(--univer-green-900)',
                },
                jiqing: {
                    50: 'var(--univer-jiqing-50)',
                    100: 'var(--univer-jiqing-100)',
                    200: 'var(--univer-jiqing-200)',
                    300: 'var(--univer-jiqing-300)',
                    400: 'var(--univer-jiqing-400)',
                    500: 'var(--univer-jiqing-500)',
                    600: 'var(--univer-jiqing-600)',
                    700: 'var(--univer-jiqing-700)',
                    800: 'var(--univer-jiqing-800)',
                    900: 'var(--univer-jiqing-900)',
                },
                indigo: {
                    50: 'var(--univer-indigo-50)',
                    100: 'var(--univer-indigo-100)',
                    200: 'var(--univer-indigo-200)',
                    300: 'var(--univer-indigo-300)',
                    400: 'var(--univer-indigo-400)',
                    500: 'var(--univer-indigo-500)',
                    600: 'var(--univer-indigo-600)',
                    700: 'var(--univer-indigo-700)',
                    800: 'var(--univer-indigo-800)',
                    900: 'var(--univer-indigo-900)',
                },
                purple: {
                    50: 'var(--univer-purple-50)',
                    100: 'var(--univer-purple-100)',
                    200: 'var(--univer-purple-200)',
                    300: 'var(--univer-purple-300)',
                    400: 'var(--univer-purple-400)',
                    500: 'var(--univer-purple-500)',
                    600: 'var(--univer-purple-600)',
                    700: 'var(--univer-purple-700)',
                    800: 'var(--univer-purple-800)',
                    900: 'var(--univer-purple-900)',
                },
                pink: {
                    50: 'var(--univer-pink-50)',
                    100: 'var(--univer-pink-100)',
                    200: 'var(--univer-pink-200)',
                    300: 'var(--univer-pink-300)',
                    400: 'var(--univer-pink-400)',
                    500: 'var(--univer-pink-500)',
                    600: 'var(--univer-pink-600)',
                    700: 'var(--univer-pink-700)',
                    800: 'var(--univer-pink-800)',
                    900: 'var(--univer-pink-900)',
                },
            },
            boxShadow: {
                sm: '0px 1px 2px 0px rgba(30, 40, 77, 0.08)',
                md: '0px 1px 6px -2px rgba(30, 40, 77, 0.08), 0px 2px 6px -1px rgba(30, 40, 77, 0.10)',
                lg: '0px 4px 6px 0px rgba(30, 40, 77, 0.05), 0px 10px 15px -3px rgba(30, 40, 77, 0.10)',
                xl: '0px 10px 10px 0px rgba(30, 40, 77, 0.04), 0px 20px 24px -5px rgba(30, 40, 77, 0.10)',
                '2xl': '0px 24px 50px -12px rgba(30, 40, 77, 0.24)',
            },
        },
    },
    plugins: [
        scrollbar,
        remToPx,
    ],
};

export default config;
