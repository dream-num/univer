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

import { CellValueType, Direction, IUniverInstanceService, numfmt } from '@univerjs/core';
import type { Workbook } from '@univerjs/core';

import {
    chineseToNumber,
    fillChnNumber,
    fillChnWeek,
    fillCopy,
    fillExtendNumber,
    fillLoopSeries,
    fillSeries,
    getLoopSeriesInfo,
    isChnNumber,
    isChnWeek2,
    isChnWeek3,
    isEqualDiff,
    isLoopSeries,
    matchExtendNumber,
} from './tools';
import { APPLY_TYPE, DATA_TYPE } from './type';
import type { IAutoFillRule } from './type';

export const dateRule: IAutoFillRule = {
    type: DATA_TYPE.DATE,
    priority: 1100,
    match: (cellData, accessor) => {
        if (cellData?.f || cellData?.si) {
            return false;
        }

        if ((typeof cellData?.v === 'number' || cellData?.t === CellValueType.NUMBER)
            && cellData.s) {
            if (typeof cellData.s === 'string') {
                const workbook = accessor.get(IUniverInstanceService).getFocusedUnit() as Workbook;
                const style = workbook.getStyles().get(cellData.s);
                const pattern = style?.n?.pattern;
                if (pattern) {
                    return numfmt.getInfo(pattern).isDate;
                }
            } else if (cellData.s.n && numfmt.getInfo(cellData.s.n.pattern).isDate) {
                return true;
            }
        }
        return false;
    },
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.DATE) {
            return true;
        }
        return false;
    },
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (dataWithIndex, len, direction) => {
            const { data } = dataWithIndex;
            if (direction === Direction.LEFT || direction === Direction.UP) {
                data.reverse();
                return fillSeries(data, len, direction).reverse();
            }
            return fillSeries(data, len, direction);
        },
    },
};

export const numberRule: IAutoFillRule = {
    type: DATA_TYPE.NUMBER,
    priority: 1000,
    match: (cellData) => typeof cellData?.v === 'number' || cellData?.t === CellValueType.NUMBER,
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.NUMBER) {
            return true;
        }
        return false;
    },
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (dataWithIndex, len, direction) => {
            const { data } = dataWithIndex;
            if (direction === Direction.LEFT || direction === Direction.UP) {
                data.reverse();
                return fillSeries(data, len, direction).reverse();
            }
            return fillSeries(data, len, direction);
        },
    },
};

export const otherRule: IAutoFillRule = {
    type: DATA_TYPE.OTHER,
    priority: 0,
    match: () => true,
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.OTHER) {
            return true;
        }
        return false;
    },
};

export const extendNumberRule: IAutoFillRule = {
    type: DATA_TYPE.EXTEND_NUMBER,
    priority: 900,
    match: (cellData) => matchExtendNumber(`${cellData?.v}` || '').isExtendNumber,
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.EXTEND_NUMBER) {
            const { beforeTxt, afterTxt } = matchExtendNumber(`${prev.cellData?.v}` || '');
            const { beforeTxt: curBeforeTxt, afterTxt: curAfterTxt } = matchExtendNumber(`${cur?.v}` || '');
            if (beforeTxt === curBeforeTxt && afterTxt === curAfterTxt) {
                return true;
            }
        }
        return false;
    },
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (dataWithIndex, len, direction) => {
            const { data } = dataWithIndex;
            const isReverse = direction === Direction.UP || direction === Direction.LEFT;

            let step;
            if (data.length === 1) {
                step = isReverse ? -1 : 1;
                return reverseIfNeed(fillExtendNumber(data, len, step), isReverse);
            }
            const dataNumArr = [];

            for (let i = 0; i < data.length; i++) {
                const txt = `${data[i]?.v}`;
                txt && dataNumArr.push(Number(matchExtendNumber(txt).matchTxt));
            }

            if (isReverse) {
                data.reverse();
                dataNumArr.reverse();
            }

            if (isEqualDiff(dataNumArr)) {
                step = dataNumArr[1] - dataNumArr[0];
                return reverseIfNeed(fillExtendNumber(data, len, step), isReverse);
            }
            return fillCopy(data, len);
        },
    },
};

export const chnNumberRule: IAutoFillRule = {
    type: DATA_TYPE.CHN_NUMBER,
    priority: 830,
    match: (cellData) => {
        if (isChnNumber(`${cellData?.v}` || '')) {
            return true;
        }
        return false;
    },
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.CHN_NUMBER) {
            return true;
        }
        return false;
    },
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (dataWithIndex, len, direction) => {
            const { data } = dataWithIndex;

            const isReverse = direction === Direction.LEFT || direction === Direction.UP;
            if (data.length === 1) {
                const formattedValue = `${data[0]?.v}`;
                let step;
                if (!isReverse) {
                    step = 1;
                } else {
                    step = -1;
                }
                if (formattedValue && (formattedValue === '日' || chineseToNumber(formattedValue) < 7)) {
                    return reverseIfNeed(fillChnWeek(data, len, step), isReverse);
                }

                return reverseIfNeed(fillChnNumber(data, len, step), isReverse);
            }
            let hasWeek = false;
            for (let i = 0; i < data.length; i++) {
                const formattedValue = data[i]?.v;

                if (formattedValue === '日') {
                    hasWeek = true;
                    break;
                }
            }

            const dataNumArr = [];
            let weekIndex = 0;
            for (let i = 0; i < data.length; i++) {
                const formattedValue = `${data[i]?.v}`;
                if (formattedValue === '日') {
                    if (i === 0) {
                        dataNumArr.push(0);
                    } else {
                        weekIndex++;
                        dataNumArr.push(weekIndex * 7);
                    }
                } else if (hasWeek && chineseToNumber(formattedValue) > 0 && chineseToNumber(formattedValue) < 7) {
                    dataNumArr.push(chineseToNumber(formattedValue) + weekIndex * 7);
                } else {
                    dataNumArr.push(chineseToNumber(formattedValue));
                }
            }

            if (isReverse) {
                data.reverse();
                dataNumArr.reverse();
            }

            if (isEqualDiff(dataNumArr)) {
                if (
                    hasWeek ||
                    (dataNumArr[dataNumArr.length - 1] < 6 && dataNumArr[0] > 0) ||
                    (dataNumArr[0] < 6 && dataNumArr[dataNumArr.length - 1] > 0)
                ) {
                    // Fill with sequence of Monday~Sunday
                    const step = dataNumArr[1] - dataNumArr[0];
                    return reverseIfNeed(fillChnWeek(data, len, step), isReverse);
                }
                // Fill with sequence of Chinese lowercase numbers
                const step = dataNumArr[1] - dataNumArr[0];
                return reverseIfNeed(fillChnNumber(data, len, step), isReverse);
            }
            // Not an arithmetic progression, copy data
            return fillCopy(data, len);
        },
    },
};

export const chnWeek2Rule: IAutoFillRule = {
    type: DATA_TYPE.CHN_WEEK2,
    priority: 820,
    match: (cellData) => {
        if (isChnWeek2(`${cellData?.v}` || '')) {
            return true;
        }
        return false;
    },
    isContinue: (prev, cur) => prev.type === DATA_TYPE.CHN_WEEK2,
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (dataWithIndex, len, direction) => {
            const { data } = dataWithIndex;

            const isReverse = direction === Direction.LEFT || direction === Direction.UP;
            if (data.length === 1) {
                let step;
                if (!isReverse) {
                    step = 1;
                } else {
                    step = -1;
                }

                return reverseIfNeed(fillChnWeek(data, len, step, 1), isReverse);
            }
            const dataNumArr = [];
            let weekIndex = 0;

            for (let i = 0; i < data.length; i++) {
                const formattedValue = `${data[i]?.v}`;
                const lastTxt = formattedValue?.substr(formattedValue.length - 1, 1);
                if (formattedValue === '周日') {
                    if (i === 0) {
                        dataNumArr.push(0);
                    } else {
                        weekIndex++;
                        dataNumArr.push(weekIndex * 7);
                    }
                } else {
                    dataNumArr.push(chineseToNumber(lastTxt) + weekIndex * 7);
                }
            }

            if (isReverse) {
                data.reverse();
                dataNumArr.reverse();
            }

            if (isEqualDiff(dataNumArr)) {
                const step = dataNumArr[1] - dataNumArr[0];
                return reverseIfNeed(fillChnWeek(data, len, step, 1), isReverse);
            }
            return fillCopy(data, len);
        },
    },
};

export const chnWeek3Rule: IAutoFillRule = {
    type: DATA_TYPE.CHN_WEEK3,
    priority: 810,
    match: (cellData) => isChnWeek3(`${cellData?.v}` || ''),
    isContinue: (prev, cur) => prev.type === DATA_TYPE.CHN_WEEK3,
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (dataWithIndex, len, direction) => {
            const { data } = dataWithIndex;

            const isReverse = direction === Direction.LEFT || direction === Direction.UP;
            if (data.length === 1) {
                let step;
                if (!isReverse) {
                    step = 1;
                } else {
                    step = -1;
                }

                return reverseIfNeed(fillChnWeek(data, len, step, 2), isReverse);
            }
            const dataNumArr = [];
            let weekIndex = 0;

            for (let i = 0; i < data.length; i++) {
                const formattedValue = `${data[i]?.v}`;
                if (formattedValue) {
                    const lastTxt = formattedValue.substr(formattedValue.length - 1, 1);
                    if (formattedValue === '星期日') {
                        if (i === 0) {
                            dataNumArr.push(0);
                        } else {
                            weekIndex++;
                            dataNumArr.push(weekIndex * 7);
                        }
                    } else {
                        dataNumArr.push(chineseToNumber(lastTxt) + weekIndex * 7);
                    }
                }
            }

            if (isReverse) {
                data.reverse();
                dataNumArr.reverse();
            }

            if (isEqualDiff(dataNumArr)) {
                const step = dataNumArr[1] - dataNumArr[0];
                return reverseIfNeed(fillChnWeek(data, len, step, 2), isReverse);
            }
            return fillCopy(data, len);
        },
    },
};

export const loopSeriesRule: IAutoFillRule = {
    type: DATA_TYPE.LOOP_SERIES,
    priority: 800,
    match: (cellData) => isLoopSeries(`${cellData?.v}` || ''),
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.LOOP_SERIES) {
            return getLoopSeriesInfo(`${prev.cellData?.v}` || '').name === getLoopSeriesInfo(`${cur?.v}` || '').name;
        }
        return false;
    },
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (dataWithIndex, len, direction) => {
            const { data } = dataWithIndex;
            const isReverse = direction === Direction.LEFT || direction === Direction.UP;
            const { series } = getLoopSeriesInfo(`${data[0]?.v}` || '');
            if (data.length === 1) {
                let step;
                if (!isReverse) {
                    step = 1;
                } else {
                    step = -1;
                }

                return reverseIfNeed(fillLoopSeries(data, len, step, series), isReverse);
            }
            const dataNumArr = [];
            let cycleIndex = 0;
            for (let i = 0; i < data.length; i++) {
                const formattedValue = `${data[i]?.v}`;
                if (formattedValue) {
                    if (formattedValue === series[0]) {
                        if (i === 0) {
                            dataNumArr.push(0);
                        } else {
                            cycleIndex++;
                            dataNumArr.push(cycleIndex * series.length);
                        }
                    } else {
                        dataNumArr.push(series.indexOf(formattedValue) + cycleIndex * 7);
                    }
                }
            }

            if (isReverse) {
                data.reverse();
                dataNumArr.reverse();
            }

            if (isEqualDiff(dataNumArr)) {
                const step = dataNumArr[1] - dataNumArr[0];
                return reverseIfNeed(fillLoopSeries(data, len, step, series), isReverse);
            }
            return fillCopy(data, len);
        },
    },
};

export function reverseIfNeed<T>(data: T[], reverse: boolean): T[] {
    return reverse ? data.reverse() : data;
}
