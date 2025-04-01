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

import type { IRangeThemeStyleItem, IRangeThemeStyleJSON } from '@univerjs/sheets';
import { BorderStyleTypes } from '@univerjs/core';

interface ITableDefaultThemeStyle {
    name: string;
    style: Omit<IRangeThemeStyleJSON, 'name'>;
}
export const tableDefaultBorderStyle = {
    s: BorderStyleTypes.THIN,
    cl: {
        rgb: 'rgb(95 101 116)',
    },
};

export const customEmptyThemeWithBorderStyle: Omit<IRangeThemeStyleJSON, 'name'> = {
    headerRowStyle: {
        bd: {
            t: tableDefaultBorderStyle,
        },
    },
    headerColumnStyle: {
        bd: {
            l: tableDefaultBorderStyle,
        },
    },
    lastColumnStyle: {
        bd: {
            r: tableDefaultBorderStyle,
        },
    },
    lastRowStyle: {
        bd: {
            b: tableDefaultBorderStyle,
        },
    },
};

export const processStyleWithBorderStyle = (key: keyof Omit<IRangeThemeStyleJSON, 'name'>, style: IRangeThemeStyleItem) => {
    if (key === 'headerRowStyle') {
        if (!style.bd) {
            return {
                ...style,
                bd: {
                    t: tableDefaultBorderStyle,
                },
            };
        }
    } else if (key === 'lastRowStyle') {
        if (!style.bd) {
            return {
                ...style,
                bd: {
                    b: tableDefaultBorderStyle,
                },
            };
        }
    } else if (key === 'lastColumnStyle') {
        if (!style.bd) {
            return {
                ...style,
                bd: {
                    r: tableDefaultBorderStyle,
                },
            };
        }
    } else if (key === 'headerColumnStyle') {
        if (!style.bd) {
            return {
                ...style,
                bd: {
                    l: tableDefaultBorderStyle,
                },
            };
        }
    }
    return style;
};

const tableDefaultThemeStyleArr = [
    [['#6280F9', '#FFFFFF', '#BAC6F8', '#D2DAFA'], ['#fff']],
    [['#16BDCA', '#FFFFFF', '#EDFAFA', '#AFECEF'], ['#000']],
    [['#31C48D', '#FFFFFF', '#F3FAF7', '#BCF0DA'], ['#fff']],
    [['#AC94FA', '#FFFFFF', '#F6F5FF', '#EDEBFE'], ['#fff']],
    [['#F17EBB', '#FFFFFF', '#FDF2F8', '#FCE8F3'], ['#fff']],
    [['#F98080', '#FFFFFF', '#FDF2F2', '#FDE8E8'], ['#fff']],
];

export const tableThemeConfig: ITableDefaultThemeStyle[] = tableDefaultThemeStyleArr.map((item, index) => {
    const [backgroundArr, colorArr] = item;
    const [headerRowBg, firstRowBg, secondRowBg, lastRowBg] = backgroundArr;
    const [headerCl] = colorArr;
    return {
        name: `table-default-${index}`,
        style: {
            headerRowStyle: {
                bg: {
                    rgb: headerRowBg,
                },
                cl: {
                    rgb: headerCl,
                },
                bd: {
                    t: tableDefaultBorderStyle,
                },
            },
            headerColumnStyle: {
                bd: {
                    l: tableDefaultBorderStyle,
                },
            },
            firstRowStyle: {
                bg: {
                    rgb: firstRowBg,
                },
            },
            secondRowStyle: {
                bg: {
                    rgb: secondRowBg,
                },
            },
            lastRowStyle: {
                bg: {
                    rgb: lastRowBg,
                },
                bd: {
                    b: tableDefaultBorderStyle,
                },
            },
            lastColumnStyle: {
                bd: {
                    r: tableDefaultBorderStyle,
                },
            },
        },
    };
});
