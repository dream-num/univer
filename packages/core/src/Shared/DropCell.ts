// import dayjs from 'dayjs';
// import { AutoFillSeries, Direction, FormatType } from '../Enum';
// import { generate, update } from './Generate';

// /**
//  * Drop down fill
//  *
//  * autofill:
//     1.纯数字类型
//     2.扩展数字型（即一串字符最后面的是数字）
//     3.日期类型
//     4.中文小写数字 或 一~日
//     5.周一~周日  星期一~星期日

//  */
// export class DropCell {
//     static applyType: AutoFillSeries | string | null; // 0复制单元格，1填充序列，2仅填充格式，3不带格式填充，4以天数填充，5以工作日填充，6以月填充，7以年填充，8以中文小写数字序列填充

//     static direction: Direction | null; // down-往下拖拽，right-往右拖拽，up-往上拖拽，left-往左拖拽

//     static chnNumChar: {
//         零: 0;
//         一: 1;
//         二: 2;
//         三: 3;
//         四: 4;
//         五: 5;
//         六: 6;
//         七: 7;
//         八: 8;
//         九: 9;
//     };

//     static chnNameValue: {
//         十: { value: 10; secUnit: false };
//         百: { value: 100; secUnit: false };
//         千: { value: 1000; secUnit: false };
//         万: { value: 10000; secUnit: true };
//         亿: { value: 100000000; secUnit: true };
//     };

//     static chnNumChar2: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

//     static chnUnitChar: ['', '十', '百', '千'];

//     static chnUnitSection: ['', '万', '亿', '万亿', '亿亿'];

//     // constructor() {}

//     static getApplyData(
//         copyD: any,
//         csLen: number,
//         asLen: number,
//         type: AutoFillSeries | string,
//         direction: Direction
//     ) {
//         const _this = this;

//         const applyData = [];

//         _this.applyType = type;
//         _this.direction = direction;
//         // let direction = _this.direction;
//         // let type = _this.applyType;

//         const num = Math.floor(asLen / csLen);
//         const rsd = asLen % csLen;

//         // 纯数字类型
//         const copyD_number = copyD.number;
//         const applyD_number = [];
//         if (copyD_number) {
//             for (let i = 0; i < copyD_number.length; i++) {
//                 const s = _this.getLenS(copyD_number[i].index, rsd);
//                 const len = copyD_number[i].index.length * num + s;

//                 let arrData;
//                 if (type === 1) {
//                     arrData = _this.getDataByType(
//                         copyD_number[i].data,
//                         len,
//                         direction!,
//                         type,
//                         'number'
//                     );
//                 } else if (type === '2') {
//                     arrData = _this.getDataByType(
//                         copyD_number[i].data,
//                         len,
//                         direction!,
//                         type
//                     );
//                 } else {
//                     arrData = _this.getDataByType(
//                         copyD_number[i].data,
//                         len,
//                         direction!,
//                         '0'
//                     );
//                 }

//                 const arrIndex = _this.getDataIndex(
//                     csLen,
//                     asLen,
//                     copyD_number[i].index
//                 );
//                 applyD_number.push({ data: arrData, index: arrIndex });
//             }
//         }

//         // 扩展数字型（即一串字符最后面的是数字）
//         const copyD_extendNumber = copyD.extendNumber;
//         const applyD_extendNumber = [];
//         if (copyD_extendNumber) {
//             for (let i = 0; i < copyD_extendNumber.length; i++) {
//                 const s = _this.getLenS(copyD_extendNumber[i].index, rsd);
//                 const len = copyD_extendNumber[i].index.length * num + s;

//                 let arrData;
//                 if (type === '1' || type === '3') {
//                     arrData = _this.getDataByType(
//                         copyD_extendNumber[i].data,
//                         len,
//                         direction,
//                         type,
//                         'extendNumber'
//                     );
//                 } else if (type === '2') {
//                     arrData = _this.getDataByType(
//                         copyD_extendNumber[i].data,
//                         len,
//                         direction,
//                         type
//                     );
//                 } else {
//                     arrData = _this.getDataByType(
//                         copyD_extendNumber[i].data,
//                         len,
//                         direction,
//                         '0'
//                     );
//                 }

//                 const arrIndex = _this.getDataIndex(
//                     csLen,
//                     asLen,
//                     copyD_extendNumber[i].index
//                 );
//                 applyD_extendNumber.push({ data: arrData, index: arrIndex });
//             }
//         }

//         // 日期类型
//         const copyD_date = copyD.date;
//         const applyD_date = [];
//         if (copyD_date) {
//             for (let i = 0; i < copyD_date.length; i++) {
//                 const s = _this.getLenS(copyD_date[i].index, rsd);
//                 const len = copyD_date[i].index.length * num + s;

//                 let arrData;
//                 if (type === '1' || type === '3') {
//                     arrData = _this.getDataByType(
//                         copyD_date[i].data,
//                         len,
//                         direction,
//                         type,
//                         'date'
//                     );
//                 } else if (type === '8') {
//                     arrData = _this.getDataByType(
//                         copyD_date[i].data,
//                         len,
//                         direction,
//                         '0'
//                     );
//                 } else {
//                     arrData = _this.getDataByType(
//                         copyD_date[i].data,
//                         len,
//                         direction,
//                         type
//                     );
//                 }

//                 const arrIndex = _this.getDataIndex(
//                     csLen,
//                     asLen,
//                     copyD_date[i].index
//                 );
//                 applyD_date.push({ data: arrData, index: arrIndex });
//             }
//         }

//         // 中文小写数字 或 一~日
//         const copyD_chnNumber = copyD.chnNumber;
//         const applyD_chnNumber = [];
//         if (copyD_chnNumber) {
//             for (let i = 0; i < copyD_chnNumber.length; i++) {
//                 const s = _this.getLenS(copyD_chnNumber[i].index, rsd);
//                 const len = copyD_chnNumber[i].index.length * num + s;

//                 let arrData;
//                 if (type === '1' || type === '3') {
//                     arrData = _this.getDataByType(
//                         copyD_chnNumber[i].data,
//                         len,
//                         direction,
//                         type,
//                         'chnNumber'
//                     );
//                 } else if (type === '2' || type === '8') {
//                     arrData = _this.getDataByType(
//                         copyD_chnNumber[i].data,
//                         len,
//                         direction,
//                         type
//                     );
//                 } else {
//                     arrData = _this.getDataByType(
//                         copyD_chnNumber[i].data,
//                         len,
//                         direction,
//                         '0'
//                     );
//                 }

//                 const arrIndex = _this.getDataIndex(
//                     csLen,
//                     asLen,
//                     copyD_chnNumber[i].index
//                 );
//                 applyD_chnNumber.push({ data: arrData, index: arrIndex });
//             }
//         }

//         // 周一~周日
//         const copyD_chnWeek2 = copyD.chnWeek2;
//         const applyD_chnWeek2 = [];
//         if (copyD_chnWeek2) {
//             for (let i = 0; i < copyD_chnWeek2.length; i++) {
//                 const s = _this.getLenS(copyD_chnWeek2[i].index, rsd);
//                 const len = copyD_chnWeek2[i].index.length * num + s;

//                 let arrData;
//                 if (type === '1' || type === '3') {
//                     arrData = _this.getDataByType(
//                         copyD_chnWeek2[i].data,
//                         len,
//                         direction,
//                         type,
//                         'chnWeek2'
//                     );
//                 } else if (type === '2') {
//                     arrData = _this.getDataByType(
//                         copyD_chnWeek2[i].data,
//                         len,
//                         direction,
//                         type
//                     );
//                 } else {
//                     arrData = _this.getDataByType(
//                         copyD_chnWeek2[i].data,
//                         len,
//                         direction,
//                         '0'
//                     );
//                 }

//                 const arrIndex = _this.getDataIndex(
//                     csLen,
//                     asLen,
//                     copyD_chnWeek2[i].index
//                 );
//                 applyD_chnWeek2.push({ data: arrData, index: arrIndex });
//             }
//         }

//         // 星期一~星期日
//         const copyD_chnWeek3 = copyD.chnWeek3;
//         const applyD_chnWeek3 = [];
//         if (copyD_chnWeek3) {
//             for (let i = 0; i < copyD_chnWeek3.length; i++) {
//                 const s = _this.getLenS(copyD_chnWeek3[i].index, rsd);
//                 const len = copyD_chnWeek3[i].index.length * num + s;

//                 let arrData;
//                 if (type === '1' || type === '3') {
//                     arrData = _this.getDataByType(
//                         copyD_chnWeek3[i].data,
//                         len,
//                         direction,
//                         type,
//                         'chnWeek3'
//                     );
//                 } else if (type === '2') {
//                     arrData = _this.getDataByType(
//                         copyD_chnWeek3[i].data,
//                         len,
//                         direction,
//                         type
//                     );
//                 } else {
//                     arrData = _this.getDataByType(
//                         copyD_chnWeek3[i].data,
//                         len,
//                         direction,
//                         '0'
//                     );
//                 }

//                 const arrIndex = _this.getDataIndex(
//                     csLen,
//                     asLen,
//                     copyD_chnWeek3[i].index
//                 );
//                 applyD_chnWeek3.push({ data: arrData, index: arrIndex });
//             }
//         }

//         // 其它
//         const copyD_other = copyD.other;
//         const applyD_other = [];
//         if (copyD_other) {
//             for (let i = 0; i < copyD_other.length; i++) {
//                 const s = _this.getLenS(copyD_other[i].index, rsd);
//                 const len = copyD_other[i].index.length * num + s;

//                 let arrData;
//                 if (type === '2' || type === '3') {
//                     arrData = _this.getDataByType(
//                         copyD_other[i].data,
//                         len,
//                         direction,
//                         type
//                     );
//                 } else {
//                     arrData = _this.getDataByType(
//                         copyD_other[i].data,
//                         len,
//                         direction,
//                         '0'
//                     );
//                 }

//                 const arrIndex = _this.getDataIndex(
//                     csLen,
//                     asLen,
//                     copyD_other[i].index
//                 );
//                 applyD_other.push({ data: arrData, index: arrIndex });
//             }
//         }

//         for (let x = 1; x <= asLen; x++) {
//             if (applyD_number.length > 0) {
//                 for (let y = 0; y < applyD_number.length; y++) {
//                     if (x in applyD_number[y].index) {
//                         applyData.push(
//                             applyD_number[y].data[applyD_number[y].index[x]]
//                         );
//                     }
//                 }
//             }
//             if (applyD_extendNumber.length > 0) {
//                 for (let y = 0; y < applyD_extendNumber.length; y++) {
//                     if (x in applyD_extendNumber[y].index) {
//                         applyData.push(
//                             applyD_extendNumber[y].data[
//                                 applyD_extendNumber[y].index[x]
//                             ]
//                         );
//                     }
//                 }
//             }

//             if (applyD_date.length > 0) {
//                 for (let y = 0; y < applyD_date.length; y++) {
//                     if (x in applyD_date[y].index) {
//                         applyData.push(applyD_date[y].data[applyD_date[y].index[x]]);
//                     }
//                 }
//             }

//             if (applyD_chnNumber.length > 0) {
//                 for (let y = 0; y < applyD_chnNumber.length; y++) {
//                     if (x in applyD_chnNumber[y].index) {
//                         applyData.push(
//                             applyD_chnNumber[y].data[applyD_chnNumber[y].index[x]]
//                         );
//                     }
//                 }
//             }

//             if (applyD_chnWeek2.length > 0) {
//                 for (let y = 0; y < applyD_chnWeek2.length; y++) {
//                     if (x in applyD_chnWeek2[y].index) {
//                         applyData.push(
//                             applyD_chnWeek2[y].data[applyD_chnWeek2[y].index[x]]
//                         );
//                     }
//                 }
//             }

//             if (applyD_chnWeek3.length > 0) {
//                 for (let y = 0; y < applyD_chnWeek3.length; y++) {
//                     if (x in applyD_chnWeek3[y].index) {
//                         applyData.push(
//                             applyD_chnWeek3[y].data[applyD_chnWeek3[y].index[x]]
//                         );
//                     }
//                 }
//             }

//             if (applyD_other.length > 0) {
//                 for (let y = 0; y < applyD_other.length; y++) {
//                     if (x in applyD_other[y].index) {
//                         applyData.push(
//                             applyD_other[y].data[applyD_other[y].index[x]]
//                         );
//                     }
//                 }
//             }
//         }

//         return applyData;
//     }

//     static getCopyData(
//         d: any,
//         r1: number,
//         r2: number,
//         c1: number,
//         c2: number,
//         direction: Direction
//     ) {
//         const _this = this;

//         const copyData = [];

//         let a1: number = 0;
//         let a2: number = 0;
//         let b1: number = 0;
//         let b2: number = 0;
//         if (direction === Direction.BOTTOM || direction === Direction.TOP) {
//             a1 = c1;
//             a2 = c2;
//             b1 = r1;
//             b2 = r2;
//         } else if (direction === Direction.RIGHT || direction === Direction.LEFT) {
//             a1 = r1;
//             a2 = r2;
//             b1 = c1;
//             b2 = c2;
//         }

//         for (let a = a1; a <= a2; a++) {
//             const obj = {};

//             let arrData = [];
//             let arrIndex = [];
//             let text = '';
//             let extendNumberBeforeStr = null;
//             let extendNumberAfterStr = null;
//             let isSameStr = true;

//             for (let b = b1, i = 0; b <= b2; b++, i++) {
//                 // 单元格
//                 const data = d[i];
//                 // if (direction === Direction.BOTTOM || direction === Direction.TOP) {
//                 //     data = d[b][a];
//                 // } else if (
//                 //     direction === Direction.RIGHT ||
//                 //     direction === Direction.LEFT
//                 // ) {
//                 //     data = d[a][b];
//                 // }

//                 // 单元格值类型
//                 let str;
//                 if (!!data && !!data.v && !data.f) {
//                     if (!!data.fm && data.fm.t === FormatType.NUMBER) {
//                         str = 'number';
//                         extendNumberBeforeStr = null;
//                         extendNumberAfterStr = null;
//                     } else if (!!data.fm && data.fm.t === FormatType.DATE) {
//                         str = 'date';
//                         extendNumberBeforeStr = null;
//                         extendNumberAfterStr = null;
//                     } else if (_this.isExtendNumber(data.m)[0]) {
//                         str = 'extendNumber';

//                         const isExtendNumber = _this.isExtendNumber(data.m);

//                         if (
//                             extendNumberBeforeStr === null ||
//                             extendNumberAfterStr === null
//                         ) {
//                             isSameStr = true;
//                             extendNumberBeforeStr = isExtendNumber[2];
//                             extendNumberAfterStr = isExtendNumber[3];
//                         } else if (
//                             isExtendNumber[2] !== extendNumberBeforeStr ||
//                             isExtendNumber[3] !== extendNumberAfterStr
//                         ) {
//                             isSameStr = false;
//                             extendNumberBeforeStr = isExtendNumber[2];
//                             extendNumberAfterStr = isExtendNumber[3];
//                         } else {
//                             isSameStr = true;
//                         }
//                     } else if (_this.isChnNumber(data.m)) {
//                         str = 'chnNumber';
//                         extendNumberBeforeStr = null;
//                         extendNumberAfterStr = null;
//                     } else if (_this.isChnWeek2(data.m)) {
//                         str = 'chnWeek2';
//                         extendNumberBeforeStr = null;
//                         extendNumberAfterStr = null;
//                     } else if (_this.isChnWeek3(data.m)) {
//                         str = 'chnWeek3';
//                         extendNumberBeforeStr = null;
//                         extendNumberAfterStr = null;
//                     } else {
//                         str = 'other';
//                         extendNumberBeforeStr = null;
//                         extendNumberAfterStr = null;
//                     }
//                 } else {
//                     str = 'other';
//                     extendNumberBeforeStr = null;
//                     extendNumberAfterStr = null;
//                 }
//                 if (str === 'extendNumber') {
//                     if (b === b1) {
//                         if (b1 === b2) {
//                             text = str;
//                             arrData.push(data);
//                             arrIndex.push(b - b1 + 1);

//                             obj[text] = [];
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         } else {
//                             text = str;
//                             arrData.push(data);
//                             arrIndex.push(b - b1 + 1);
//                         }
//                     } else if (b === b2) {
//                         if (text === str && isSameStr) {
//                             arrData.push(data);
//                             arrIndex.push(b - b1 + 1);

//                             if (text in obj) {
//                                 // obj[text].push({ data: arrData, index: arrIndex });
//                             } else {
//                                 obj[text] = [];
//                                 obj[text].push({ data: arrData, index: arrIndex });
//                             }
//                         } else {
//                             if (text in obj) {
//                                 obj[text].push({ data: arrData, index: arrIndex });
//                             } else {
//                                 obj[text] = [];
//                                 obj[text].push({ data: arrData, index: arrIndex });
//                             }

//                             text = str;
//                             arrData = [];
//                             arrData.push(data);
//                             arrIndex = [];
//                             arrIndex.push(b - b1 + 1);

//                             if (text in obj) {
//                                 obj[text].push({ data: arrData, index: arrIndex });
//                             } else {
//                                 obj[text] = [];
//                                 obj[text].push({ data: arrData, index: arrIndex });
//                             }
//                         }
//                     } else if (text === str && isSameStr) {
//                         arrData.push(data);
//                         arrIndex.push(b - b1 + 1);
//                     } else {
//                         if (text in obj) {
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         } else {
//                             obj[text] = [];
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         }

//                         text = str;
//                         arrData = [];
//                         arrData.push(data);
//                         arrIndex = [];
//                         arrIndex.push(b - b1 + 1);
//                     }
//                 } else if (b === b1) {
//                     if (b1 === b2) {
//                         text = str;
//                         arrData.push(data);
//                         arrIndex.push(b - b1 + 1);

//                         obj[text] = [];
//                         obj[text].push({ data: arrData, index: arrIndex });
//                     } else {
//                         text = str;
//                         arrData.push(data);
//                         arrIndex.push(b - b1 + 1);
//                     }
//                 } else if (b === b2) {
//                     if (text === str) {
//                         arrData.push(data);
//                         arrIndex.push(b - b1 + 1);

//                         if (text in obj) {
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         } else {
//                             obj[text] = [];
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         }
//                     } else {
//                         if (text in obj) {
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         } else {
//                             obj[text] = [];
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         }

//                         text = str;
//                         arrData = [];
//                         arrData.push(data);
//                         arrIndex = [];
//                         arrIndex.push(b - b1 + 1);

//                         if (text in obj) {
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         } else {
//                             obj[text] = [];
//                             obj[text].push({ data: arrData, index: arrIndex });
//                         }
//                     }
//                 } else if (text === str) {
//                     arrData.push(data);
//                     arrIndex.push(b - b1 + 1);
//                 } else {
//                     if (text in obj) {
//                         obj[text].push({ data: arrData, index: arrIndex });
//                     } else {
//                         obj[text] = [];
//                         obj[text].push({ data: arrData, index: arrIndex });
//                     }

//                     text = str;
//                     arrData = [];
//                     arrData.push(data);
//                     arrIndex = [];
//                     arrIndex.push(b - b1 + 1);
//                 }
//             }

//             copyData.push(obj);
//         }

//         return copyData;
//     }

//     static ChineseToNumber(chnStr: string) {
//         const _this = this;

//         let rtn = 0;
//         let section = 0;
//         let number = 0;
//         let secUnit = false;
//         const str = chnStr.split('');

//         for (let i = 0; i < str.length; i++) {
//             const num = _this.chnNumChar[str[i]];

//             if (typeof num !== 'undefined') {
//                 number = num;

//                 if (i === str.length - 1) {
//                     section += number;
//                 }
//             } else {
//                 const unit = _this.chnNameValue[str[i]].value;
//                 secUnit = _this.chnNameValue[str[i]].secUnit;

//                 if (secUnit) {
//                     section = (section + number) * unit;
//                     rtn += section;
//                     section = 0;
//                 } else {
//                     section += number * unit;
//                 }

//                 number = 0;
//             }
//         }

//         return rtn + section;
//     }

//     static NumberToChinese(num: number) {
//         const _this = this;

//         let unitPos = 0;
//         let strIns = '';
//         let chnStr = '';
//         let needZero = false;

//         if (num === 0) {
//             return _this.chnNumChar2[0];
//         }
//         while (num > 0) {
//             const section = num % 10000;

//             if (needZero) {
//                 chnStr = _this.chnNumChar2[0] + chnStr;
//             }

//             strIns = _this.SectionToChinese(section);
//             strIns +=
//                 section !== 0
//                     ? _this.chnUnitSection[unitPos]
//                     : _this.chnUnitSection[0];
//             chnStr = strIns + chnStr;
//             needZero = section < 1000 && section > 0;
//             num = Math.floor(num / 10000);
//             unitPos++;
//         }

//         return chnStr;
//     }

//     static SectionToChinese(section: number) {
//         const _this = this;

//         let strIns = '';
//         let chnStr = '';
//         let unitPos = 0;
//         let zero = true;

//         while (section > 0) {
//             const v = section % 10;

//             if (v === 0) {
//                 if (!zero) {
//                     zero = true;
//                     chnStr = _this.chnNumChar2[v] + chnStr;
//                 }
//             } else {
//                 zero = false;
//                 strIns = _this.chnNumChar2[v];
//                 strIns += _this.chnUnitChar[unitPos];
//                 chnStr = strIns + chnStr;
//             }

//             unitPos++;
//             section = Math.floor(section / 10);
//         }

//         return chnStr;
//     }

//     static getLenS(indexArr: string | any[], rsd: number) {
//         let s = 0;

//         for (let j = 0; j < indexArr.length; j++) {
//             if (indexArr[j] <= rsd) {
//                 s++;
//             } else {
//                 break;
//             }
//         }

//         return s;
//     }

//     static getDataByType(
//         data: any,
//         len: number,
//         direction: Direction,
//         type: AutoFillSeries | string,
//         dataType?: string
//     ): any {
//         const _this = this;

//         let applyData = [];

//         if (type === AutoFillSeries.ALTERNATE_SERIES) {
//             // 复制单元格
//             if (direction === Direction.TOP || direction === Direction.LEFT) {
//                 data.reverse();
//             }

//             applyData = _this.FillCopy(data, len);
//         } else if (type === AutoFillSeries.DEFAULT_SERIES) {
//             // 填充序列
//             if (dataType === 'number') {
//                 // 数据类型是 数字
//                 applyData = _this.FillSeries(data, len, direction);
//             } else if (dataType === 'extendNumber') {
//                 // 扩展数字
//                 if (data.length === 1) {
//                     let step = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step = -1;
//                     }

//                     applyData = _this.FillExtendNumber(data, len, step);
//                 } else {
//                     const dataNumArr = [];

//                     for (let i = 0; i < data.length; i++) {
//                         const txt = data[i].m;
//                         dataNumArr.push(Number(_this.isExtendNumber(txt)[1]));
//                     }

//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                         dataNumArr.reverse();
//                     }

//                     if (_this.isEqualDiff(dataNumArr)) {
//                         // 等差数列，以等差为step
//                         const step = dataNumArr[1] - dataNumArr[0];
//                         applyData = _this.FillExtendNumber(data, len, step);
//                     } else {
//                         // 不是等差数列，复制数据
//                         applyData = _this.FillCopy(data, len);
//                     }
//                 }
//             } else if (dataType === 'date') {
//                 // 数据类型是 日期
//                 if (data.length === 1) {
//                     // 以一天为step
//                     let step = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step = -1;
//                     }

//                     applyData = _this.FillDays(data, len, step);
//                 } else {
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     const judgeDate = _this.judgeDate(data);
//                     if (judgeDate[0] && judgeDate[3]) {
//                         // 日一样，月差为等差数列，以月差为step
//                         const step = dayjs(data[1].m).diff(
//                             dayjs(data[0].m),
//                             'months'
//                         );
//                         applyData = _this.FillMonths(data, len, step);
//                     } else if (!judgeDate[0] && judgeDate[2]) {
//                         // 日不一样，日差为等差数列，以日差为step
//                         const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'days');
//                         applyData = _this.FillDays(data, len, step);
//                     } else {
//                         // 其它，复制数据
//                         applyData = _this.FillCopy(data, len);
//                     }
//                 }
//             } else if (dataType === 'chnNumber') {
//                 // 数据类型是 中文小写数字
//                 if (data.length === 1) {
//                     if (data[0].m === '日' || _this.ChineseToNumber(data[0].m) < 7) {
//                         // 数字小于7，以周一~周日序列填充
//                         let step = 0;
//                         if (
//                             direction === Direction.BOTTOM ||
//                             direction === Direction.RIGHT
//                         ) {
//                             step = 1;
//                         } else if (
//                             direction === Direction.TOP ||
//                             direction === Direction.LEFT
//                         ) {
//                             step = -1;
//                         }

//                         applyData = _this.FillChnWeek(data, len, step);
//                     } else {
//                         // 数字大于7，以中文小写数字序列填充
//                         let step = 0;
//                         if (
//                             direction === Direction.BOTTOM ||
//                             direction === Direction.RIGHT
//                         ) {
//                             step = 1;
//                         } else if (
//                             direction === Direction.TOP ||
//                             direction === Direction.LEFT
//                         ) {
//                             step = -1;
//                         }

//                         applyData = _this.FillChnNumber(data, len, step);
//                     }
//                 } else {
//                     let hasweek = false;
//                     for (let i = 0; i < data.length; i++) {
//                         if (data[i].m === '日') {
//                             hasweek = true;
//                             break;
//                         }
//                     }

//                     const dataNumArr = [];
//                     let weekIndex = 0;
//                     for (let i = 0; i < data.length; i++) {
//                         if (data[i].m === '日') {
//                             if (i === 0) {
//                                 dataNumArr.push(0);
//                             } else {
//                                 weekIndex++;
//                                 dataNumArr.push(weekIndex * 7);
//                             }
//                         } else if (
//                             hasweek &&
//                             _this.ChineseToNumber(data[i].m) > 0 &&
//                             _this.ChineseToNumber(data[i].m) < 7
//                         ) {
//                             dataNumArr.push(
//                                 _this.ChineseToNumber(data[i].m) + weekIndex * 7
//                             );
//                         } else {
//                             dataNumArr.push(_this.ChineseToNumber(data[i].m));
//                         }
//                     }

//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                         dataNumArr.reverse();
//                     }

//                     if (_this.isEqualDiff(dataNumArr)) {
//                         if (
//                             hasweek ||
//                             (dataNumArr[dataNumArr.length - 1] < 6 &&
//                                 dataNumArr[0] > 0) ||
//                             (dataNumArr[0] < 6 &&
//                                 dataNumArr[dataNumArr.length - 1] > 0)
//                         ) {
//                             // 以周一~周日序列填充
//                             const step = dataNumArr[1] - dataNumArr[0];
//                             applyData = _this.FillChnWeek(data, len, step);
//                         } else {
//                             // 以中文小写数字序列填充
//                             const step = dataNumArr[1] - dataNumArr[0];
//                             applyData = _this.FillChnNumber(data, len, step);
//                         }
//                     } else {
//                         // 不是等差数列，复制数据
//                         applyData = _this.FillCopy(data, len);
//                     }
//                 }
//             } else if (dataType === 'chnWeek2') {
//                 // 周一~周日
//                 if (data.length === 1) {
//                     let step = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step = -1;
//                     }

//                     applyData = _this.FillChnWeek2(data, len, step);
//                 } else {
//                     const dataNumArr = [];
//                     let weekIndex = 0;

//                     for (let i = 0; i < data.length; i++) {
//                         const lastTxt = data[i].m.substr(data[i].m.length - 1, 1);
//                         if (data[i].m === '周日') {
//                             if (i === 0) {
//                                 dataNumArr.push(0);
//                             } else {
//                                 weekIndex++;
//                                 dataNumArr.push(weekIndex * 7);
//                             }
//                         } else {
//                             dataNumArr.push(
//                                 _this.ChineseToNumber(lastTxt) + weekIndex * 7
//                             );
//                         }
//                     }

//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                         dataNumArr.reverse();
//                     }

//                     if (_this.isEqualDiff(dataNumArr)) {
//                         // 等差数列，以等差为step
//                         const step = dataNumArr[1] - dataNumArr[0];
//                         applyData = _this.FillChnWeek2(data, len, step);
//                     } else {
//                         // 不是等差数列，复制数据
//                         applyData = _this.FillCopy(data, len);
//                     }
//                 }
//             } else if (dataType === 'chnWeek3') {
//                 // 星期一~星期日
//                 if (data.length === 1) {
//                     let step = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step = -1;
//                     }

//                     applyData = _this.FillChnWeek3(data, len, step);
//                 } else {
//                     const dataNumArr = [];
//                     let weekIndex = 0;

//                     for (let i = 0; i < data.length; i++) {
//                         const lastTxt = data[i].m.substr(data[i].m.length - 1, 1);
//                         if (data[i].m === '星期日') {
//                             if (i === 0) {
//                                 dataNumArr.push(0);
//                             } else {
//                                 weekIndex++;
//                                 dataNumArr.push(weekIndex * 7);
//                             }
//                         } else {
//                             dataNumArr.push(
//                                 _this.ChineseToNumber(lastTxt) + weekIndex * 7
//                             );
//                         }
//                     }

//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                         dataNumArr.reverse();
//                     }

//                     if (_this.isEqualDiff(dataNumArr)) {
//                         // 等差数列，以等差为step
//                         const step = dataNumArr[1] - dataNumArr[0];
//                         applyData = _this.FillChnWeek3(data, len, step);
//                     } else {
//                         // 不是等差数列，复制数据
//                         applyData = _this.FillCopy(data, len);
//                     }
//                 }
//             } else {
//                 // 数据类型是 其它
//                 if (direction === Direction.TOP || direction === Direction.LEFT) {
//                     data.reverse();
//                 }

//                 applyData = _this.FillCopy(data, len);
//             }
//         } else if (type === '2') {
//             // 仅填充格式
//             if (direction === Direction.TOP || direction === Direction.LEFT) {
//                 data.reverse();
//             }

//             applyData = _this.FillOnlyFormat(data, len);
//         } else if (type === '3') {
//             // 不带格式填充
//             const dataArr = _this.getDataByType(data, len, direction, '1', dataType);
//             applyData = _this.FillWithoutFormat(dataArr);
//         } else if (type === '4') {
//             // 以天数填充
//             if (data.length === 1) {
//                 // 以一天为step
//                 let step = 0;
//                 if (
//                     direction === Direction.BOTTOM ||
//                     direction === Direction.RIGHT
//                 ) {
//                     step = 1;
//                 } else if (
//                     direction === Direction.TOP ||
//                     direction === Direction.LEFT
//                 ) {
//                     step = -1;
//                 }

//                 applyData = _this.FillDays(data, len, step);
//             } else if (data.length === 2) {
//                 // 以日差为step
//                 if (direction === Direction.TOP || direction === Direction.LEFT) {
//                     data.reverse();
//                 }

//                 const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'days');
//                 applyData = _this.FillDays(data, len, step);
//             } else {
//                 if (direction === Direction.TOP || direction === Direction.LEFT) {
//                     data.reverse();
//                 }

//                 const judgeDate = _this.judgeDate(data);
//                 if (judgeDate[0] && judgeDate[3]) {
//                     // 日一样，且月差为等差数列，以月差为step
//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'months');
//                     applyData = _this.FillMonths(data, len, step);
//                 } else if (!judgeDate[0] && judgeDate[2]) {
//                     // 日不一样，且日差为等差数列，以日差为step
//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'days');
//                     applyData = _this.FillDays(data, len, step);
//                 } else {
//                     // 日差不是等差数列，复制数据
//                     applyData = _this.FillCopy(data, len);
//                 }
//             }
//         } else if (type === '5') {
//             // 以工作日填充
//             if (data.length === 1) {
//                 // 以一天为step（若那天为休息日，则跳过）
//                 let step = 0;
//                 if (
//                     direction === Direction.BOTTOM ||
//                     direction === Direction.RIGHT
//                 ) {
//                     step = 1;
//                 } else if (
//                     direction === Direction.TOP ||
//                     direction === Direction.LEFT
//                 ) {
//                     step = -1;
//                 }

//                 const newLen = Math.round(len * 1.5);
//                 for (let i = 1; i <= newLen; i++) {
//                     const d = { ...data[i] };

//                     const day = dayjs(d.m).add(i, 'days').day();
//                     if (day === 0 || day === 6) {
//                         continue;
//                     }

//                     const date = dayjs(d.m)
//                         .add(step * i, 'days')
//                         .format('YYYY-MM-DD');
//                     d.m = date;
//                     d.v = generate(date)[2];
//                     applyData.push(d);

//                     if (applyData.length === len) {
//                         break;
//                     }
//                 }
//             } else if (data.length === 2) {
//                 if (
//                     dayjs(data[1].m).date() === dayjs(data[0].m).date() &&
//                     dayjs(data[1].m).diff(dayjs(data[0].m), 'months') !== 0
//                 ) {
//                     // 日一样，且月差大于一月，以月差为step（若那天为休息日，则向前取最近的工作日）
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'months');

//                     for (let i = 1; i <= len; i++) {
//                         const index = (i - 1) % data.length;
//                         const d = { ...data[index] };

//                         const day = dayjs(data[data.length - 1])
//                             .add(step * i, 'months')
//                             .day();
//                         let date;
//                         if (day === 0) {
//                             date = dayjs(data[data.length - 1])
//                                 .add(step * i, 'months')
//                                 .subtract(2, 'days')
//                                 .format('YYYY-MM-DD');
//                         } else if (day === 6) {
//                             date = dayjs(data[data.length - 1])
//                                 .add(step * i, 'months')
//                                 .subtract(1, 'days')
//                                 .format('YYYY-MM-DD');
//                         } else {
//                             date = dayjs(data[data.length - 1])
//                                 .add(step * i, 'months')
//                                 .format('YYYY-MM-DD');
//                         }

//                         d.m = date;
//                         d.v = generate(date)[2];
//                         applyData.push(d);
//                     }
//                 } else {
//                     // 日不一样
//                     if (Math.abs(dayjs(data[1].m).diff(dayjs(data[0].m))) > 7) {
//                         // 若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
//                         let step_month = 0;
//                         if (
//                             direction === Direction.BOTTOM ||
//                             direction === Direction.RIGHT
//                         ) {
//                             step_month = 1;
//                         } else if (
//                             direction === Direction.TOP ||
//                             direction === Direction.LEFT
//                         ) {
//                             step_month = -1;
//                             data.reverse();
//                         }

//                         let step = 0; // 以数组第一个为对比
//                         for (let i = 1; i <= len; i++) {
//                             const index = (i - 1) % data.length;
//                             const d = { ...data[index] };

//                             const num = Math.ceil(i / data.length);
//                             if (index === 0) {
//                                 step = dayjs(d.m)
//                                     .add(step_month * num, 'months')
//                                     .diff(dayjs(d.m), 'days');
//                             }

//                             const day = dayjs(d.m).add(step, 'days').day();
//                             let date;
//                             if (day === 0) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(2, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else if (day === 6) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(1, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .format('YYYY-MM-DD');
//                             }

//                             d.m = date;
//                             d.v = generate(date)[2];
//                             applyData.push(d);
//                         }
//                     } else {
//                         // 若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
//                         let step_day = 0;
//                         if (
//                             direction === Direction.BOTTOM ||
//                             direction === Direction.RIGHT
//                         ) {
//                             step_day = 7;
//                         } else if (
//                             direction === Direction.TOP ||
//                             direction === Direction.LEFT
//                         ) {
//                             step_day = -7;
//                             data.reverse();
//                         }

//                         let step = 0; // 以数组第一个为对比
//                         for (let i = 1; i <= len; i++) {
//                             const index = (i - 1) % data.length;
//                             const d = { ...data[index] };

//                             const num = Math.ceil(i / data.length);
//                             if (index === 0) {
//                                 step = dayjs(d.m)
//                                     .add(step_day * num, 'days')
//                                     .diff(dayjs(d.m), 'days');
//                             }

//                             const day = dayjs(d.m).add(step, 'days').day();
//                             let date;
//                             if (day === 0) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(2, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else if (day === 6) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(1, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .format('YYYY-MM-DD');
//                             }

//                             d.m = date;
//                             d.v = generate(date)[2];
//                             applyData.push(d);
//                         }
//                     }
//                 }
//             } else {
//                 const judgeDate = _this.judgeDate(data);
//                 if (judgeDate[0] && judgeDate[3]) {
//                     // 日一样，且月差为等差数列，以月差为step（若那天为休息日，则向前取最近的工作日）
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'months');

//                     for (let i = 1; i <= len; i++) {
//                         const index = (i - 1) % data.length;
//                         const d = { ...data[index] };

//                         const day = dayjs(data[data.length - 1].m)
//                             .add(step * i, 'months')
//                             .day();
//                         let date;
//                         if (day === 0) {
//                             date = dayjs(data[data.length - 1].m)
//                                 .add(step * i, 'months')
//                                 .subtract(2, 'days')
//                                 .format('YYYY-MM-DD');
//                         } else if (day === 6) {
//                             date = dayjs(data[data.length - 1].m)
//                                 .add(step * i, 'months')
//                                 .subtract(1, 'days')
//                                 .format('YYYY-MM-DD');
//                         } else {
//                             date = dayjs(data[data.length - 1].m)
//                                 .add(step * i, 'months')
//                                 .format('YYYY-MM-DD');
//                         }

//                         d.m = date;
//                         d.v = generate(date)[2];
//                         applyData.push(d);
//                     }
//                 } else if (!judgeDate[0] && judgeDate[2]) {
//                     // 日不一样，且日差为等差数列
//                     if (Math.abs(dayjs(data[1].m).diff(dayjs(data[0].m))) > 7) {
//                         // 若日差大于7天，以一月为step（若那天是休息日，则向前取最近的工作日）
//                         let step_month = 0;
//                         if (
//                             direction === Direction.BOTTOM ||
//                             direction === Direction.RIGHT
//                         ) {
//                             step_month = 1;
//                         } else if (
//                             direction === Direction.TOP ||
//                             direction === Direction.LEFT
//                         ) {
//                             step_month = -1;
//                             data.reverse();
//                         }

//                         let step = 0; // 以数组第一个为对比
//                         for (let i = 1; i <= len; i++) {
//                             const index = (i - 1) % data.length;
//                             const d = { ...data[index] };

//                             const num = Math.ceil(i / data.length);
//                             if (index === 0) {
//                                 step = dayjs(d.m)
//                                     .add(step_month * num, 'months')
//                                     .diff(dayjs(d.m), 'days');
//                             }

//                             const day = dayjs(d.m).add(step, 'days').day();
//                             let date;
//                             if (day === 0) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(2, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else if (day === 6) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(1, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .format('YYYY-MM-DD');
//                             }

//                             d.m = date;
//                             d.v = generate(date)[2];
//                             applyData.push(d);
//                         }
//                     } else {
//                         // 若日差小于等于7天，以7天为step（若那天是休息日，则向前取最近的工作日）
//                         let step_day = 0;
//                         if (
//                             direction === Direction.BOTTOM ||
//                             direction === Direction.RIGHT
//                         ) {
//                             step_day = 7;
//                         } else if (
//                             direction === Direction.TOP ||
//                             direction === Direction.LEFT
//                         ) {
//                             step_day = -7;
//                             data.reverse();
//                         }

//                         let step = 0; // 以数组第一个为对比
//                         for (let i = 1; i <= len; i++) {
//                             const index = (i - 1) % data.length;
//                             const d = { ...data[index] };

//                             const num = Math.ceil(i / data.length);
//                             if (index === 0) {
//                                 step = dayjs(d.m)
//                                     .add(step_day * num, 'days')
//                                     .diff(dayjs(d.m), 'days');
//                             }

//                             const day = dayjs(d.m).add(step, 'days').day();
//                             let date;
//                             if (day === 0) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(2, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else if (day === 6) {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .subtract(1, 'days')
//                                     .format('YYYY-MM-DD');
//                             } else {
//                                 date = dayjs(d.m)
//                                     .add(step, 'days')
//                                     .format('YYYY-MM-DD');
//                             }

//                             d.m = date;
//                             d.v = generate(date)[2];
//                             applyData.push(d);
//                         }
//                     }
//                 } else {
//                     // 日差不是等差数列，复制数据
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     applyData = _this.FillCopy(data, len);
//                 }
//             }
//         } else if (type === '6') {
//             // 以月填充
//             if (data.length === 1) {
//                 // 以一月为step
//                 let step = 0;
//                 if (
//                     direction === Direction.BOTTOM ||
//                     direction === Direction.RIGHT
//                 ) {
//                     step = 1;
//                 } else if (
//                     direction === Direction.TOP ||
//                     direction === Direction.LEFT
//                 ) {
//                     step = -1;
//                 }

//                 applyData = _this.FillMonths(data, len, step);
//             } else if (data.length === 2) {
//                 if (
//                     dayjs(data[1].m).date() === dayjs(data[0].m).date() &&
//                     dayjs(data[1].m).diff(dayjs(data[0].m), 'months') !== 0
//                 ) {
//                     // 日一样，且月差大于一月，以月差为step
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'months');
//                     applyData = _this.FillMonths(data, len, step);
//                 } else {
//                     // 以一月为step
//                     let step_month = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step_month = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step_month = -1;
//                         data.reverse();
//                     }

//                     let step = 0; // 以数组第一个为对比
//                     for (let i = 1; i <= len; i++) {
//                         const index = (i - 1) % data.length;
//                         const d = { ...data[index] };

//                         const num = Math.ceil(i / data.length);
//                         if (index === 0) {
//                             step = dayjs(d.m)
//                                 .add(step_month * num, 'months')
//                                 .diff(dayjs(d.m), 'days');
//                         }

//                         const date = dayjs(d.m)
//                             .add(step, 'days')
//                             .format('YYYY-MM-DD');
//                         d.m = date;
//                         d.v = generate(date)[2];
//                         applyData.push(d);
//                     }
//                 }
//             } else {
//                 const judgeDate = _this.judgeDate(data);
//                 if (judgeDate[0] && judgeDate[3]) {
//                     // 日一样，且月差为等差数列，以月差为step
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'months');
//                     applyData = _this.FillMonths(data, len, step);
//                 } else if (!judgeDate[0] && judgeDate[2]) {
//                     // 日不一样，且日差为等差数列，以一月为step
//                     let step_month = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step_month = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step_month = -1;
//                         data.reverse();
//                     }

//                     let step = 0; // 以数组第一个为对比
//                     for (let i = 1; i <= len; i++) {
//                         const index = (i - 1) % data.length;
//                         const d = { ...data[index] };

//                         const num = Math.ceil(i / data.length);
//                         if (index === 0) {
//                             step = dayjs(d.m)
//                                 .add(step_month * num, 'months')
//                                 .diff(dayjs(d.m), 'days');
//                         }

//                         const date = dayjs(d.m)
//                             .add(step, 'days')
//                             .format('YYYY-MM-DD');
//                         d.m = date;
//                         d.v = generate(date)[2];
//                         applyData.push(d);
//                     }
//                 } else {
//                     // 日差不是等差数列，复制数据
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     applyData = _this.FillCopy(data, len);
//                 }
//             }
//         } else if (type === '7') {
//             // 以年填充
//             if (data.length === 1) {
//                 // 以一年为step
//                 let step = 0;
//                 if (
//                     direction === Direction.BOTTOM ||
//                     direction === Direction.RIGHT
//                 ) {
//                     step = 1;
//                 } else if (
//                     direction === Direction.TOP ||
//                     direction === Direction.LEFT
//                 ) {
//                     step = -1;
//                 }

//                 applyData = _this.FillYears(data, len, step);
//             } else if (data.length === 2) {
//                 if (
//                     dayjs(data[1].m).date() === dayjs(data[0].m).date() &&
//                     dayjs(data[1].m).month() === dayjs(data[0].m).month() &&
//                     dayjs(data[1].m).diff(dayjs(data[0].m), 'years') !== 0
//                 ) {
//                     // 日月一样，且年差大于一年，以年差为step
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'years');
//                     applyData = _this.FillYears(data, len, step);
//                 } else {
//                     // 以一年为step
//                     let step_year = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step_year = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step_year = -1;
//                         data.reverse();
//                     }

//                     let step = 0; // 以数组第一个为对比
//                     for (let i = 1; i <= len; i++) {
//                         const index = (i - 1) % data.length;
//                         const d = { ...data[index] };

//                         const num = Math.ceil(i / data.length);
//                         if (index === 0) {
//                             step = dayjs(d.m)
//                                 .add(step_year * num, 'years')
//                                 .diff(dayjs(d.m), 'days');
//                         }

//                         const date = dayjs(d.m)
//                             .add(step, 'days')
//                             .format('YYYY-MM-DD');
//                         d.m = date;
//                         d.v = generate(date)[2];
//                         applyData.push(d);
//                     }
//                 }
//             } else {
//                 const judgeDate = _this.judgeDate(data);
//                 if (judgeDate[0] && judgeDate[1] && judgeDate[4]) {
//                     // 日月一样，且年差为等差数列，以年差为step
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     const step = dayjs(data[1].m).diff(dayjs(data[0].m), 'years');
//                     applyData = _this.FillYears(data, len, step);
//                 } else if ((judgeDate[0] && judgeDate[3]) || judgeDate[2]) {
//                     // 日一样且月差为等差数列，或天差为等差数列，以一年为step
//                     let step_year = 0;
//                     if (
//                         direction === Direction.BOTTOM ||
//                         direction === Direction.RIGHT
//                     ) {
//                         step_year = 1;
//                     } else if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         step_year = -1;
//                         data.reverse();
//                     }

//                     let step = 0; // 以数组第一个为对比
//                     for (let i = 1; i <= len; i++) {
//                         const index = (i - 1) % data.length;
//                         const d = { ...data[index] };

//                         const num = Math.ceil(i / data.length);
//                         if (index === 0) {
//                             step = dayjs(d.m)
//                                 .add(step_year * num, 'years')
//                                 .diff(dayjs(d.m), 'days');
//                         }

//                         const date = dayjs(d.m)
//                             .add(step, 'days')
//                             .format('YYYY-MM-DD');
//                         d.m = date;
//                         d.v = generate(date)[2];
//                         applyData.push(d);
//                     }
//                 } else {
//                     // 日差不是等差数列，复制数据
//                     if (
//                         direction === Direction.TOP ||
//                         direction === Direction.LEFT
//                     ) {
//                         data.reverse();
//                     }

//                     applyData = _this.FillCopy(data, len);
//                 }
//             }
//         } else if (type === '8') {
//             // 以中文小写数字序列填充
//             if (data.length === 1) {
//                 let step = 0;
//                 if (
//                     direction === Direction.BOTTOM ||
//                     direction === Direction.RIGHT
//                 ) {
//                     step = 1;
//                 } else if (
//                     direction === Direction.TOP ||
//                     direction === Direction.LEFT
//                 ) {
//                     step = -1;
//                 }

//                 applyData = _this.FillChnNumber(data, len, step);
//             } else {
//                 const dataNumArr = [];
//                 for (let i = 0; i < data.length; i++) {
//                     dataNumArr.push(_this.ChineseToNumber(data[i].m));
//                 }

//                 if (direction === Direction.TOP || direction === Direction.LEFT) {
//                     data.reverse();
//                     dataNumArr.reverse();
//                 }

//                 if (_this.isEqualDiff(dataNumArr)) {
//                     const step = dataNumArr[1] - dataNumArr[0];
//                     applyData = _this.FillChnNumber(data, len, step);
//                 } else {
//                     // 不是等差数列，复制数据
//                     applyData = _this.FillCopy(data, len);
//                 }
//             }
//         }

//         return applyData;
//     }

//     static getDataIndex(csLen: number, asLen: number, indexArr: any[]) {
//         const obj = {};

//         const num = Math.floor(asLen / csLen);
//         const rsd = asLen % csLen;

//         let sum = 0;
//         if (num > 0) {
//             for (let i = 1; i <= num; i++) {
//                 for (let j = 0; j < indexArr.length; j++) {
//                     obj[indexArr[j] + (i - 1) * csLen] = sum;
//                     sum++;
//                 }
//             }
//             for (let a = 0; a < indexArr.length; a++) {
//                 if (indexArr[a] <= rsd) {
//                     obj[indexArr[a] + csLen * num] = sum;
//                     sum++;
//                 } else {
//                     break;
//                 }
//             }
//         } else {
//             for (let a = 0; a < indexArr.length; a++) {
//                 if (indexArr[a] <= rsd) {
//                     obj[indexArr[a]] = sum;
//                     sum++;
//                 } else {
//                     break;
//                 }
//             }
//         }

//         return obj;
//     }

//     static FillCopy(data: string | any[], len: number) {
//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillSeries(data: string | any[], len: number, direction: Direction) {
//         const _this = this;

//         const applyData = [];

//         const dataNumArr = [];
//         for (let j = 0; j < data.length; j++) {
//             dataNumArr.push(Number(data[j].v));
//         }

//         if (data.length > 2 && _this.isEqualRatio(dataNumArr)) {
//             // 等比数列
//             for (let i = 1; i <= len; i++) {
//                 const index = (i - 1) % data.length;
//                 const d = { ...data[index] };
//                 let num;
//                 if (
//                     direction === Direction.BOTTOM ||
//                     direction === Direction.RIGHT
//                 ) {
//                     num =
//                         Number(data[data.length - 1].v) *
//                         (Number(data[1].v) / Number(data[0].v)) ** i;
//                 } else if (
//                     direction === Direction.TOP ||
//                     direction === Direction.LEFT
//                 ) {
//                     num =
//                         Number(data[0].v) /
//                         (Number(data[1].v) / Number(data[0].v)) ** i;
//                 }

//                 d.v = num;
//                 d.m = num;
//                 applyData.push(d);
//             }
//         } else {
//             // 线性数列
//             const xArr = _this.getXArr(data.length);
//             for (let i = 1; i <= len; i++) {
//                 const index = (i - 1) % data.length;
//                 const d = { ...data[index] };

//                 let y;
//                 if (
//                     direction === Direction.BOTTOM ||
//                     direction === Direction.RIGHT
//                 ) {
//                     y = _this.forecast(data.length + i, dataNumArr, xArr);
//                 } else if (
//                     direction === Direction.TOP ||
//                     direction === Direction.LEFT
//                 ) {
//                     y = _this.forecast(1 - i, dataNumArr, xArr);
//                 }

//                 d.v = y;
//                 d.m = y;
//                 applyData.push(d);
//             }
//         }

//         return applyData;
//     }

//     static FillExtendNumber(data: string | any[], len: number, step: number) {
//         const _this = this;

//         const applyData = [];
//         const reg = /0|([1-9]+[0-9]*)/g;

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             const last = data[data.length - 1].m;
//             const match = last.match(reg);
//             const lastTxt = match[match.length - 1];

//             const num = Math.abs(Number(lastTxt) + step * i);
//             const lastIndex = last.lastIndexOf(lastTxt);
//             const valueTxt =
//                 last.substr(0, lastIndex) +
//                 num.toString() +
//                 last.substr(lastIndex + lastTxt.length);

//             d.v = valueTxt;
//             d.m = valueTxt;

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillOnlyFormat(data: string | any[], len: number) {
//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             delete d.f;
//             delete d.m;
//             delete d.v;

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillWithoutFormat(dataArr: string | any[]) {
//         const applyData = [];

//         for (let i = 0; i < dataArr.length; i++) {
//             const d = { ...dataArr[i] };

//             let obj;
//             if (d.f === null) {
//                 obj = { m: d.v.toString(), v: d.v };
//             } else {
//                 obj = { f: d.f, m: d.v.toString(), v: d.v };
//             }

//             applyData.push(obj);
//         }

//         return applyData;
//     }

//     static FillDays(data: string | any[], len: number, step: number) {
//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             let date = update('yyyy-MM-dd', d.v);
//             //   let date =  ;
//             date = dayjs(date)
//                 .add(step * i, 'days')
//                 .format('YYYY-MM-DD');

//             d.v = generate(date)[2];
//             d.m = update(d.fm.f, d.v);

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillMonths(data: string | any[], len: number, step: number) {
//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             let date = update('yyyy-MM-dd', d.v);
//             date = dayjs(date)
//                 .add(step * i, 'months')
//                 .format('YYYY-MM-DD');

//             d.v = generate(date)[2];
//             d.m = update(d.fm.f, d.v);

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillYears(data: string | any[], len: number, step: number) {
//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             let date = update('yyyy-MM-dd', d.v);
//             date = dayjs(date)
//                 .add(step * i, 'years')
//                 .format('YYYY-MM-DD');

//             d.v = generate(date)[2];
//             d.m = update(d.fm.t, d.v);

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillChnWeek(data: string | any[], len: number, step: number) {
//         const _this = this;

//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             let num;
//             if (data[data.length - 1].m === '日') {
//                 num = 7 + step * i;
//             } else {
//                 num = _this.ChineseToNumber(data[data.length - 1].m) + step * i;
//             }

//             if (num < 0) {
//                 num = Math.ceil(Math.abs(num) / 7) * 7 + num;
//             }

//             const rsd = num % 7;
//             if (rsd === 0) {
//                 d.m = '日';
//                 d.v = '日';
//             } else if (rsd === 1) {
//                 d.m = '一';
//                 d.v = '一';
//             } else if (rsd === 2) {
//                 d.m = '二';
//                 d.v = '二';
//             } else if (rsd === 3) {
//                 d.m = '三';
//                 d.v = '三';
//             } else if (rsd === 4) {
//                 d.m = '四';
//                 d.v = '四';
//             } else if (rsd === 5) {
//                 d.m = '五';
//                 d.v = '五';
//             } else if (rsd === 6) {
//                 d.m = '六';
//                 d.v = '六';
//             }

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillChnWeek2(data: string | any[], len: number, step: number) {
//         const _this = this;

//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             let num;
//             if (data[data.length - 1].m === '周日') {
//                 num = 7 + step * i;
//             } else {
//                 const last = data[data.length - 1].m;
//                 const txt = last.substr(last.length - 1, 1);
//                 num = _this.ChineseToNumber(txt) + step * i;
//             }

//             if (num < 0) {
//                 num = Math.ceil(Math.abs(num) / 7) * 7 + num;
//             }

//             const rsd = num % 7;
//             if (rsd === 0) {
//                 d.m = '周日';
//                 d.v = '周日';
//             } else if (rsd === 1) {
//                 d.m = '周一';
//                 d.v = '周一';
//             } else if (rsd === 2) {
//                 d.m = '周二';
//                 d.v = '周二';
//             } else if (rsd === 3) {
//                 d.m = '周三';
//                 d.v = '周三';
//             } else if (rsd === 4) {
//                 d.m = '周四';
//                 d.v = '周四';
//             } else if (rsd === 5) {
//                 d.m = '周五';
//                 d.v = '周五';
//             } else if (rsd === 6) {
//                 d.m = '周六';
//                 d.v = '周六';
//             }

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillChnWeek3(data: string | any[], len: number, step: number) {
//         const _this = this;

//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             let num;
//             if (data[data.length - 1].m === '星期日') {
//                 num = 7 + step * i;
//             } else {
//                 const last = data[data.length - 1].m;
//                 const txt = last.substr(last.length - 1, 1);
//                 num = _this.ChineseToNumber(txt) + step * i;
//             }

//             if (num < 0) {
//                 num = Math.ceil(Math.abs(num) / 7) * 7 + num;
//             }

//             const rsd = num % 7;
//             if (rsd === 0) {
//                 d.m = '星期日';
//                 d.v = '星期日';
//             } else if (rsd === 1) {
//                 d.m = '星期一';
//                 d.v = '星期一';
//             } else if (rsd === 2) {
//                 d.m = '星期二';
//                 d.v = '星期二';
//             } else if (rsd === 3) {
//                 d.m = '星期三';
//                 d.v = '星期三';
//             } else if (rsd === 4) {
//                 d.m = '星期四';
//                 d.v = '星期四';
//             } else if (rsd === 5) {
//                 d.m = '星期五';
//                 d.v = '星期五';
//             } else if (rsd === 6) {
//                 d.m = '星期六';
//                 d.v = '星期六';
//             }

//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static FillChnNumber(data: string | any[], len: number, step: number) {
//         const _this = this;

//         const applyData = [];

//         for (let i = 1; i <= len; i++) {
//             const index = (i - 1) % data.length;
//             const d = { ...data[index] };

//             const num = _this.ChineseToNumber(data[data.length - 1].m) + step * i;
//             let txt;
//             if (num <= 0) {
//                 txt = '零';
//             } else {
//                 txt = _this.NumberToChinese(num);
//             }

//             d.v = txt;
//             d.m = txt.toString();
//             applyData.push(d);
//         }

//         return applyData;
//     }

//     static isEqualDiff(arr: string | any[]) {
//         let diff = true;
//         const step = arr[1] - arr[0];

//         for (let i = 1; i < arr.length; i++) {
//             if (arr[i] - arr[i - 1] !== step) {
//                 diff = false;
//                 break;
//             }
//         }

//         return diff;
//     }

//     static isChnNumber(txt: string) {
//         const _this = this;

//         let isChnNumber = true;

//         if (txt.length === 1) {
//             if (txt === '日' || txt in _this.chnNumChar) {
//                 isChnNumber = true;
//             } else {
//                 isChnNumber = false;
//             }
//         } else {
//             const str = txt.split('');
//             for (let i = 0; i < str.length; i++) {
//                 if (!(str[i] in _this.chnNumChar || str[i] in _this.chnNameValue)) {
//                     isChnNumber = false;
//                     break;
//                 }
//             }
//         }

//         return isChnNumber;
//     }

//     static isExtendNumber(txt: string) {
//         const reg = /0|([1-9]+[0-9]*)/g;
//         const isExtendNumber = reg.test(txt);

//         if (isExtendNumber) {
//             const match = txt.match(reg)!;
//             const matchTxt = match[match.length - 1];
//             const matchIndex = txt.lastIndexOf(matchTxt);
//             const beforeTxt = txt.substr(0, matchIndex);
//             const afterTxt = txt.substr(matchIndex + matchTxt.length);

//             return [isExtendNumber, Number(matchTxt), beforeTxt, afterTxt];
//         }
//         return [isExtendNumber];
//     }

//     static isChnWeek1(txt: string) {
//         const _this = this;

//         let isChnWeek1;
//         if (txt.length === 1) {
//             if (txt === '日' || _this.ChineseToNumber(txt) < 7) {
//                 isChnWeek1 = true;
//             } else {
//                 isChnWeek1 = false;
//             }
//         } else {
//             isChnWeek1 = false;
//         }

//         return isChnWeek1;
//     }

//     static isChnWeek2(txt: string | any[]) {
//         let isChnWeek2;
//         if (txt.length === 2) {
//             if (
//                 txt === '周一' ||
//                 txt === '周二' ||
//                 txt === '周三' ||
//                 txt === '周四' ||
//                 txt === '周五' ||
//                 txt === '周六' ||
//                 txt === '周日'
//             ) {
//                 isChnWeek2 = true;
//             } else {
//                 isChnWeek2 = false;
//             }
//         } else {
//             isChnWeek2 = false;
//         }

//         return isChnWeek2;
//     }

//     static isChnWeek3(txt: string | any[]) {
//         let isChnWeek3;
//         if (txt.length === 3) {
//             if (
//                 txt === '星期一' ||
//                 txt === '星期二' ||
//                 txt === '星期三' ||
//                 txt === '星期四' ||
//                 txt === '星期五' ||
//                 txt === '星期六' ||
//                 txt === '星期日'
//             ) {
//                 isChnWeek3 = true;
//             } else {
//                 isChnWeek3 = false;
//             }
//         } else {
//             isChnWeek3 = false;
//         }

//         return isChnWeek3;
//     }

//     static isEqualRatio(arr: string | any[]) {
//         let ratio = true;
//         const step = arr[1] / arr[0];

//         for (let i = 1; i < arr.length; i++) {
//             if (arr[i] / arr[i - 1] !== step) {
//                 ratio = false;
//                 break;
//             }
//         }

//         return ratio;
//     }

//     static getXArr(len: number) {
//         const xArr = [];

//         for (let i = 1; i <= len; i++) {
//             xArr.push(i);
//         }

//         return xArr;
//     }

//     static forecast(x: number, yArr: number[], xArr: string | any[]) {
//         function getAverage(arr: string | any[]) {
//             let sum = 0;

//             for (let i = 0; i < arr.length; i++) {
//                 sum += arr[i];
//             }

//             return sum / arr.length;
//         }

//         const ax = getAverage(xArr); // x数组 平均值
//         const ay = getAverage(yArr); // y数组 平均值

//         let sum_d = 0;
//         let sum_n = 0;
//         for (let j = 0; j < xArr.length; j++) {
//             // 分母和
//             sum_d += (xArr[j] - ax) * (yArr[j] - ay);
//             // 分子和
//             sum_n += (xArr[j] - ax) * (xArr[j] - ax);
//         }

//         let b;
//         if (sum_n === 0) {
//             b = 1;
//         } else {
//             b = sum_d / sum_n;
//         }

//         const a = ay - b * ax;

//         return Math.round((a + b * x) * 100000) / 100000;
//     }

//     static judgeDate(data: string | any[]) {
//         let isSameDay = true;
//         let isSameMonth = true;
//         let isEqualDiffDays = true;
//         let isEqualDiffMonths = true;
//         let isEqualDiffYears = true;
//         const sameDay = dayjs(data[0].m).date();
//         const sameMonth = dayjs(data[0].m).month();
//         const equalDiffDays = dayjs(data[1].m).diff(dayjs(data[0].m), 'days');
//         const equalDiffMonths = dayjs(data[1].m).diff(dayjs(data[0].m), 'months');
//         const equalDiffYears = dayjs(data[1].m).diff(dayjs(data[0].m), 'years');

//         for (let i = 1; i < data.length; i++) {
//             // 日是否一样
//             if (dayjs(data[i].m).date() !== sameDay) {
//                 isSameDay = false;
//             }
//             // 月是否一样
//             if (dayjs(data[i].m).month() !== sameMonth) {
//                 isSameMonth = false;
//             }
//             // 日差是否是 等差数列
//             if (
//                 dayjs(data[i].m).diff(dayjs(data[i - 1].m), 'days') !== equalDiffDays
//             ) {
//                 isEqualDiffDays = false;
//             }
//             // 月差是否是 等差数列
//             if (
//                 dayjs(data[i].m).diff(dayjs(data[i - 1].m), 'months') !==
//                 equalDiffMonths
//             ) {
//                 isEqualDiffMonths = false;
//             }
//             // 年差是否是 等差数列
//             if (
//                 dayjs(data[i].m).diff(dayjs(data[i - 1].m), 'years') !==
//                 equalDiffYears
//             ) {
//                 isEqualDiffYears = false;
//             }
//         }

//         if (equalDiffDays === 0) {
//             isEqualDiffDays = false;
//         }
//         if (equalDiffMonths === 0) {
//             isEqualDiffMonths = false;
//         }
//         if (equalDiffYears === 0) {
//             isEqualDiffYears = false;
//         }

//         return [
//             isSameDay,
//             isSameMonth,
//             isEqualDiffDays,
//             isEqualDiffMonths,
//             isEqualDiffYears,
//         ];
//     }
// }
