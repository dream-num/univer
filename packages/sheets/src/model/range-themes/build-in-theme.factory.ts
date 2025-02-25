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

import { BooleanNumber, HorizontalAlign } from '@univerjs/core';
import { RangeThemeStyle } from '../range-theme-util';

export const lightRangeThemeBuilder = (baseName: string, header: string, color: string) => {
    return new RangeThemeStyle(`light-${baseName}`, {
        headerRowStyle: {
            bg: {
                rgb: header,
            },
        },
        firstColumnStyle: {
            bg: {
                rgb: 'rgb(255, 255, 255)',
            },
        },
        secondColumnStyle: {
            bg: {
                rgb: color,
            },
        },
        lastRowStyle: {
            bg: {
                rgb: header,
            },
        },
    });
};
export const middleRangeThemeBuilder = (baseName: string, rowHeader: string, colHeader: string) => {
    return new RangeThemeStyle(`middle-${baseName}`, {
        headerRowStyle: {
            bg: {
                rgb: rowHeader,
            },
        },
        headerColumnStyle: {
            bg: {
                rgb: colHeader,
            },
        },
        secondRowStyle: {
            bg: {
                rgb: colHeader,
            },
        },
        lastRowStyle: {
            bg: {
                rgb: rowHeader,
            },
        },
        lastColumnStyle: {
            bg: {
                rgb: colHeader,
            },
        },
    });
};

export const darkRangeThemeBuilder = (baseName: string, rowHeader: string, firstRow: string, secondRow: string) => {
    return new RangeThemeStyle(`dark-${baseName}`, {
        headerRowStyle: {
            bg: {
                rgb: rowHeader,
            },
            cl: {
                rgb: 'rgb(255, 255, 255)',
            },
            ht: HorizontalAlign.CENTER,
            bl: BooleanNumber.TRUE,
        },
        firstRowStyle: {
            bg: {
                rgb: firstRow,
            },
        },
        secondRowStyle: {
            bg: {
                rgb: secondRow,
            },
        },
        lastRowStyle: {
            bg: {
                rgb: rowHeader,
            },
        },
    });
};

const lightConfig = [
    {
        baseName: 'blue',
        header: 'rgb(164, 202, 254)',
        color: 'rgb(225, 239, 254)',
    },
    {
        baseName: 'grey',
        header: 'rgb(205, 208, 216)',
        color: 'rgb(238, 239, 241)',
    },
    {
        baseName: 'red',
        header: 'rgb(248, 180, 180)',
        color: 'rgb(253, 232, 232)',
    },
    {
        baseName: 'orange',
        header: 'rgb(253, 186, 140)',
        color: 'rgb(254, 236, 220)',
    },
    {
        baseName: 'yellow',
        header: 'rgb(250, 200, 21)',
        color: 'rgb(255, 244, 185)',
    },
    {
        baseName: 'green',
        header: 'rgb(132, 225, 188)',
        color: 'rgb(222, 247, 236)',
    },

    {
        baseName: 'azure',
        header: 'rgb(126, 220, 226)',
        color: 'rgb(213, 245, 246)',
    },
    {
        baseName: 'indigo',
        header: 'rgb(186, 198, 248)',
        color: 'rgb(233, 237, 255)',
    },
    {
        baseName: 'purple',
        header: 'rgb(202, 191, 253)',
        color: 'rgb(237, 235, 254)',
    },
    {
        baseName: 'magenta',
        header: 'rgb(248, 180, 217)',
        color: 'rgb(252, 232, 243)',
    },
];

const middleConfig = [
    {
        baseName: 'blue',
        rowHeader: 'rgb(63, 131, 248)',
        colHeader: 'rgb(195, 221, 253)',
    },
    {
        baseName: 'grey',
        rowHeader: 'rgb(95, 101, 116)',
        colHeader: 'rgb(227, 229, 234)',
    },
    {
        baseName: 'red',
        rowHeader: 'rgb(240, 82, 82)',
        colHeader: 'rgb(251, 213, 213)',
    },
    {
        baseName: 'orange',
        rowHeader: 'rgb(255, 90, 31)',
        colHeader: 'rgb(252, 217, 189)',
    },
    {
        baseName: 'yellow',
        rowHeader: 'rgb(212, 157, 15)',
        colHeader: 'rgb(252, 220, 106)',
    },
    {
        baseName: 'green',
        rowHeader: 'rgb(13, 164, 113)',
        colHeader: 'rgb(188, 240, 218)',
    },
    {
        baseName: 'azure',
        rowHeader: 'rgb(6, 148, 162)',
        colHeader: 'rgb(175, 236, 239)',
    },
    {
        baseName: 'indigo',
        rowHeader: 'rgb(70, 106, 247)',
        colHeader: 'rgb(210, 218, 250)',
    },
    {
        baseName: 'purple',
        rowHeader: 'rgb(144, 97, 249)',
        colHeader: 'rgb(220, 215, 254)',
    },
    {
        baseName: 'magenta',
        rowHeader: 'rgb(231, 70, 148)',
        colHeader: 'rgb(250, 209, 232)',
    },
];

const darkConfig = [
    {
        baseName: 'blue',
        rowHeader: 'rgb(30, 66, 159)',
        firstRow: 'rgb(195, 221, 253)',
        secondRow: 'rgb(118, 169, 250)',
    },
    {
        baseName: 'grey',
        rowHeader: 'rgb(44, 48, 64)',
        firstRow: 'rgb(227, 229, 234)',
        secondRow: 'rgb(151, 157, 172)',
    },
    {
        baseName: 'red',
        rowHeader: 'rgb(155, 28, 28)',
        firstRow: 'rgb(251, 213, 213)',
        secondRow: 'rgb(249, 128, 128)',
    },
    {
        baseName: 'orange',
        rowHeader: 'rgb(180, 52, 3)',
        firstRow: 'rgb(252, 217, 189)',
        secondRow: 'rgb(255, 138, 76)',
    },
    {
        baseName: 'yellow',
        rowHeader: 'rgb(154, 109, 21)',
        firstRow: 'rgb(252, 220, 106)',
        secondRow: 'rgb(212, 157, 15)',
    },
    {
        baseName: 'green',
        rowHeader: 'rgb(4, 108, 78)',
        firstRow: 'rgb(188, 240, 218)',
        secondRow: 'rgb(49, 196, 141)',
    },
    {
        baseName: 'azure',
        rowHeader: 'rgb(3, 102, 114)',
        firstRow: 'rgb(175, 236, 239)',
        secondRow: 'rgb(22, 189, 202)',
    },
    {
        baseName: 'indigo',
        rowHeader: 'rgb(16, 51, 191)',
        firstRow: 'rgb(210, 218, 250)',
        secondRow: 'rgb(98, 128, 249)',
    },
    {
        baseName: 'purple',
        rowHeader: 'rgb(74, 29, 150)',
        firstRow: 'rgb(220, 215, 254)',
        secondRow: 'rgb(172, 148, 250)',
    },
    {
        baseName: 'magenta',
        rowHeader: 'rgb(153, 21, 75)',
        firstRow: 'rgb(250, 209, 232)',
        secondRow: 'rgb(241, 126, 184)',
    },
];

const lightThemes = lightConfig.map(({ baseName, header, color }) => {
    return lightRangeThemeBuilder(baseName, header, color);
});

const middleThemes = middleConfig.map(({ baseName, rowHeader, colHeader }) => {
    return middleRangeThemeBuilder(baseName, rowHeader, colHeader);
});

const darkThemes = darkConfig.map(({ baseName, rowHeader, firstRow, secondRow }) => {
    return darkRangeThemeBuilder(baseName, rowHeader, firstRow, secondRow);
});

export const buildInThemes = [
    ...lightThemes,
    ...middleThemes,
    ...darkThemes,
];
