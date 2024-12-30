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

import type { IRangeThemeStyleJSON } from '../range-theme-util';
import { BooleanNumber, BorderStyleTypes, HorizontalAlign } from '@univerjs/core';
import { RangeThemeStyle } from '../range-theme-util';

const lightBlueRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {

    headerRowStyle: {
        bg: {
            rgb: 'rgb(184,216,235)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    secondRowStyle: {
        bg: {
            rgb: 'rgb(214,231,241)',
        },
    },
    lastRowStyle: {
        bg: {
            rgb: 'rgb(184,216,235)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },

};
export const lightBlueRangeThemeStyle = new RangeThemeStyle('light-blue', lightBlueRangeThemeStyleJSON);

const middleBlueRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {

    headerRowStyle: {
        bg: {
            rgb: 'rgb(119,159,216)',
        },
        // cl: {
        //     rgb: 'rgb(255,255,255)',
        // },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    secondRowStyle: {
        bg: {
            rgb: 'rgb(214,231,241)',
        },
    },
    headerColumnStyle: {
        bg: {
            rgb: 'rgb(184,216,235)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    lastColumnStyle: {
        bg: {
            rgb: 'rgb(184,216,235)',
        },
    },
    lastRowStyle: {
        bg: {
            rgb: 'rgb(119,159,216)',
        },
        bl: BooleanNumber.TRUE,
    },
};

export const middleBlueRangeThemeStyle = new RangeThemeStyle('middle-blue', middleBlueRangeThemeStyleJSON);

const darkBlueRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {

    headerRowStyle: {
        bg: {
            rgb: 'rgb(28,56,121)',
        },
        cl: {
            rgb: 'rgb(255,255,255)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    secondRowStyle: {
        bg: {
            rgb: 'rgb(239,239,239)',
        },
    },
    lastRowStyle: {
        bd: {
            t: {
                s: BorderStyleTypes.THIN,
                cl: {
                    rgb: 'rgb(255,255,255)',
                },
            },
        },
        bg: {
            rgb: 'rgb(28,56,121)',
        },
        cl: {
            rgb: 'rgb(255,255,255)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },

};

export const darkBlueRangeThemeStyle = new RangeThemeStyle('dark-blue', darkBlueRangeThemeStyleJSON);

