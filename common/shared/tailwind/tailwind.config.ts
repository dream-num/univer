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
import { defaultTheme } from '@univerjs/themes';
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
            colors: defaultTheme,
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
