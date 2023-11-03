import { Direction, ICellData, Nullable } from '@univerjs/core';

import {
    chineseToNumber,
    fillChnNumber,
    fillChnWeek,
    fillCopy,
    fillExtendNumber,
    fillSeries,
    isChnNumber,
    isChnWeek2,
    isEqualDiff,
    matchExtendNumber,
} from '../../Basics/fill-tools';
import { APPLY_TYPE } from './auto-fill.service';

export enum DATA_TYPE {
    NUMBER = 'number',
    DATE = 'date',
    EXTEND_NUMBER = 'extendNumber',
    CHN_NUMBER = 'chnNumber',
    CHN_WEEK2 = 'chnWeek2',
    CHN_WEEK3 = 'chnWeek3',
    OTHER = 'other',
}

export type ICopyDataPiece = {
    [key in DATA_TYPE]?: ICopyDataInType[];
};

export interface ICopyDataInType {
    data: Array<Nullable<ICellData>>;
    index: ICopyDataInTypeIndexInfo;
}

export type ICopyDataInTypeIndexInfo = number[];

export interface IAutoFillRule {
    type: DATA_TYPE;
    match: (cellData: Nullable<ICellData>) => boolean;
    isContinue: (prev: IRuleConfirmedData, cur: Nullable<ICellData>) => boolean;
    applyFunctions?: APPLY_FUNCTIONS;
}

export interface IRuleConfirmedData {
    type?: DATA_TYPE;
    cellData: Nullable<ICellData>;
}

export type APPLY_FUNCTIONS = {
    [key in APPLY_TYPE]?: (data: Array<Nullable<ICellData>>, len: number, direction: Direction) => ICellData[];
};

export const numberRule: IAutoFillRule = {
    type: DATA_TYPE.NUMBER,
    match: (cellData) => typeof cellData?.v === 'number',
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.NUMBER) {
            return true;
        }
        return false;
    },
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (data, len, direction) => {
            if (direction === Direction.LEFT || direction === Direction.UP) {
                data.reverse();
            }
            return fillSeries(data, len, direction);
        },
    },
};

export const otherRule: IAutoFillRule = {
    type: DATA_TYPE.OTHER,
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
    match: (cellData) => matchExtendNumber(cellData?.m || '').isExtendNumber,
    isContinue: (prev, cur) => {
        if (prev.type === DATA_TYPE.EXTEND_NUMBER) {
            const { beforeTxt, afterTxt } = matchExtendNumber(prev.cellData?.m || '');
            const { beforeTxt: curBeforeTxt, afterTxt: curAfterTxt } = matchExtendNumber(cur?.m || '');
            if (beforeTxt === curBeforeTxt && afterTxt === curAfterTxt) {
                return true;
            }
        }
        return false;
    },
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (data, len, direction) => {
            let step;
            if (data.length === 1) {
                step = direction === Direction.DOWN || direction === Direction.RIGHT ? 1 : -1;
                return fillExtendNumber(data, len, step);
            }
            const dataNumArr = [];

            for (let i = 0; i < data.length; i++) {
                const txt = data[i]?.m;
                txt && dataNumArr.push(Number(matchExtendNumber(txt).matchTxt));
            }

            if (direction === Direction.UP || direction === Direction.LEFT) {
                data.reverse();
                dataNumArr.reverse();
            }

            if (isEqualDiff(dataNumArr)) {
                step = dataNumArr[1] - dataNumArr[0];
                return fillExtendNumber(data, len, step);
            }
            return fillCopy(data, len);
        },
    },
};

export const chnNumberRule: IAutoFillRule = {
    type: DATA_TYPE.CHN_NUMBER,
    match: (cellData) => {
        if (isChnNumber(cellData?.m || '')) {
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
        [APPLY_TYPE.SERIES]: (data, len, direction) => {
            const isReverse = direction === Direction.LEFT || direction === Direction.UP;
            if (data.length === 1) {
                const formattedValue = data[0]?.m;
                let step;
                if (!isReverse) {
                    step = 1;
                } else {
                    step = -1;
                }
                if (formattedValue && (formattedValue === '日' || chineseToNumber(formattedValue) < 7)) {
                    return fillChnWeek(data, len, step);
                }

                return fillChnNumber(data, len, step);
            }
            let hasWeek = false;
            for (let i = 0; i < data.length; i++) {
                const formattedValue = data[i]?.m;

                if (formattedValue === '日') {
                    hasWeek = true;
                    break;
                }
            }

            const dataNumArr = [];
            let weekIndex = 0;
            for (let i = 0; i < data.length; i++) {
                const formattedValue = data[i]?.m;
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
                    return fillChnWeek(data, len, step);
                }
                // Fill with sequence of Chinese lowercase numbers
                const step = dataNumArr[1] - dataNumArr[0];
                return fillChnNumber(data, len, step);
            }
            // Not an arithmetic progression, copy data
            return fillCopy(data, len);
        },
    },
};

export const chnWeek2Rule: IAutoFillRule = {
    type: DATA_TYPE.CHN_WEEK2,
    match: (cellData) => {
        if (isChnWeek2(cellData?.m || '')) {
            return true;
        }
        return false;
    },
    isContinue: (prev, cur) => prev.type === DATA_TYPE.CHN_WEEK2,
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (data, len, direction) => {
            const isReverse = direction === Direction.LEFT || direction === Direction.UP;
            if (data.length === 1) {
                let step;
                if (!isReverse) {
                    step = 1;
                } else {
                    step = -1;
                }

                return fillChnWeek(data, len, step, 1);
            }
            const dataNumArr = [];
            let weekIndex = 0;

            for (let i = 0; i < data.length; i++) {
                const formattedValue = data[i]?.m;
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
                return fillChnWeek(data, len, step, 1);
            }
            return fillCopy(data, len);
        },
    },
};

export const chnWeek3Rule: IAutoFillRule = {
    type: DATA_TYPE.CHN_WEEK3,
    match: (cellData) => isChnWeek2(cellData?.m || ''),
    isContinue: (prev, cur) => prev.type === DATA_TYPE.CHN_WEEK3,
    applyFunctions: {
        [APPLY_TYPE.SERIES]: (data, len, direction) => {
            const isReverse = direction === Direction.LEFT || direction === Direction.UP;
            if (data.length === 1) {
                let step;
                if (!isReverse) {
                    step = 1;
                } else {
                    step = -1;
                }

                return fillChnWeek(data, len, step, 2);
            }
            const dataNumArr = [];
            let weekIndex = 0;

            for (let i = 0; i < data.length; i++) {
                const formattedValue = data[i]?.m;
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
                return fillChnWeek(data, len, step, 2);
            }
            return fillCopy(data, len);
        },
    },
};
