import numeral from 'numeral';
import { IKeyType } from './Types';

export const error: IKeyType<string> = {
    v: '#VALUE!', // 错误的参数或运算符
    n: '#NAME?', // 公式名称错误
    na: '#N/A', // 函数或公式中没有可用数值
    r: '#REF!', // 删除了由其他公式引用的单元格
    d: '#DIV/0!', // 除数是0或空单元格
    nm: '#NUM!', // 当公式或函数中某个数字有问题时
    nl: '#NULL!', // 交叉运算符（空格）使用不正确
    sp: '#SPILL!', // 数组范围有其它值
};
// 是否是错误类型
function valueIsError(value: string) {
    let isError = false;

    for (const x in error) {
        if (value === error[x]) {
            isError = true;
            break;
        }
    }

    return isError;
}

// 是否是纯数字
export function isRealNum(val: string | number) {
    if (val === null || val.toString().replace(/\s/g, '') === '') {
        return false;
    }

    if (typeof val === 'boolean') {
        return false;
    }

    if (!isNaN(val as number)) {
        return true;
    }
    return false;
}

function isdatetime(s: string | null) {
    if (s === null || s.toString().length < 5) {
        return false;
    }
    if (checkDateTime(s)) {
        return true;
    }
    return false;

    function checkDateTime(str: string) {
        const reg1 =
            /^(\d{4})-(\d{1,2})-(\d{1,2})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;
        const reg2 =
            /^(\d{4})\/(\d{1,2})\/(\d{1,2})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;

        if (!reg1.test(str) && !reg2.test(str)) {
            return false;
        }

        const year = RegExp.$1 as unknown as number;
        const month = RegExp.$2 as unknown as number;
        const day = RegExp.$3 as unknown as number;

        if (year < 1900) {
            return false;
        }

        if (month > 12) {
            return false;
        }

        if (day > 31) {
            return false;
        }

        if (month === 2) {
            if (new Date(year, 1, 29).getDate() === 29 && day > 29) {
                return false;
            }
            if (new Date(year, 1, 29).getDate() !== 29 && day > 28) {
                return false;
            }
        }

        return true;
    }
}

let good_pd_date = new Date('2017-02-19T19:06:09.000Z');
if (Number.isNaN(good_pd_date.getFullYear())) good_pd_date = new Date('2/19/17');
const good_pd = good_pd_date.getFullYear() === 2017;
function parseDate(str: string | Date, fixdate?: number) {
    const d = new Date(str);
    if (good_pd) {
        if ((fixdate as number) > 0) {
            d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
        } else if ((fixdate as number) < 0) {
            d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
        }
        return d;
    }
    if (str instanceof Date) return str;
    if (good_pd_date.getFullYear() === 1917 && !Number.isNaN(d.getFullYear())) {
        const s = d.getFullYear();
        if (str.indexOf(`${s}`) > -1) return d;
        d.setFullYear(d.getFullYear() + 100);
        return d;
    }
    const n = str.match(/\d+/g) || ['2017', '2', '19', '0', '0', '0'];
    let out = new Date(+n[0], +n[1] - 1, +n[2], +n[3] || 0, +n[4] || 0, +n[5] || 0);
    if (str.indexOf('Z') > -1)
        out = new Date(out.getTime() - out.getTimezoneOffset() * 60 * 1000);
    return out;
}

const base1904 = new Date(1900, 2, 1, 0, 0, 0);
export function datenum_local(v: Date, date1904?: number) {
    let epoch = Date.UTC(
        v.getFullYear(),
        v.getMonth(),
        v.getDate(),
        v.getHours(),
        v.getMinutes(),
        v.getSeconds()
    );
    const dnthresh_utc = Date.UTC(1899, 11, 31, 0, 0, 0);

    if (date1904) epoch -= 1461 * 24 * 60 * 60 * 1000;
    else if (v >= base1904) epoch += 24 * 60 * 60 * 1000;
    return (epoch - dnthresh_utc) / (24 * 60 * 60 * 1000);
}

export function generate(value: string): any {
    // 万 单位格式增加！！！
    const ret = [];
    let m = null;
    let ct: any = {};
    let v: any = value;

    if (value === null) {
        return null;
    }

    if (/^-?[0-9]{1,}[,][0-9]{3}(.[0-9]{1,2})?$/.test(value)) {
        // 表述金额的字符串，如：12,000.00 或者 -12,000.00
        m = value;
        v = Number(value.split('.')[0].replace(',', ''));
        let fa = '#,##0';
        if (value.split('.')[1]) {
            fa = '#,##0.';
            for (let i = 0; i < value.split('.')[1].length; i++) {
                fa += 0;
            }
        }
        ct = { fa, t: 'n' };
    } else if (value.toString().substr(0, 1) === "'") {
        m = value.toString().substr(1);
        ct = { fa: '@', t: 's' };
    } else if (value.toString().toUpperCase() === 'TRUE') {
        m = 'TRUE';
        ct = { fa: 'General', t: 'b' };
        v = true;
    } else if (value.toString().toUpperCase() === 'FALSE') {
        m = 'FALSE';
        ct = { fa: 'General', t: 'b' };
        v = false;
    } else if (valueIsError(value)) {
        m = value.toString();
        ct = { fa: 'General', t: 'e' };
    } else if (
        /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
            value
        )
    ) {
        m = value.toString();
        ct = { fa: '@', t: 's' };
    } else if (
        isRealNum(value) &&
        Math.abs(parseFloat(value)) > 0 &&
        (Math.abs(parseFloat(value)) >= 1e11 || Math.abs(parseFloat(value)) < 1e-9)
    ) {
        v = numeral(value).value();
        const str = v.toExponential();
        if (str.indexOf('.') > -1) {
            let strlen = str.split('.')[1].split('e')[0].length;
            if (strlen > 5) {
                strlen = 5;
            }

            ct = { fa: `#0.${new Array(strlen + 1).join('0')}E+00`, t: 'n' };
        } else {
            ct = { fa: '#0.E+00', t: 'n' };
        }

        m = SSF.format(ct.fa, v);
    } else if (value.toString().indexOf('%') > -1) {
        const index = value.toString().indexOf('%');
        let value2 = value.toString().substr(0, index);
        const value3 = value2.replace(/,/g, '');

        if (index === value.toString().length - 1 && isRealNum(value3)) {
            if (value2.indexOf('.') > -1) {
                if (value2.indexOf('.') === value2.lastIndexOf('.')) {
                    const value4 = value2.split('.')[0];
                    const value5 = value2.split('.')[1];

                    let len = value5.length;
                    if (len > 9) {
                        len = 9;
                    }

                    if (value4.indexOf(',') > -1) {
                        let isThousands = true;
                        let ThousandsArr = value4.split(',');

                        for (let i = 1; i < ThousandsArr.length; i++) {
                            if (ThousandsArr[i].length < 3) {
                                isThousands = false;
                                break;
                            }
                        }

                        if (isThousands) {
                            ct = {
                                fa: `#,##0.${new Array(len + 1).join('0')}%`,
                                t: 'n',
                            };
                            v = numeral(value).value();
                            m = SSF.format(ct.fa, v);
                        } else {
                            m = value.toString();
                            ct = { fa: '@', t: 's' };
                        }
                    } else {
                        ct = {
                            fa: `0.${new Array(len + 1).join('0')}%`,
                            t: 'n',
                        };
                        v = numeral(value).value();
                        m = SSF.format(ct.fa, v);
                    }
                } else {
                    m = value.toString();
                    ct = { fa: '@', t: 's' };
                }
            } else if (value2.indexOf(',') > -1) {
                let isThousands = true;
                let ThousandsArr = value2.split(',');

                for (let i = 1; i < ThousandsArr.length; i++) {
                    if (ThousandsArr[i].length < 3) {
                        isThousands = false;
                        break;
                    }
                }

                if (isThousands) {
                    ct = { fa: '#,##0%', t: 'n' };
                    v = numeral(value).value();
                    m = SSF.format(ct.fa, v);
                } else {
                    m = value.toString();
                    ct = { fa: '@', t: 's' };
                }
            } else {
                ct = { fa: '0%', t: 'n' };
                v = numeral(value).value();
                m = SSF.format(ct.fa, v);
            }
        } else {
            m = value.toString();
            ct = { fa: '@', t: 's' };
        }
    } else if (value.toString().indexOf('.') > -1) {
        if (value.toString().indexOf('.') === value.toString().lastIndexOf('.')) {
            const value1 = value.toString().split('.')[0];
            let value2 = value.toString().split('.')[1];

            let len = value2.length;
            if (len > 9) {
                len = 9;
            }

            if (value1.indexOf(',') > -1) {
                let isThousands = true;
                let ThousandsArr = value1.split(',');

                for (let i = 1; i < ThousandsArr.length; i++) {
                    if (!isRealNum(ThousandsArr[i]) || ThousandsArr[i].length < 3) {
                        isThousands = false;
                        break;
                    }
                }

                if (isThousands) {
                    ct = { fa: `#,##0.${new Array(len + 1).join('0')}`, t: 'n' };
                    v = numeral(value).value();
                    m = SSF.format(ct.fa, v);
                } else {
                    m = value.toString();
                    ct = { fa: '@', t: 's' };
                }
            } else if (isRealNum(value1) && isRealNum(value2)) {
                ct = { fa: `0.${new Array(len + 1).join('0')}`, t: 'n' };
                v = numeral(value).value();
                m = SSF.format(ct.fa, v);
            } else {
                m = value.toString();
                ct = { fa: '@', t: 's' };
            }
        } else {
            m = value.toString();
            ct = { fa: '@', t: 's' };
        }
    } else if (isRealNum(value)) {
        m = value.toString();
        ct = { fa: 'General', t: 'n' };
        v = parseFloat(value);
    } else if (
        isdatetime(value) &&
        (value.toString().indexOf('.') > -1 ||
            value.toString().indexOf(':') > -1 ||
            value.toString().length < 16)
    ) {
        v = datenum_local(parseDate(value.toString().replace(/-/g, '/')));

        if (v.toString().indexOf('.') > -1) {
            if (value.toString().length > 18) {
                ct.fa = 'yyyy-MM-dd hh:mm:ss';
            } else if (value.toString().length > 11) {
                ct.fa = 'yyyy-MM-dd hh:mm';
            } else {
                ct.fa = 'yyyy-MM-dd';
            }
        } else {
            ct.fa = 'yyyy-MM-dd';
        }

        ct.t = 'd';
        m = SSF.format(ct.fa, v);
    } else {
        m = value;
        ct.fa = 'General';
        ct.t = 'g';
    }

    return [m, ct, v];
}

const SSF = {
    format(a: any, b: any) {},
};

export const update = (a: any, b: any): any => {};
