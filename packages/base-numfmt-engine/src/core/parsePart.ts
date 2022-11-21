import { resolveLocale } from './locale';

import { u_YEAR, u_MONTH, u_DAY, u_HOUR, u_MIN, u_SEC, u_DSEC, u_CSEC, u_MSEC, EPOCH_1900, EPOCH_1317, _numchars, _sp_chars, indexColors } from './constants';

export interface TokensType {
    type?: string;
    value?: string;
    short?: boolean;
    used?: boolean;
    indeterminate?: boolean;
    size?: number;
    date?: number;
    pad?: number;
    num?: number[];
    rule?: string;
    raw?: string;
    volatile?: boolean;
    plus?: boolean;
    decimals?: number;
}

export interface PartType {
    scale?: number;
    percent?: boolean;
    int_max?: number;
    generated?: boolean;
    denominator?: number;
    num_min?: number;
    den_min?: number;
    text?: boolean;
    group_sec?: number;
    frac_max?: number;
    num_max?: number;
    den_max?: number;
    date?: number;
    exponential?: boolean;
    group_pri?: number;
    exp_plus?: boolean;
    condition?: [string, number];
    fractions?: boolean;
    grouping?: boolean;
    date_eval?: boolean;
    date_system?: number;
    dec_fractions?: boolean;
    sec_decimals?: number;
    pattern?: string;
    general?: boolean;
    integer?: boolean;
    clock?: number;
    locale?: string;
    color?: string;
    int_pattern?: number[];
    frac_pattern?: number[];
    man_pattern?: number[];
    den_pattern?: number[];
    num_pattern?: number[];
    tokens?: TokensType[];
    int_padding?: string;
    man_padding?: string;
    num_padding?: string;
    den_padding?: string;
}

const _pattcache: {
    [key: string]: string;
} = {};

function minMaxPad(str: string, part: object, prefix: string): object {
    part[`${prefix}_max`] = str.length;
    part[`${prefix}_min`] = str.replace(/#/g, '').length;
    return part;
}

function patternToPadding(ss: string): string {
    if (!(ss in _pattcache)) {
        const nch = [];
        const chars = ss.replace(/^[#,]+/, '').replace(/[1-9]\d*/g, (m) => '?'.repeat(m.length));
        for (let i = 0; i < chars.length; i++) {
            const c = chars.charAt(i);
            nch[i] = c in _numchars ? _numchars[c] : c;
        }
        _pattcache[ss] = nch.join('');
    }
    return _pattcache[ss];
}

/**
 * 添加Token
 * @param s
 * @param tokens
 */
function add(s: TokensType | string, tokens: TokensType[]) {
    // allow adding string tokens without wrapping
    if (typeof s === 'string') {
        s = s.replace(/ /g, _numchars['?']);
        s = { type: 'string', value: s };
    }
    // automatically join adjacent string tokens
    if (s.type === 'string' && tokens.length && tokens[tokens.length - 1].type === 'string') {
        tokens[tokens.length - 1].value += s.value;
    } else {
        tokens.push(<TokensType>s);
    }
}

export function parsePart(pattern: string): PartType {
    const tokens = [];
    const part: PartType = {
        scale: 1,
        percent: false,
        text: false,
        denominator: 0,
        date: 0,
        generated: false,
        exponential: false,
        exp_plus: false,
        grouping: false,
        date_eval: false,
        locale: '',
        condition: null,
        date_system: null,
        sec_decimals: 0,
        general: false,
        integer: false,
        group_sec: 0,
        fractions: false,
        group_pri: 0,
        color: '',
        clock: 24,
        int_padding: '',
        man_padding: '',
        num_padding: '',
        den_padding: '',
        dec_fractions: false,
        pattern: '',
        int_pattern: [],
        frac_pattern: [],
        man_pattern: [],
        den_pattern: [],
        num_pattern: [],
        tokens,
    };

    let s = `${pattern}`;
    let current_pattern = 'int';
    let part_over = false;
    let last_number_chunk = null;
    let date_chunks = [];
    let last;
    let have_locale = false;
    let m: RegExpExecArray | string[];

    while (s && !part_over) {
        if ((m = /^General/i.exec(s))) {
            part.general = true;
            add({ type: 'general' }, tokens);
        }

        // new partition
        else if ((current_pattern === 'int' && (m = /^[#?0]+(?:,[#?0]+)*/.exec(s))) || (current_pattern === 'den' && (m = /^[#?\d]+/.exec(s))) || (m = /^[#?0]+/.exec(s))) {
            part[`${current_pattern}_pattern`].push(m[0]);
            last_number_chunk = { type: current_pattern, num: m[0] };
            add(last_number_chunk, tokens);
        }

        // vulgar fractions
        else if ((m = /^\//.exec(s)) && part[`${current_pattern}_pattern`].length) {
            if (!last_number_chunk) {
                // need to have a numerator present
                throw new SyntaxError(`Missing a numerator in pattern ${pattern}`);
            }
            part.fractions = true;
            // ... we just passed the numerator - correct that item
            part.num_pattern.push(part[`${current_pattern}_pattern`].pop());
            last_number_chunk.type = 'num';
            // next up... the denominator
            current_pattern = 'den';
            add({ type: 'div' }, tokens);
        } else if ((m = /^,+/.exec(s))) {
            // decimal scaling
            // * must directly follow a "number character" [#0?] and
            // * must not be followed by a number character
            const followed_by_num = s.charAt(1) in _numchars;
            const following_num = last.slice(-1) in _numchars;
            if (following_num && (m[0].length > 1 || !followed_by_num)) {
                part.scale = 0.001 ** m[0].length;
            } else {
                // regular comma
                add(m[0], tokens);
            }
        } else if ((m = /^;/.exec(s))) {
            part_over = true;
            break; // leave the ";" hanging
        }

        // handlers
        else if ((m = /^[@+-]/.exec(s))) {
            if (m[0] === '@') {
                part.text = true;
            }
            add({ type: _sp_chars[m[0]] }, tokens);
        }

        // [h] [m] [s]
        else if ((m = /^(?:\[(h+|m+|s+)\])/i.exec(s))) {
            const token = m[1].toLowerCase();
            const tok = token[0];
            const bit = {
                type: '',
                size: 0,
                date: 1,
                raw: m[0],
                pad: token.length,
            };
            if (tok === 'h') {
                bit.size = u_HOUR;
                bit.type = 'hour-elap';
            } else if (tok === 'm') {
                bit.size = u_MIN;
                bit.type = 'min-elap';
            } else {
                bit.size = u_SEC;
                bit.type = 'sec-elap';
            }
            // signal date calc and track smallest needed unit
            part.date |= bit.size;
            date_chunks.push(bit);
            add(bit, tokens);
        }

        // Use Hijri calendar system
        else if ((m = /^(?:B2)/i.exec(s))) {
            // signal date system (ignored if defined with [$-xxx])
            if (!have_locale) {
                // TODO: B2 does more than this, it switches locale to [$-060401] (ar) which affects display (RTL)
                part.date_system = EPOCH_1317;
            }
        }

        // Use Gregorian calendar system
        else if ((m = /^(?:B1)/i.exec(s))) {
            // signal date system (ignored if defined with [$-xxx])
            if (!have_locale) {
                part.date_system = EPOCH_1900;
            }
        }

        // hh:mm:ss YYYY-MM-DD
        else if ((m = /^(?:([hHmMsSyYbBdDegG])\1*)/.exec(s))) {
            // Excel is "mostly" case insensitive here but checks the last used date token
            // if it was s or h, minutes is used – same is true if we hit m or s, and last is m
            // m and mm are spurious, mmm is always month
            const bit: TokensType = {
                type: '',
                size: 0,
                date: 1,
                raw: m[0],
                pad: 0,
                indeterminate: false,
                used: false,
            };
            const token = m[0].toLowerCase();
            const tok = token[0];

            if (token === 'y' || token === 'yy') {
                bit.size = u_YEAR;
                bit.type = 'year-short';
            } else if (tok === 'y' || tok === 'e') {
                bit.size = u_YEAR;
                bit.type = 'year';
            } else if (token === 'b' || token === 'bb') {
                bit.size = u_YEAR;
                bit.type = 'b-year-short';
            } else if (tok === 'b') {
                bit.size = u_YEAR;
                bit.type = 'b-year';
            } else if (token === 'd' || token === 'dd') {
                bit.size = u_DAY;
                bit.type = 'day';
                bit.pad = /dd/.test(token) ? 1 : 0;
            } else if (token === 'ddd') {
                bit.size = u_DAY;
                bit.type = 'weekday-short';
            } else if (tok === 'd') {
                bit.size = u_DAY;
                bit.type = 'weekday';
            } else if (tok === 'h') {
                bit.size = u_HOUR;
                bit.type = 'hour';
                bit.pad = /hh/i.test(token) ? 1 : 0;
            } else if (tok === 'm') {
                if (token.length === 3) {
                    bit.size = u_MONTH;
                    bit.type = 'monthname-short';
                } else if (token.length === 5) {
                    bit.size = u_MONTH;
                    bit.type = 'monthname-single';
                } else if (token.length >= 4) {
                    bit.size = u_MONTH;
                    bit.type = 'monthname';
                }
                // m or mm can be either minute or month based on context
                const last_date_chunk = date_chunks[date_chunks.length - 1];
                if (!bit.type && last_date_chunk && !last_date_chunk.used && last_date_chunk.size & (u_HOUR | u_SEC)) {
                    // if this token follows hour or second, it is a minute
                    last_date_chunk.used = true;
                    bit.size = u_MIN;
                    bit.type = 'min';
                    bit.pad = /mm/.test(token) ? 1 : 0;
                }
                // if we still don't know, we treat as a month
                // and defer, a later 'sec' token may switch it
                if (!bit.type) {
                    bit.size = u_MONTH;
                    bit.type = 'month';
                    bit.pad = /mm/.test(token) ? 1 : 0;
                    bit.indeterminate = true;
                }
            } else if (tok === 's') {
                bit.size = u_SEC;
                bit.type = 'sec';
                bit.pad = /ss/.test(token) ? 1 : 0;
                // if last date chunk was m, flag this used
                const last_date_chunk = date_chunks[date_chunks.length - 1];
                if (last_date_chunk && last_date_chunk.size & u_MIN) {
                    bit.used = true;
                }
                // if last date chunk is undecided, we know that it is a minute
                else if (last_date_chunk && last_date_chunk.indeterminate) {
                    delete last_date_chunk.indeterminate;
                    last_date_chunk.size = u_MIN;
                    last_date_chunk.type = 'min';
                    bit.used = true;
                }
            } else if (tok === 'g') {
                // FIXME: Don't know what this does? (yet!)
            }
            // signal date calc and track smallest needed unit
            part.date |= bit.size;
            part.date_eval = true;
            date_chunks.push(bit);
            add(bit, tokens);
        }

        // AM/PM
        // See: https://github.com/SheetJS/sheetjs/issues/676
        else if ((m = /^(?:AM\/PM|am\/pm|A\/P)/.exec(s))) {
            part.clock = 12;
            // TEST: size is here is just a guess, can possibly detect this by rounding?
            part.date |= u_HOUR;
            part.date_eval = true;
            add({ type: 'am', short: m[0] === 'A/P' }, tokens);
        }

        // Note: In locales where decimal symbol is set to "," Excel expects that rather than "."
        // .0 .00 .000
        else if (part.date && (m = /^\.0{1,3}/i.exec(s))) {
            const dec = m[0].length - 1;
            const size = [u_SEC, u_DSEC, u_CSEC, u_MSEC][dec];
            part.date |= size;
            part.date_eval = true;
            part.sec_decimals = Math.max(part.sec_decimals, dec);
            add(
                {
                    type: 'subsec',
                    size,
                    decimals: dec,
                    date: 1,
                    raw: m[0],
                },
                tokens
            );
        }

        // escaped character, string
        else if ((m = /^\\(.)/.exec(s)) || (m = /^"([^"]*?)"/.exec(s))) {
            add(m[1], tokens);
        }

        // condition
        else if ((m = /^\[(<[=>]?|>=?|=)\s*(-?[.\d]+)\]/.exec(s))) {
            part.condition = [m[1], parseFloat(m[2])]; // [ operator, operand ]
        }

        // locale code -- we allow std. "en-US" style codes
        // https://stackoverflow.com/questions/54134729/what-does-the-130000-in-excel-locale-code-130000-mean/54540455#54540455
        else if ((m = /^\[\$([^\]]+)\]/.exec(s))) {
            const bits = m[1].split('-');
            const code = bits.length < 2 ? '' : bits[bits.length - 1];

            const currency = bits[0];
            if (currency) {
                add(currency, tokens);
            }

            const l4e = resolveLocale(code);
            if (l4e) {
                part.locale = l4e;
            }
            const wincode = parseInt(code, 16);
            if (isFinite(wincode) && wincode & 0xff0000) {
                const cal = (wincode >> 16) & 0xff;
                // only Hijri is supported atm.
                if (cal === 6) {
                    part.date_system = EPOCH_1317;
                }
            }

            have_locale = true; // ignore any B2 & B1 tokens
        }

        // color
        else if ((m = /^\[(black|blue|cyan|green|magenta|red|white|yellow|color\s*(\d+))\]/i.exec(s))) {
            part.color = m[2] ? indexColors[parseInt(m[2], 10)] || '#000' : m[1].toLowerCase();
        }

        // WTF
        else if ((m = /^\[(DBNum1|ENG|HIJ|JPN|TWN)\]/i.exec(s))) {
            // ...
        }

        // percentage
        else if ((m = /^%/.exec(s))) {
            part.scale = 100;
            part.percent = true;
            add('%', tokens);
        }

        // skip width
        else if ((m = /^_(\\.|.)/.exec(s))) {
            // UNSUPPORTED: This does what Excel's TEXT function does in this case: Emits a space.
            // It might be worth considering emitting U+200B (zero width space) for the most common pattern, "* ".
            // That way a recipent of the string might still be able to make the spacing work by splitting the number?
            add(' ', tokens);
        }

        // decimal fraction
        else if ((m = /^\./.exec(s))) {
            add({ type: 'point', value: m[0] }, tokens);
            part.dec_fractions = true;
            current_pattern = 'frac';
        }

        // exponent
        else if ((m = /^[Ee]([+-]?|(?=[0#?]))/.exec(s))) {
            // Exponent pattern requires symbol to directly follow "E" but the
            // signature symbol, however, prefixes the first digit of the mantissa
            part.exponential = true;
            part.exp_plus = m[1] === '+';
            current_pattern = 'man';
            add({ type: 'exp', plus: m[1] === '+' }, tokens);
        }

        // fill space with next char
        else if ((m = /^\*(\\.|.)/.exec(s))) {
            // UNSUPPORTED: This does what Excel's TEXT function does in this case: Emits nothing.
        }

        // characters that throw ... because reasons?
        // Excel also throws on ÈÉÊËèéêëĒēĔĕĖėĘęĚěȄȅȆȇȨȩNnÑñŃńŅņŇňǸǹ...
        // but there is limited point in replicating that behaviour
        else if ((m = /^[BENn[]/.exec(s))) {
            throw new SyntaxError(`Unexpected char ${s.charAt(0)} in pattern ${pattern}`);
        }

        // characters are generally allowed to pass directly through
        else {
            m = [s[0]];
            add(m[0], tokens);
        }

        // advance parser
        last = m[0];
        s = s.slice(m ? m[0].length : 1);
    }

    part.pattern = pattern.slice(0, pattern.length - s.length);

    // Quickly determine if this pattern is condition only
    // if so, then add String(value) but using the condition
    if (/^((?:\[[^\]]+\])+)(;|$)/.test(part.pattern) && !/^\[(?:h+|m+|s+)\]/.test(part.pattern)) {
        add({ type: 'text' }, tokens);
    }

    // Make sure we don't have an illegal pattern. We could support this but
    // lets side with Excel here and don't because they make absolutely no sense.
    if ((part.fractions && part.dec_fractions) || (part.fractions && part.exponential)) {
        throw new SyntaxError(`Invalid pattern: ${part.pattern}`);
    }

    // parse number grouping
    const ipatt = part.int_pattern.join('');
    part.grouping = ipatt.indexOf(',') >= 0;
    if (part.grouping) {
        const si = ipatt.split(',');
        const sl = si.length;
        if (sl === 2) {
            part.group_pri = si[1].length;
            part.group_sec = part.group_pri;
        }
        // next block should only
        else if (sl > 2) {
            part.group_pri = si[sl - 1].length;
            part.group_sec = si[sl - 2].length;
        }
    } else {
        part.group_pri = 0;
        part.group_sec = 0;
    }

    minMaxPad(ipatt.replace(/[,]/g, ''), part, 'int');
    minMaxPad(part.frac_pattern.join(''), part, 'frac');
    minMaxPad(part.man_pattern.join(''), part, 'man');

    let num_pat = part.num_pattern.join('');
    let den_pat = part.den_pattern.join('');

    const enforce_padded = /\?/.test(den_pat) || /\?/.test(num_pat);

    // numberical denominator padding type is inherited from numerator padding type
    den_pat = den_pat.replace(/\d/g, enforce_padded ? '?' : '#');
    if (enforce_padded) {
        // this needs to be _before_ min/max
        den_pat = den_pat.replace(/#$/g, '?');
    }

    minMaxPad(num_pat, part, 'num');
    minMaxPad(den_pat, part, 'den');
    if (enforce_padded) {
        // this needs to be _after_ min/max
        num_pat = num_pat.replace(/#$/g, '?');
    }

    part.int_padding = patternToPadding(part.int_pattern.join(''));
    part.man_padding = patternToPadding(part.man_pattern.join(''));

    part.num_padding = patternToPadding(num_pat);
    part.den_padding = patternToPadding(den_pat);

    if (part.den_pattern.length) {
        // detect and set rounding factor for denominator
        part.denominator = parseInt(part.den_pattern.join('').replace(/\D/g, ''), 10);
    }
    part.integer = !!part.int_pattern.join('').length;

    // extra whitespace rules for vulgar fractions
    if (part.fractions) {
        // fragment bits affect surrounding whitespace
        // if either bit is "#", the whitespace around it, and
        // the div symbol, is removed if the bit is not shown
        tokens.forEach((tok, i) => {
            // is next token a "num", "den", or "div"?
            const next = tokens[i + 1];
            if (tok.type === 'string' && next) {
                if (next.type === 'num') {
                    tok.rule = 'num+int';
                } else if (next.type === 'div') {
                    tok.rule = 'num';
                } else if (next.type === 'den') {
                    tok.rule = 'den';
                }
            }
        });
    }

    // dates cannot blend with non-date tokens
    // general cannot blend with non-date tokens
    // -- this is doess not match excel 100% (it seems to allow , as a text token with general)
    // -- excel also does something strange when mixing general with dates (but that can hardly be expected to work)
    if ((part.date || part.general) && (part.int_pattern.length || part.frac_pattern.length || part.scale !== 1 || part.text)) {
        throw new Error('Illegal format');
    }

    if (!part.date_system) {
        part.date_system = EPOCH_1900;
    }

    return part;
}
