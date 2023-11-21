import { Direction, ICellData, Nullable, Tools } from '@univerjs/core';

import { DATA_TYPE, ICopyDataPiece } from './type';

export const chnNumChar = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
export const chnNumChar2 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
export const chnUnitSection = ['', '万', '亿', '万亿', '亿亿'];
export const chnUnitChar = ['', '十', '百', '千'];

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
        [DATA_TYPE.FORMULA]: [],
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

export function isChnNumber(txt?: string) {
    if (!txt) {
        return false;
    }
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

export function matchExtendNumber(txt?: string) {
    if (!txt) {
        return {
            isExtendNumber: false,
        };
    }
    const reg = /0|([1-9]+[0-9]*)/g;
    const isExtendNumber = reg.test(txt);

    if (isExtendNumber) {
        const match = txt.match(reg);
        if (match && match.length > 0) {
            const matchTxt = match[match.length - 1];
            const matchIndex = txt.lastIndexOf(matchTxt);
            const beforeTxt = txt.substr(0, matchIndex);
            const afterTxt = txt.substr(matchIndex + matchTxt.length);

            return {
                isExtendNumber: true,
                matchTxt: Number(matchTxt),
                beforeTxt,
                afterTxt,
            };
        }
        return {
            isExtendNumber: false,
        };
    }

    return {
        isExtendNumber,
    };
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

export function fillCopyStyles(data: Array<Nullable<ICellData>>, len: number) {
    const applyData = [];
    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = { s: data[index]?.s };

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

            if (d) {
                d.v = num;
                d.m = `${num}`;
                applyData.push(d);
            }
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

            if (d) {
                d.v = y;
                d.m = `${y}`;
                applyData.push(d);
            }
        }
    }
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

        if (d) {
            d.v = valueTxt;
            d.m = valueTxt;

            applyData.push(d);
        }
    }

    return applyData;
}
export function fillOnlyFormat(data: Array<Nullable<ICellData>>, len: number) {
    const applyData = [];

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        if (d) {
            delete d.m;
            delete d.v;

            applyData.push(d);
        }
    }

    return applyData;
}

// weektype: 0-日 1-周 2-星期
export function fillChnWeek(data: Array<Nullable<ICellData>>, len: number, step: number, weekType: number = 0) {
    const keywordMap = [
        ['日', '一', '二', '三', '四', '五', '六'],
        ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
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
        if (d) {
            d.m = keyword[rsd];
            d.v = keyword[rsd];

            applyData.push(d);
        }
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

        if (d) {
            d.v = txt;
            d.m = txt.toString();
            applyData.push(d);
        }
    }

    return applyData;
}

const LOOP_SERIES: { [key: string]: string[] } = {
    enWeek1: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    enWeek2: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    enMonth1: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    enMonth2: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    chnMonth1: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    chnMonth2: ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '腊月'],
    chHour1: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    chHour2: ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'],
    chYear1: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    chSeason1: ['春', '夏', '秋', '冬'],
    chSeason2: ['春季', '夏季', '秋季', '冬季'],
};

export function isLoopSeries(txt: string) {
    let isLoopSeries = false;
    Object.keys(LOOP_SERIES).forEach((key) => {
        if (LOOP_SERIES[key].includes(txt)) {
            isLoopSeries = true;
        }
    });
    return isLoopSeries;
}

export function getLoopSeriesInfo(txt: string) {
    let name = '';
    const series: string[] = [];
    Object.keys(LOOP_SERIES).forEach((key) => {
        if (LOOP_SERIES[key].includes(txt)) {
            name = key;
            series.push(...LOOP_SERIES[key]);
        }
    });
    return { name, series };
}

export function fillLoopSeries(data: Array<Nullable<ICellData>>, len: number, step: number, series: string[]) {
    const seriesLen = series.length;
    const applyData = [];

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        const last = data[data.length - 1]?.m;
        const num = series.indexOf(last as string) + step * i;

        const rsd = num % seriesLen;
        if (d) {
            d.m = series[rsd];
            d.v = series[rsd];

            applyData.push(d);
        }
    }

    return applyData;
}

// TODO@Dushusir: add step
export function fillCopyFormula(data: Array<Nullable<ICellData>>, len: number, direction: Direction) {
    const applyData = [];

    for (let i = 1; i <= len; i++) {
        const index = (i - 1) % data.length;
        const d = Tools.deepClone(data[index]);

        if (d) {
            const originalFormula = data[index]?.f;

            if (originalFormula) {
                const shiftedFormula = shiftFormula(originalFormula, i, direction);
                d.f = shiftedFormula;
                if (direction === Direction.DOWN || direction === Direction.RIGHT) {
                    applyData.push(d);
                } else {
                    applyData.unshift(d);
                }
            }
        }
    }

    return applyData;
}

function shiftFormula(originalFormula: string, shift: number, direction: Direction): string {
    const tokens = tokenizeFormula(originalFormula);
    const shiftedTokens = [];

    for (const token of tokens) {
        if (isCellReference(token)) {
            const shiftedReference = shiftCellReference(token, shift, direction);
            shiftedTokens.push(shiftedReference);
        } else {
            shiftedTokens.push(token);
        }
    }

    return shiftedTokens.join('');
}

function tokenizeFormula(formula: string): string[] {
    const regex = /([A-Z]+\d+|[A-Z]+|\d+|\S)/g;
    return formula.match(regex) || [];
}

function isCellReference(token: string): boolean {
    const cellReferenceRegex = /^[A-Z]+\d+$/;
    return cellReferenceRegex.test(token);
}

function shiftCellReference(cellReference: string, shift: number, direction: Direction): string {
    const [col, row] = extractColRow(cellReference);

    let shiftedCol = col;
    let shiftedRow = row;

    if (direction === Direction.DOWN) {
        shiftedRow += shift;
    } else if (direction === Direction.RIGHT) {
        shiftedCol = shiftColumn(col, shift);
    } else if (direction === Direction.UP) {
        shiftedRow -= shift;
    } else if (direction === Direction.LEFT) {
        shiftedCol = shiftColumn(col, -shift);
    }

    return shiftedCol + shiftedRow;
}

function extractColRow(cellReference: string): [string, number] {
    const col = cellReference.replace(/\d/g, '');
    const row = parseInt(cellReference.replace(/[A-Z]+/g, ''), 10);
    return [col, row];
}

function shiftColumn(col: string, shift: number): string {
    const currentCharCode = col.charCodeAt(0);
    const shiftedCharCode = currentCharCode + shift;
    return String.fromCharCode(shiftedCharCode);
}
