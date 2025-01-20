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

import type { Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar';

const config: Omit<Config, 'content'> = {
    prefix: 'univer-',
    darkMode: 'selector',
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F3F5FF',
                    100: '#E9EDFF',
                    200: '#D2DAFA',
                    300: '#BAC6F8',
                    400: '#6280F9',
                    500: '#466AF7',
                    600: '#2C53F1',
                    700: '#143EE3',
                    800: '#083AD1',
                    900: '#1033BF',
                },
                gray: {
                    50: '#F9FAFB',
                    100: '#EEEFF1',
                    200: '#E3E5EA',
                    300: '#CDD0D8',
                    400: '#979DAC',
                    500: '#5F6574',
                    600: '#414657',
                    700: '#2C3040',
                    800: '#181C2A',
                    900: '#0E111E',
                },
                blue: {
                    50: '#EBF5FF',
                    100: '#E1EFFE',
                    200: '#C3DDFD',
                    300: '#A4CAFE',
                    400: '#76A9FA',
                    500: '#3F83F8',
                    600: '#1C64F2',
                    700: '#1A56DB',
                    800: '#1E429F',
                    900: '#233876',
                },
                red: {
                    50: '#FDF2F2',
                    100: '#FDE8E8',
                    200: '#FBD5D5',
                    300: '#F8B4B4',
                    400: '#F98080',
                    500: '#F05252',
                    600: '#E02424',
                    700: '#C81E1E',
                    800: '#9B1C1C',
                    900: '#771D1D',
                },
                orange: {
                    50: '#FFF8F1',
                    100: '#FEECDC',
                    200: '#FCD9BD',
                    300: '#FDBA8C',
                    400: '#FF8A4C',
                    500: '#FF5A1F',
                    600: '#D03801',
                    700: '#B43403',
                    800: '#8A2C0D',
                    900: '#771D1D',
                },
                yellow: {
                    50: '#FDFCEA',
                    100: '#FFF4B9',
                    200: '#FCDC6A',
                    300: '#FAC815',
                    400: '#F1B312',
                    500: '#D49D0F',
                    600: '#AB7F0E',
                    700: '#9A6D15',
                    800: '#725213',
                    900: '#634312',
                },
                green: {
                    50: '#F3FAF7',
                    100: '#DEF7EC',
                    200: '#BCF0DA',
                    300: '#84E1BC',
                    400: '#31C48D',
                    500: '#0DA471',
                    600: '#057A55',
                    700: '#046C4E',
                    800: '#03543F',
                    900: '#014737',
                },
                jiqing: {
                    50: '#EDFAFA',
                    100: '#D5F5F6',
                    200: '#AFECEF',
                    300: '#7EDCE2',
                    400: '#16BDCA',
                    500: '#0694A2',
                    600: '#047481',
                    700: '#036672',
                    800: '#05505C',
                    900: '#014451',
                },
                indigo: {
                    50: '#F3F5FF',
                    100: '#E9EDFF',
                    200: '#D2DAFA',
                    300: '#BAC6F8',
                    400: '#6280F9',
                    500: '#466AF7',
                    600: '#2C53F1',
                    700: '#143EE3',
                    800: '#083AD1',
                    900: '#1033BF',
                },
                purple: {
                    50: '#F6F5FF',
                    100: '#EDEBFE',
                    200: '#DCD7FE',
                    300: '#CABFFD',
                    400: '#AC94FA',
                    500: '#9061F9',
                    600: '#7E3AF2',
                    700: '#6C2BD9',
                    800: '#5521B5',
                    900: '#4A1D96',
                },
                pink: {
                    50: '#FDF2F8',
                    100: '#FCE8F3',
                    200: '#FAD1E8',
                    300: '#F8B4D9',
                    400: '#F17EB8',
                    500: '#E74694',
                    600: '#D61F69',
                    700: '#BF125D',
                    800: '#99154B',
                    900: '#751A3D',
                },
            },
        },
    },
    plugins: [
        scrollbar,
    ],
};

export default config;
