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

const lightGreenRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {
    headerRowStyle: {
        bg: {
            rgb: 'rgb(184,235,184)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    secondRowStyle: {
        bg: {
            rgb: 'rgb(214,241,214)',
        },
    },
    lastRowStyle: {
        bg: {
            rgb: 'rgb(184,235,184)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
};
export const lightGreenRangeThemeStyle = new RangeThemeStyle('light-green', lightGreenRangeThemeStyleJSON);

const middleGreenRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {
    headerRowStyle: {
        bg: {
            rgb: 'rgb(119,216,159)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    secondRowStyle: {
        bg: {
            rgb: 'rgb(214,241,214)',
        },
    },
    headerColumnStyle: {
        bg: {
            rgb: 'rgb(184,235,184)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
    lastColumnStyle: {
        bg: {
            rgb: 'rgb(184,235,184)',
        },
    },
    lastRowStyle: {
        bg: {
            rgb: 'rgb(119,216,159)',
        },
        bl: BooleanNumber.TRUE,
    },
};

export const middleGreenRangeThemeStyle = new RangeThemeStyle('middle-green', middleGreenRangeThemeStyleJSON);

const darkGreenRangeThemeStyleJSON: Omit<IRangeThemeStyleJSON, 'name'> = {
    headerRowStyle: {
        bg: {
            rgb: 'rgb(28,121,56)',
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
            rgb: 'rgb(28,121,56)',
        },
        cl: {
            rgb: 'rgb(255,255,255)',
        },
        ht: HorizontalAlign.CENTER,
        bl: BooleanNumber.TRUE,
    },
};

export const darkGreenRangeThemeStyle = new RangeThemeStyle('dark-green', darkGreenRangeThemeStyleJSON);
