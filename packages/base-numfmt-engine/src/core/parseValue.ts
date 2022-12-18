import { dateFromSerial } from './serialDate';

/*
This is a list of the allowed date formats. The test file contains
the full list of permuations and the resulting values and formats.

Legend:
  "-" - Date separator (any of "/" | "-" | " " | "."⁽¹⁾ | ", "⁽²⁾)
  " " - Whitespace
  "j" - Day without leading zero (1-31)
  "d" - Day with leading zero (00-31)
  "D" - Abbreviated day name ("Sun"-"Sat")
  "l" - Full day name ("Sunday"-"Saturday")
  "n" - Month without leading zero (1-12)
  "m" - Month with leading zero (01-12)
  "F" - Full month name ("Janary"-"December")
  "M" - Abbreviated month name ("Jan"-"Dec")
  "y" - Year without century (00-99)
  "Y" - Year of our lord (1900-9999)
  "x" - Time of day (all formats: "10 PM", "10:11:12", ...)

¹ Only considered valid if there are three or more sections to the date.
² Comma is only allowed if followed by a space.

Time is appended to each of these as they are inserted into the
collection of valid dates below.
*/
const okDateFormats = [
    'd-F-y',
    'd-F-Y',
    'd-M-y',
    'd-M-Y',
    'F-d-y',
    'F-d-Y',
    'F-j-y',
    'F-j-Y',
    'j-F-y',
    'j-F-Y',
    'j-M-y',
    'j-M-Y',
    'M-d-y',
    'M-d-Y',
    'M-j-y',
    'M-j-Y',
    'm-d-y',
    'm-d-Y',
    'm-j-y',
    'm-j-Y',
    'n-d-y',
    'n-d-Y',
    'n-j-y',
    'n-j-Y',
    'y-F-d',
    'y-F-j',
    'y-M-d',
    'y-M-j',
    'Y-F-d',
    'Y-F-j',
    'Y-M-d',
    'Y-m-d',
    'Y-M-j',
    'Y-m-j',
    'Y-n-d',
    'Y-n-j',
    'M-d',
    'M-j',
    'd-F',
    'd-M',
    'n-d',
    'n-j',
    'j-F',
    'j-M',
    'M-Y',
    'n-Y',
    'm-d',
    'F-d',
    'm-j',
    'F-j',
    'm-Y',
    'F-Y',
    'Y-M',
    'Y-n',
    'Y-m',
    'Y-F',
    'Y-M',
];

// date formats are stored as a token-tree in a trie
// for minimal looping and branching while parsing
const dateTrie = {};
function packDate(f, node) {
    if (f) {
        const char = f[0];
        node[char] = node[char] || {};
        packDate(f.slice(1), node[char]);
    } else {
        node.$ = true;
    }
}
okDateFormats.forEach((fmt) => {
    // add date to token tree
    packDate(fmt, dateTrie);
    // add a variant of the date with time suffixed
    // Excel allows time first, but Sheets and GRID do not
    packDate(`${fmt} x`, dateTrie);
    // add a variant of the date with weekdats pre/suffixed
    packDate(`${fmt} l`, dateTrie);
    packDate(`${fmt} l x`, dateTrie);
    packDate(`l ${fmt}`, dateTrie);
    packDate(`l ${fmt} x`, dateTrie);
    packDate(`${fmt} D`, dateTrie);
    packDate(`${fmt} D x`, dateTrie);
    packDate(`D ${fmt}`, dateTrie);
    packDate(`D ${fmt} x`, dateTrie);
});

/* eslint-disable object-property-newline */
const monthsM = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
};
// note: May is missing here, it is always parsed as M
const monthsF = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
};
const days = {
    sunday: 'l',
    monday: 'l',
    tuesday: 'l',
    wednesday: 'l',
    thursday: 'l',
    friday: 'l',
    saturday: 'l',
    sun: 'D',
    mon: 'D',
    tue: 'D',
    wed: 'D',
    thu: 'D',
    fri: 'D',
    sat: 'D',
};
/* eslint-enable */

const currentYear = new Date().getUTCFullYear();

export function parseNumber(str) {
    // this horrifying expression assumes that we only need #,###.### and never #.###,###
    const parts = /^([\s+%$(-]*)(((?:(?:\d[\d,]*)(?:\.\d*)?|(?:\.\d+)))([eE][+-]?\d+)?)([\s%$)]*)$/.exec(str);
    if (parts) {
        const [, prefix, number, numpart, exp, suffix] = parts;
        let sign = 1;
        let format = '';
        let minus = false;
        let openParen = false;
        let closeParen = false;
        let percent = false;
        let dollar = false;
        let dollarTailing = false;
        let value = parseFloat(number.replace(/,/g, ''));
        // is number ok?
        if (!isFinite(value)) {
            return null;
        }
        // is prefix ok?
        for (let i = 0; i < prefix.length; i++) {
            const char = prefix[i];
            // only 1 occurance of these is allowed
            if (char === '-') {
                if (minus || openParen) {
                    return null;
                }
                minus = true;
                sign = -1;
            } else if (char === '$') {
                if (dollar) {
                    return null;
                }
                dollar = true;
            } else if (char === '(') {
                if (openParen || minus) {
                    return null;
                }
                openParen = true;
                sign = -1;
            } else if (char === '%') {
                if (percent) {
                    return null;
                }
                percent = true;
            }
        }
        // is suffix ok?
        for (let i = 0; i < suffix.length; i++) {
            const char = suffix[i];
            // only 1 occurance of these is allowed
            if (char === '$') {
                if (dollar) {
                    return null;
                }
                dollar = true;
                dollarTailing = true;
            } else if (char === ')') {
                if (closeParen || !openParen) {
                    return null;
                }
                closeParen = true;
            } else if (char === '%') {
                if (percent) {
                    return null;
                }
                percent = true;
            }
        }
        if (exp) {
            if (percent || dollar) {
                return null;
            }
            // allow parens and minus, but not %$
            format = '0.00E+00';
        } else if (percent) {
            if (dollar) {
                // Sheets allows this: $123% => $1.23 (Excel does not)
                return null;
            }
            // numpart dictates how "deep" the format is: "0" vs "0.00"
            format = numpart.includes('.') ? '0.00%' : '0%';
            value *= 0.01;
        } else if (dollar) {
            // numpart dictates how "deep" the format is: "0" vs "0.00"
            if (dollarTailing) {
                format = numpart.includes('.') ? '#,##0.00$' : '#,##0$';
            } else {
                format = numpart.includes('.') ? '$#,##0.00' : '$#,##0';
            }
        } else if (numpart.includes(',')) {
            format = numpart.includes('.') ? '#,##0.00' : '#,##0';
        }
        // we may want to lower the fidelity of the number: +p.value.toFixed(13)
        const ret = { v: value * sign, z: '' };
        if (format) {
            ret.z = format;
        }
        return ret;
    }
}

export function isValidDate(y, m, d) {
    // day can't be 0
    if (d < 1) {
        return false;
    }
    // month must be 1-12
    if (m < 1 || m > 12) {
        return false;
    }
    // february
    if (m === 2) {
        const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        // 1900 is a leap year in Excel
        const febDays = isLeapYear || y === 1900 ? 29 : 28;
        if (d > febDays) {
            return false;
        }
    }
    // test any other month
    else if (((m === 4 || m === 6 || m === 9 || m === 11) && d > 30) || ((m === 1 || m === 3 || m === 5 || m === 7 || m === 8 || m === 10 || m === 12) && d > 31)) {
        return false;
    }
    return true;
}

const nextToken = (str, node, data) => {
    const path = data.path || '';
    const matchOrder = Object.keys(node);
    for (let i = 0; i < matchOrder.length; i++) {
        let r;
        const t = matchOrder[i];
        if (!node[t]) {
            continue;
        }
        if (t === '$') {
            // if string is done, then we can return
            if (!str) {
                r = data;
            }
        } else if (t === '-') {
            const m = /^(\s*([./-]|,\s)\s*|\s+)/.exec(str);
            if (m) {
                // const sep = (!m[1] || m[1] === '.' || m[1] === ',') ? ' ' : m[0].trim();
                const sep = m[1] === '-' || m[1] === '/' || m[1] === '.' ? m[1] : ' ';
                // don't allow mixing date separators
                if (!data.sep || data.sep === sep) {
                    const s = m[0].replace(/\s+/g, ' ');
                    r = nextToken(str.slice(m[0].length), node[t], { ...data, sep, path: path + s });
                    // r = nextToken(str.slice(m[0].length), node[t], { ...data, sep, path: path + sep });
                }
            }
        } else if (t === ' ') {
            const m = /^[,.]?\s+/.exec(str);
            if (m) {
                const s = m[0].replace(/\s+/g, ' ');
                r = nextToken(str.slice(m[0].length), node[t], { ...data, path: path + s });
            }
        } else if (t === 'j' || t === 'd') {
            const m = /^(0?[1-9]|1\d|2\d|3[01])\b/.exec(str);
            if (m) {
                r = nextToken(str.slice(m[0].length), node[t], { ...data, day: m[0], path: path + t });
            }
        } else if (t === 'n' || t === 'm') {
            const m = /^(0?[1-9]|1[012])\b/.exec(str);
            if (m) {
                r = nextToken(str.slice(m[0].length), node[t], {
                    ...data,
                    month: +m[0],
                    _mon: m[0],
                    path: path + t,
                });
            }
        } else if (t === 'F' || t === 'M') {
            const m = /^([a-z]{3,9})\b/i.exec(str);
            const v = m && (t === 'F' ? monthsF : monthsM)[m[0].toLowerCase()];
            if (v) {
                r = nextToken(str.slice(m[0].length), node[t], {
                    ...data,
                    month: v,
                    _mon: m[0],
                    path: path + t,
                });
            }
        } else if (t === 'l' || t === 'D') {
            const m = /^([a-z]{3,9})\b/i.exec(str);
            const v = m && days[m[0].toLowerCase()];
            if (v === t) {
                // the value is ignored
                r = nextToken(str.slice(m[0].length), node[t], { ...data, path: path + t });
            }
        } else if (t === 'y') {
            const m = /^\d\d\b/.exec(str);
            if (m) {
                const y = +m[0] >= 30 ? +m[0] + 1900 : +m[0] + 2000;
                r = nextToken(str.slice(m[0].length), node[t], { ...data, year: y, path: path + t });
            }
        } else if (t === 'Y') {
            const m = /^\d\d\d\d\b/.exec(str);
            if (m) {
                r = nextToken(str.slice(m[0].length), node[t], { ...data, year: +m[0], path: path + t });
            }
        } else if (t === 'x') {
            const time = parseTime(str);
            if (time) {
                r = nextToken('', node[t], {
                    ...data,
                    time: time.v,
                    tf: time.z,
                    path: path + t,
                });
            }
        } else {
            throw new Error(`Unknown date token "${t}"`);
        }
        if (r) {
            return r;
        }
    }
};

export function parseDate(str, opts) {
    if (!str) return null;
    // possible shortcut: quickly dismiss if there isn't a number?
    const date = nextToken(str.trim(), dateTrie, { path: '' });
    if (date) {
        // disallow matches where two tokens are separated by a period
        if (date.sep === '.' && date.path.length === 3) {
            return null;
        }
        const year = +(date.year ?? currentYear);
        if (!date.day) {
            date.day = 1;
        }
        // don't allow input of 31st apr, or 29th feb on non-leap years
        if (!isValidDate(year, date.month, date.day)) {
            return null;
        }
        let epoch = -Infinity;
        if (year < 1900) {
            return null;
        }
        if (year <= 1900 && date.month <= 2) {
            epoch = 25568;
        } else if (year < 10000) {
            epoch = 25569;
        }
        const value = Date.UTC(year, date.month - 1, date.day) / 864e5 + epoch + (date.time || 0);
        if (value >= 0 && value <= 2958465) {
            const lead0 =
                // either has a leading zero
                date._mon[0] === '0' ||
                date.day[0] === '0' ||
                // both are 2-digits long
                (date._mon.length === 2 && date.day.length === 2);
            // console.error(date.path);
            const format = date.path.replace(/[jdlDnmMFyYx-]/g, (a) => {
                if (a === 'j' || a === 'd') {
                    return lead0 ? 'dd' : 'd';
                }
                if (a === 'D') {
                    return 'ddd';
                }
                if (a === 'l') {
                    return 'dddd';
                }
                if (a === 'n' || a === 'm') {
                    return lead0 ? 'mm' : 'm';
                }
                if (a === 'M') {
                    return 'mmm';
                }
                if (a === 'F') {
                    return 'mmmm';
                }
                if (a === 'y') {
                    return 'yy';
                }
                if (a === 'x') {
                    return date.tf || '';
                }
                if (a === 'Y') {
                    return 'yyyy';
                }
                return a;
            });
            if (opts && opts.nativeDate) {
                return { v: dateFromSerial(value, opts), z: format };
            }
            return { v: value, z: format };
        }
    }
    return null;
}

export function parseTime(str) {
    const parts = /^\s*([10]?\d|2[0-4])(?::([0-5]\d|\d))?(?::([0-5]\d|\d))?(\.\d{1,10})?(?:\s*([AP])M?)?\s*$/i.exec(str);
    if (parts) {
        const [, h, m, s, f, am] = parts;
        // don't allow milliseconds without seconds
        if (f && !s) {
            return null;
        }
        // single number must also include AM/PM part
        if (!am && !m && !s) {
            return null;
        }
        // AM/PM part must align with hours
        let hrs = parseFloat(h) || 0;
        if (am) {
            // 00:00 AM - 12:00 AM
            if (hrs >= 13) {
                return null;
            }
            if (am[0] === 'p' || am[0] === 'P') {
                hrs += 12;
            }
        }
        const min = parseFloat(m) || 0;
        const sec = parseFloat(s) || 0;
        const mss = parseFloat(f) || 0;
        return {
            v: (hrs * 60 * 60 + min * 60 + sec + mss) / (60 * 60 * 24),
            z: `${h.length === 2 ? 'hh' : 'h'}:mm${s ? ':ss' : ''}${am ? ' AM/PM' : ''}`,
        };
    }
    return null;
}

export function parseBool(str) {
    if (/^\s*true\s*$/i.test(str)) {
        return { v: true };
    }
    if (/^\s*false\s*$/i.test(str)) {
        return { v: false };
    }
    return null;
}

export function parseValue(s, opts?): { v: Date | number[]; z: any } | { v: number; z: any } | { v: boolean } {
    return parseNumber(s) ?? parseDate(s, opts) ?? parseTime(s) ?? parseBool(s);
}
