import { Direction, ICellData, Nullable, ObjectMatrix, Tools } from '@univerjs/core';

export const chnNumChar = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
export const chnNumChar2 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const chnUnitSection = ['', '万', '亿', '万亿', '亿亿'];
export const chnUnitChar = ['', '十', '百', '千'];
export enum APPLY_TYPE {
    COPY = '0',
    SERIES = '1',
    ONLY_FORMAT = '2',
    NO_FORMAT = '3',
}

export enum DATA_TYPE {
    NUMBER = 'number',
    DATE = 'date',
    EXTEND_NUMBER = 'extendNumber',
    CHN_NUMBER = 'chnNumber',
    CHN_WEEK2 = 'chnWeek2',
    CHN_WEEK3 = 'chnWeek3',
    OTHER = 'other',
}

export type ICopyDataPiece = Record<DATA_TYPE, ICopyDataInType[]>;

export interface ICopyDataInType {
    data: Array<Nullable<ICellData>>;
    index: ICopyDataInTypeIndexInfo;
}

export type ICopyDataInTypeIndexInfo = number[];

export const chnNameValue = {
    十: { value: 10, secUnit: false },
    百: { value: 100, secUnit: false },
    千: { value: 1000, secUnit: false },
    万: { value: 10000, secUnit: true },
    亿: { value: 100000000, secUnit: true },
};

export function getEmptyCopyDataPiece(): ICopyDataPiece {
    return {
        [DATA_TYPE.NUMBER]: [],
        [DATA_TYPE.DATE]: [],
        [DATA_TYPE.EXTEND_NUMBER]: [],
        [DATA_TYPE.CHN_NUMBER]: [],
        [DATA_TYPE.CHN_WEEK2]: [],
        [DATA_TYPE.CHN_WEEK3]: [],
        [DATA_TYPE.OTHER]: [],
    };
}
export function chineseToNumber(chnStr?: Nullable<string>) {
    if (!chnStr) {
        return 0;
    }
    let rtn = 0;
    let section = 0;
    let number = 0;
    let secUnit = false;
    const str = chnStr.split('');

    for (let i = 0; i < str.length; i++) {
        const num = chnNumChar[str[i] as keyof typeof chnNumChar];

        if (typeof num !== 'undefined') {
            number = num;

            if (i === str.length - 1) {
                section += number;
            }
        } else {
            const obj = chnNameValue[str[i] as keyof typeof chnNameValue];
            const unit = obj.value;
            secUnit = obj.secUnit;

            if (secUnit) {
                section = (section + number) * unit;
                rtn += section;
                section = 0;
            } else {
                section += number * unit;
            }

            number = 0;
        }
    }

    return rtn + section;
}

export function sectionToChinese(section: number) {
    let strIns = '';
    let chnStr = '';
    let unitPos = 0;
    let zero = true;

    while (section > 0) {
        const v = section % 10;

        if (v === 0) {
            if (!zero) {
                zero = true;
                chnStr = chnNumChar2[v] + chnStr;
            }
        } else {
            zero = false;
            strIns = chnNumChar2[v];
            strIns += chnUnitChar[unitPos];
            chnStr = strIns + chnStr;
        }

        unitPos++;
        section = Math.floor(section / 10);
    }

    return chnStr;
}

export function numberToChinese(num: number) {
    let unitPos = 0;
    let strIns = '';
    let chnStr = '';
    let needZero = false;

    if (num === 0) {
        return chnNumChar2[0];
    }
    while (num > 0) {
        const section = num % 10000;

        if (needZero) {
            chnStr = chnNumChar2[0] + chnStr;
        }

        strIns = sectionToChinese(section);
        strIns += section !== 0 ? chnUnitSection[unitPos] : chnUnitSection[0];
        chnStr = strIns + chnStr;
        needZero = section < 1000 && section > 0;
        num = Math.floor(num / 10000);
        unitPos++;
    }

    return chnStr;
}

export function isChnNumber(txt: string) {
    let isChnNumber = true;

    if (txt) {
        if (txt.length === 1) {
            if (txt === '日' || txt in chnNumChar) {
                isChnNumber = true;
            } else {
                isChnNumber = false;
            }
        } else {
            const str = txt.split('');
            for (let i = 0; i < str.length; i++) {
                if (!(str[i] in chnNumChar || str[i] in chnNameValue)) {
                    isChnNumber = false;
                    break;
                }
            }
        }
    }
    return isChnNumber;
}

export function isExtendNumber(txt: string) {
    const reg = /0|([1-9]+[0-9]*)/g;
    const isExtendNumber = reg.test(txt);

    if (isExtendNumber) {
        const match = txt.match(reg);
        if (match && match.length > 0) {
            const matchTxt = match[match.length - 1];
            const matchIndex = txt.lastIndexOf(matchTxt);
            const beforeTxt = txt.substr(0, matchIndex);
            const afterTxt = txt.substr(matchIndex + matchTxt.length);

            return [isExtendNumber, Number(matchTxt), beforeTxt, afterTxt];
        }
        return [false];
    }

    return [isExtendNumber];
}

export function isChnWeek1(txt: string) {
    let isChnWeek1;
    if (txt.length === 1) {
        if (txt === '日' || chineseToNumber(txt) < 7) {
            isChnWeek1 = true;
        } else {
            isChnWeek1 = false;
        }
    } else {
        isChnWeek1 = false;
    }

    return isChnWeek1;
}

export function isChnWeek2(txt: string) {
    let isChnWeek2;
    if (txt.length === 2) {
        if (
            txt === '周一' ||
            txt === '周二' ||
            txt === '周三' ||
            txt === '周四' ||
            txt === '周五' ||
            txt === '周六' ||
            txt === '周日'
        ) {
            isChnWeek2 = true;
        } else {
            isChnWeek2 = false;
        }
    } else {
        isChnWeek2 = false;
    }

    return isChnWeek2;
}

export function isChnWeek3(txt: string) {
    let isChnWeek3;
    if (txt.length === 3) {
        if (
            txt === '星期一' ||
            txt === '星期二' ||
            txt === '星期三' ||
            txt === '星期四' ||
            txt === '星期五' ||
            txt === '星期六' ||
            txt === '星期日'
        ) {
            isChnWeek3 = true;
        } else {
            isChnWeek3 = false;
        }
    } else {
        isChnWeek3 = false;
    }

    return isChnWeek3;
}

export function getCopyData(
    d: ObjectMatrix<ICellData>,
    r1: number,
    r2: number,
    c1: number,
    c2: number,
    direction: Direction
) {
    const copyData = [];

    let a1;
    let a2;
    let b1;
    let b2;
    if (direction === Direction.DOWN || direction === Direction.UP) {
        a1 = c1;
        a2 = c2;
        b1 = r1;
        b2 = r2;
    } else {
        a1 = r1;
        a2 = r2;
        b1 = c1;
        b2 = c2;
    }

    for (let a = a1; a <= a2; a++) {
        const obj: ICopyDataPiece = getEmptyCopyDataPiece();

        let arrData: Array<Nullable<ICellData>> = [];
        let arrIndex = [];
        let text: DATA_TYPE | null = null;
        let extendNumberBeforeStr = null;
        let extendNumberAfterStr = null;
        let isSameStr = true;

        for (let b: number = b1; b <= b2; b++) {
            // get cell value
            let data;
            if (direction === Direction.DOWN || direction === Direction.UP) {
                data = d.getValue(b, a);
            } else {
                data = d.getValue(a, b);
            }

            const { v: value, m: formattedValue = '' } = data || {};

            let str;

            // calc the data type
            if (!!data && !!value && !!formattedValue) {
                if (typeof value === 'number') {
                    str = DATA_TYPE.NUMBER;
                    extendNumberBeforeStr = null;
                    extendNumberAfterStr = null;
                } else if (isExtendNumber(formattedValue)[0]) {
                    str = DATA_TYPE.EXTEND_NUMBER;

                    const isExtendNumberRes = isExtendNumber(formattedValue);

                    if (extendNumberBeforeStr === null || extendNumberAfterStr === null) {
                        isSameStr = true;
                        extendNumberBeforeStr = isExtendNumberRes[2];
                        extendNumberAfterStr = isExtendNumberRes[3];
                    } else {
                        if (
                            isExtendNumberRes[2] !== extendNumberBeforeStr ||
                            isExtendNumberRes[3] !== extendNumberAfterStr
                        ) {
                            isSameStr = false;
                            extendNumberBeforeStr = isExtendNumberRes[2];
                            extendNumberAfterStr = isExtendNumberRes[3];
                        } else {
                            isSameStr = true;
                        }
                    }
                } else if (isChnNumber(formattedValue)) {
                    str = DATA_TYPE.CHN_NUMBER;
                    extendNumberBeforeStr = null;
                    extendNumberAfterStr = null;
                } else if (isChnWeek2(formattedValue)) {
                    str = DATA_TYPE.CHN_WEEK2;
                    extendNumberBeforeStr = null;
                    extendNumberAfterStr = null;
                } else if (isChnWeek3(formattedValue)) {
                    str = DATA_TYPE.CHN_WEEK3;
                    extendNumberBeforeStr = null;
                    extendNumberAfterStr = null;
                } else {
                    str = DATA_TYPE.OTHER;
                    extendNumberBeforeStr = null;
                    extendNumberAfterStr = null;
                }
            } else {
                str = DATA_TYPE.OTHER;
                extendNumberBeforeStr = null;
                extendNumberAfterStr = null;
            }

            // handel extend value
            if (data && str === DATA_TYPE.EXTEND_NUMBER) {
                if (b === b1) {
                    if (b1 === b2) {
                        text = str;
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);

                        obj[text] = [];
                        obj[text].push({ data: arrData, index: arrIndex });
                    } else {
                        text = str;
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);
                    }
                } else if (b === b2) {
                    if (text === str && isSameStr) {
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);

                        if (text in obj) {
                            obj[text].push({ data: arrData, index: arrIndex });
                        }
                    } else {
                        if (text) {
                            obj[text].push({ data: arrData, index: arrIndex });
                        }

                        text = str;
                        arrData = [];
                        arrData.push(data);
                        arrIndex = [];
                        arrIndex.push(b - b1 + 1);

                        obj[text].push({ data: arrData, index: arrIndex });
                    }
                } else {
                    if (text === str && isSameStr) {
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);
                    } else {
                        if (text) {
                            obj[text].push({ data: arrData, index: arrIndex });
                        }

                        text = str;
                        arrData = [];
                        arrData.push(data);
                        arrIndex = [];
                        arrIndex.push(b - b1 + 1);
                    }
                }
            } else {
                if (b === b1) {
                    if (b1 === b2) {
                        text = str;
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);

                        obj[text] = [];
                        obj[text].push({ data: arrData, index: arrIndex });
                    } else {
                        text = str;
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);
                    }
                } else if (b === b2) {
                    if (text === str) {
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);

                        if (text in obj) {
                            obj[text].push({ data: arrData, index: arrIndex });
                        } else {
                            obj[text] = [];
                            obj[text].push({ data: arrData, index: arrIndex });
                        }
                    } else {
                        if (text) {
                            obj[text].push({ data: arrData, index: arrIndex });
                        }

                        text = str;
                        arrData = [];
                        arrData.push(data);
                        arrIndex = [];
                        arrIndex.push(b - b1 + 1);

                        if (text in obj) {
                            obj[text].push({ data: arrData, index: arrIndex });
                        } else {
                            obj[text] = [];
                            obj[text].push({ data: arrData, index: arrIndex });
                        }
                    }
                } else {
                    if (text === str) {
                        arrData.push(data);
                        arrIndex.push(b - b1 + 1);
                    } else {
                        if (text) {
                            obj[text].push({ data: arrData, index: arrIndex });
                        }

                        text = str;
                        arrData = [];
                        arrData.push(data);
                        arrIndex = [];
                        arrIndex.push(b - b1 + 1);
                    }
                }
            }
        }

        copyData.push(obj);
    }

    return copyData;
}

export function getApplyData(
    copyD: ICopyDataPiece,
    csLen: number,
    asLen: number,
    direction: Direction,
    type: APPLY_TYPE
) {
    const applyData = [];

    const num = Math.floor(asLen / csLen);
    const rsd = asLen % csLen;

    // pure number
    const copyD_number = copyD[DATA_TYPE.NUMBER];
    const applyD_number: ICopyDataInType[] = [];
    if (copyD_number) {
        for (let i = 0; i < copyD_number.length; i++) {
            const s = getLenS(copyD_number[i].index, rsd);
            const len = copyD_number[i].index.length * num + s;

            let arrData;
            if (type === APPLY_TYPE.SERIES || type === APPLY_TYPE.NO_FORMAT) {
                arrData = getDataByType(copyD_number[i].data, len, direction, type, DATA_TYPE.NUMBER);
            } else if (type === APPLY_TYPE.ONLY_FORMAT) {
                arrData = getDataByType(copyD_number[i].data, len, direction, type);
            } else {
                arrData = getDataByType(copyD_number[i].data, len, direction, '0');
            }

            const arrIndex = getDataIndex(csLen, asLen, copyD_number[i].index);
            applyD_number.push({ data: arrData, index: arrIndex });
        }
    }

    // extend number, which means number with string
    const copyD_extendNumber = copyD[DATA_TYPE.EXTEND_NUMBER];
    const applyD_extendNumber: ICopyDataInType[] = [];
    if (copyD_extendNumber) {
        for (let i = 0; i < copyD_extendNumber.length; i++) {
            const s = getLenS(copyD_extendNumber[i].index, rsd);
            const len = copyD_extendNumber[i].index.length * num + s;

            let arrData;
            if (type === APPLY_TYPE.NO_FORMAT || type === APPLY_TYPE.SERIES) {
                arrData = getDataByType(copyD_extendNumber[i].data, len, direction, type, DATA_TYPE.EXTEND_NUMBER);
            } else if (type === APPLY_TYPE.ONLY_FORMAT) {
                arrData = getDataByType(copyD_extendNumber[i].data, len, direction, type);
            } else {
                arrData = getDataByType(copyD_extendNumber[i].data, len, direction, APPLY_TYPE.COPY);
            }

            const arrIndex = getDataIndex(csLen, asLen, copyD_extendNumber[i].index);
            applyD_extendNumber.push({ data: arrData, index: arrIndex });
        }
    }

    // date type. not implement yet

    // chinese number
    const copyD_chnNumber = copyD.chnNumber;
    const applyD_chnNumber: ICopyDataInType[] = [];
    if (copyD_chnNumber) {
        for (let i = 0; i < copyD_chnNumber.length; i++) {
            const s = getLenS(copyD_chnNumber[i].index, rsd);
            const len = copyD_chnNumber[i].index.length * num + s;

            let arrData;
            if (type === APPLY_TYPE.NO_FORMAT || type === APPLY_TYPE.SERIES) {
                arrData = getDataByType(copyD_chnNumber[i].data, len, direction, type, DATA_TYPE.CHN_NUMBER);
            } else if (type === APPLY_TYPE.ONLY_FORMAT) {
                arrData = getDataByType(copyD_chnNumber[i].data, len, direction, type);
            } else {
                arrData = getDataByType(copyD_chnNumber[i].data, len, direction, APPLY_TYPE.COPY);
            }

            const arrIndex = getDataIndex(csLen, asLen, copyD_chnNumber[i].index);
            applyD_chnNumber.push({ data: arrData, index: arrIndex });
        }
    }

    // week
    const copyD_chnWeek2 = copyD.chnWeek2;
    const applyD_chnWeek2: ICopyDataInType[] = [];
    if (copyD_chnWeek2) {
        for (let i = 0; i < copyD_chnWeek2.length; i++) {
            const s = getLenS(copyD_chnWeek2[i].index, rsd);
            const len = copyD_chnWeek2[i].index.length * num + s;

            let arrData;
            if (type === APPLY_TYPE.NO_FORMAT || type === APPLY_TYPE.SERIES) {
                arrData = getDataByType(copyD_chnWeek2[i].data, len, direction, type, DATA_TYPE.CHN_WEEK2);
            } else if (type === APPLY_TYPE.ONLY_FORMAT) {
                arrData = getDataByType(copyD_chnWeek2[i].data, len, direction, type);
            } else {
                arrData = getDataByType(copyD_chnWeek2[i].data, len, direction, APPLY_TYPE.COPY);
            }

            const arrIndex = getDataIndex(csLen, asLen, copyD_chnWeek2[i].index);
            applyD_chnWeek2.push({ data: arrData, index: arrIndex });
        }
    }

    // week 2
    const copyD_chnWeek3 = copyD.chnWeek3;
    const applyD_chnWeek3: ICopyDataInType[] = [];
    if (copyD_chnWeek3) {
        for (let i = 0; i < copyD_chnWeek3.length; i++) {
            const s = getLenS(copyD_chnWeek3[i].index, rsd);
            const len = copyD_chnWeek3[i].index.length * num + s;

            let arrData;
            if (type === APPLY_TYPE.NO_FORMAT || type === APPLY_TYPE.SERIES) {
                arrData = getDataByType(copyD_chnWeek3[i].data, len, direction, type, DATA_TYPE.CHN_WEEK3);
            } else if (type === APPLY_TYPE.ONLY_FORMAT) {
                arrData = getDataByType(copyD_chnWeek3[i].data, len, direction, type);
            } else {
                arrData = getDataByType(copyD_chnWeek3[i].data, len, direction, APPLY_TYPE.COPY);
            }

            const arrIndex = getDataIndex(csLen, asLen, copyD_chnWeek3[i].index);
            applyD_chnWeek3.push({ data: arrData, index: arrIndex });
        }
    }

    // other
    const copyD_other = copyD.other;
    const applyD_other: ICopyDataInType[] = [];
    if (copyD_other) {
        for (let i = 0; i < copyD_other.length; i++) {
            const s = getLenS(copyD_other[i].index, rsd);
            const len = copyD_other[i].index.length * num + s;

            let arrData;
            if (type === APPLY_TYPE.NO_FORMAT || type === APPLY_TYPE.SERIES) {
                arrData = getDataByType(copyD_other[i].data, len, direction, type);
            } else {
                arrData = getDataByType(copyD_other[i].data, len, direction, APPLY_TYPE.COPY);
            }

            const arrIndex = getDataIndex(csLen, asLen, copyD_other[i].index);
            applyD_other.push({ data: arrData, index: arrIndex });
        }
    }

    for (let x = 1; x <= asLen; x++) {
        if (applyD_number.length > 0) {
            for (let y = 0; y < applyD_number.length; y++) {
                if (x in applyD_number[y].index) {
                    applyData.push(applyD_number[y].data[applyD_number[y].index[x]]);
                }
            }
        }

        if (applyD_extendNumber.length > 0) {
            for (let y = 0; y < applyD_extendNumber.length; y++) {
                if (x in applyD_extendNumber[y].index) {
                    applyData.push(applyD_extendNumber[y].data[applyD_extendNumber[y].index[x]]);
                }
            }
        }

        if (applyD_chnNumber.length > 0) {
            for (let y = 0; y < applyD_chnNumber.length; y++) {
                if (x in applyD_chnNumber[y].index) {
                    applyData.push(applyD_chnNumber[y].data[applyD_chnNumber[y].index[x]]);
                }
            }
        }

        if (applyD_chnWeek2.length > 0) {
            for (let y = 0; y < applyD_chnWeek2.length; y++) {
                if (x in applyD_chnWeek2[y].index) {
                    applyData.push(applyD_chnWeek2[y].data[applyD_chnWeek2[y].index[x]]);
                }
            }
        }

        if (applyD_chnWeek3.length > 0) {
            for (let y = 0; y < applyD_chnWeek3.length; y++) {
                if (x in applyD_chnWeek3[y].index) {
                    applyData.push(applyD_chnWeek3[y].data[applyD_chnWeek3[y].index[x]]);
                }
            }
        }

        if (applyD_other.length > 0) {
            for (let y = 0; y < applyD_other.length; y++) {
                if (x in applyD_other[y].index) {
                    applyData.push(applyD_other[y].data[applyD_other[y].index[x]]);
                }
            }
        }
    }

    return applyData;
}

export function getLenS(indexArr: any[], rsd: number) {
    let s = 0;

    for (let j = 0; j < indexArr.length; j++) {
        if (indexArr[j] <= rsd) {
            s++;
        } else {
            break;
        }
    }

    return s;
}

export function getDataByType(
    data: Array<Nullable<ICellData>>,
    len: number,
    direction: Direction,
    type: string,
    dataType?: DATA_TYPE
) {
    let applyData = [];
    const isForward = direction === Direction.DOWN || direction === Direction.RIGHT;

    if (type === APPLY_TYPE.COPY) {
        if (direction === Direction.UP || direction === Direction.LEFT) {
            data.reverse();
        }

        applyData = fillCopy(data, len);
    } else if (type === APPLY_TYPE.SERIES) {
        if (dataType === DATA_TYPE.NUMBER) {
            applyData = fillSeries(data, len, direction);
        } else if (dataType === DATA_TYPE.EXTEND_NUMBER) {
            if (data.length === 1) {
                let step;
                if (isForward) {
                    step = 1;
                } else {
                    step = -1;
                }

                applyData = fillExtendNumber(data, len, step);
            } else {
                const dataNumArr = [];

                for (let i = 0; i < data.length; i++) {
                    const txt = data[i]?.m;
                    txt && dataNumArr.push(Number(isExtendNumber(txt)[1]));
                }

                if (!isForward) {
                    data.reverse();
                    dataNumArr.reverse();
                }

                if (isEqualDiff(dataNumArr)) {
                    const step = dataNumArr[1] - dataNumArr[0];
                    applyData = fillExtendNumber(data, len, step);
                } else {
                    applyData = fillCopy(data, len);
                }
            }
        } else if (dataType === DATA_TYPE.CHN_NUMBER) {
            if (data.length === 1) {
                const formattedValue = data[0]?.m;
                if (formattedValue && (formattedValue === '日' || chineseToNumber(formattedValue) < 7)) {
                    // number less than 7, fill with sequence of Monday~Sunday
                    let step;
                    if (isForward) {
                        step = 1;
                    } else {
                        step = -1;
                    }

                    applyData = fillChnWeek(data, len, step);
                } else {
                    // number greater than 7, fill with sequence of Chinese lowercase numbers
                    let step;
                    if (isForward) {
                        step = 1;
                    } else {
                        step = -1;
                    }

                    applyData = fillChnNumber(data, len, step);
                }
            } else {
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

                if (!isForward) {
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
                        applyData = fillChnWeek(data, len, step);
                    } else {
                        // Fill with sequence of Chinese lowercase numbers
                        const step = dataNumArr[1] - dataNumArr[0];
                        applyData = fillChnNumber(data, len, step);
                    }
                } else {
                    // Not an arithmetic progression, copy data
                    applyData = fillCopy(data, len);
                }
            }
        } else if (dataType === DATA_TYPE.CHN_WEEK2) {
            if (data.length === 1) {
                let step;
                if (isForward) {
                    step = 1;
                } else {
                    step = -1;
                }

                applyData = fillChnWeek(data, len, step, 1);
            } else {
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

                if (!isForward) {
                    data.reverse();
                    dataNumArr.reverse();
                }

                if (isEqualDiff(dataNumArr)) {
                    const step = dataNumArr[1] - dataNumArr[0];
                    applyData = fillChnWeek(data, len, step, 1);
                } else {
                    applyData = fillCopy(data, len);
                }
            }
        } else if (dataType === DATA_TYPE.CHN_WEEK3) {
            if (data.length === 1) {
                let step;
                if (isForward) {
                    step = 1;
                } else {
                    step = -1;
                }

                applyData = fillChnWeek(data, len, step, 2);
            } else {
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

                if (!isForward) {
                    data.reverse();
                    dataNumArr.reverse();
                }

                if (isEqualDiff(dataNumArr)) {
                    const step = dataNumArr[1] - dataNumArr[0];
                    applyData = fillChnWeek(data, len, step, 2);
                } else {
                    applyData = fillCopy(data, len);
                }
            }
        } else {
            if (!isForward) {
                data.reverse();
            }

            applyData = fillCopy(data, len);
        }
    } else if (type === APPLY_TYPE.ONLY_FORMAT) {
        if (!isForward) {
            data.reverse();
        }
        applyData = fillOnlyFormat(data, len);
    } else if (type === APPLY_TYPE.NO_FORMAT) {
        // no format fill, to be implemented
    }

    return applyData;
}
/**
 * equal diff
 * @param arr
 * @returns
 */
export function isEqualDiff(arr: number[]) {
    let diff = true;
    const step = arr[1] - arr[0];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] - arr[i - 1] !== step) {
            diff = false;
            break;
        }
    }

    return diff;
}

export function getDataIndex(csLen: number, asLen: number, indexArr: number[]) {
    const obj: ICopyDataInTypeIndexInfo = [];

    const num = Math.floor(asLen / csLen);
    const rsd = asLen % csLen;

    let sum = 0;
    if (num > 0) {
        for (let i = 1; i <= num; i++) {
            for (let j = 0; j < indexArr.length; j++) {
                obj[indexArr[j] + (i - 1) * csLen] = sum;
                sum++;
            }
        }
        for (let a = 0; a < indexArr.length; a++) {
            if (indexArr[a] <= rsd) {
                obj[indexArr[a] + csLen * num] = sum;
                sum++;
            } else {
                break;
            }
        }
    } else {
        for (let a = 0; a < indexArr.length; a++) {
            if (indexArr[a] <= rsd) {
                obj[indexArr[a]] = sum;
                sum++;
            } else {
                break;
            }
        }
    }

    return obj;
}

export function fillCopy(data: Array<Nullable<ICellData>>, len: number) {
    const applyData = [];

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        applyData.push(d);
    }

    return applyData;
}

export function isEqualRatio(arr: number[]) {
    let ratio = true;
    const step = arr[1] / arr[0];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] / arr[i - 1] !== step) {
            ratio = false;
            break;
        }
    }

    return ratio;
}

export function getXArr(len: number) {
    const xArr = [];

    for (let i = 1; i <= len; i++) {
        xArr.push(i);
    }

    return xArr;
}

export function fillSeries(data: Array<Nullable<ICellData>>, len: number, direction: Direction) {
    const applyData = [];

    const dataNumArr = [];
    for (let j = 0; j < data.length; j++) {
        dataNumArr.push(Number(data[j]?.v));
    }

    if (data.length > 2 && isEqualRatio(dataNumArr)) {
        for (let i = 1; i <= len; i++) {
            const index = (i - 1) % data.length;
            const d = Tools.deepClone(data[index]);

            let num;
            if (direction === Direction.DOWN || direction === Direction.RIGHT) {
                num = Number(data[data.length - 1]?.v) * (Number(data[1]?.v) / Number(data[0]?.v)) ** i;
            } else if (direction === Direction.UP || direction === Direction.LEFT) {
                num = Number(data[0]?.v) / (Number(data[1]?.v) / Number(data[0]?.v)) ** i;
            }

            d.v = num;
            d.m = `${num}`;
            applyData.push(d);
        }
    } else {
        const xArr = getXArr(data.length);
        for (let i = 1; i <= len; i++) {
            const index = (i - 1) % data.length;
            const d = Tools.deepClone(data[index]);

            let y;
            if (direction === Direction.DOWN || direction === Direction.RIGHT) {
                y = forecast(data.length + i, dataNumArr, xArr);
            } else {
                y = forecast(1 - i, dataNumArr, xArr);
            }

            d.v = y;
            d.m = `${y}`;
            applyData.push(d);
        }
    }
    console.error('fill series:', applyData);
    return applyData;
}

export function forecast(x: number, yArr: number[], xArr: number[]) {
    function getAverage(arr: number[]) {
        let sum = 0;

        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }

        return sum / arr.length;
    }

    const ax = getAverage(xArr);
    const ay = getAverage(yArr);

    let sum_d = 0;
    let sum_n = 0;
    for (let j = 0; j < xArr.length; j++) {
        sum_d += (xArr[j] - ax) * (yArr[j] - ay);
        sum_n += (xArr[j] - ax) * (xArr[j] - ax);
    }

    let b;
    if (sum_n === 0) {
        b = 1;
    } else {
        b = sum_d / sum_n;
    }

    const a = ay - b * ax;

    return Math.round((a + b * x) * 100000) / 100000;
}

export function fillExtendNumber(data: Array<Nullable<ICellData>>, len: number, step: number) {
    const applyData = [];
    const reg = /0|([1-9]+[0-9]*)/g;

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        const last = data[data.length - 1]?.m;
        const match = last?.match(reg);
        const lastTxt = match?.[match.length - 1];

        const num = Math.abs(Number(lastTxt) + step * i);
        if (!last || !lastTxt) continue;
        const lastIndex = last.lastIndexOf(lastTxt);
        const valueTxt = last.substr(0, lastIndex) + num.toString() + last.substr(lastIndex + lastTxt.length);

        d.v = valueTxt;
        d.m = valueTxt;

        applyData.push(d);
    }

    return applyData;
}
export function fillOnlyFormat(data: Array<Nullable<ICellData>>, len: number) {
    const applyData = [];

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        delete d.f;
        delete d.m;
        delete d.v;

        applyData.push(d);
    }

    return applyData;
}

// weektype: 0-日 1-周 2-星期
export function fillChnWeek(data: Array<Nullable<ICellData>>, len: number, step: number, weekType: number = 0) {
    const keywordMap = [
        ['日', '一', '二', '三', '四', '五', '六'],
        ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五'],
    ];
    if (weekType >= keywordMap.length) return [];
    const keyword = keywordMap[weekType];
    const applyData = [];

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        let num = 0;
        if (data[data.length - 1]?.m === keyword[0]) {
            num = 7 + step * i;
        } else {
            const last = data[data.length - 1]?.m;
            if (last) {
                const txt = last.substr(last.length - 1, 1);
                num = chineseToNumber(txt) + step * i;
            }
        }

        if (num < 0) {
            num = Math.ceil(Math.abs(num) / 7) * 7 + num;
        }

        const rsd = num % 7;
        d.m = keyword[rsd];
        d.v = keyword[rsd];

        applyData.push(d);
    }

    return applyData;
}

export function fillChnNumber(data: Array<Nullable<ICellData>>, len: number, step: number) {
    const applyData = [];

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        const formattedValue = data[data.length - 1]?.m;
        const num = chineseToNumber(formattedValue) + step * i;
        let txt;
        if (num <= 0) {
            txt = '零';
        } else {
            txt = numberToChinese(num);
        }

        d.v = txt;
        d.m = txt.toString();
        applyData.push(d);
    }

    return applyData;
}
