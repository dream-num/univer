import { clamp } from './clamp';
import {
    _numchars,
    EPOCH_1317,
    MAX_L_DATE,
    MAX_S_DATE,
    MIN_L_DATE,
    MIN_S_DATE,
    u_CSEC,
    u_DSEC,
    u_HOUR,
    u_MIN,
    u_MSEC,
    u_SEC,
} from './constants';
import { dec2frac } from './dec2frac';
import { general } from './general';
import { defaultLocale, LocaleData } from './locale';
import { OptionsData } from './options';
import { PartType } from './parse-part';
import { round } from './round';
import { toYMD } from './to-ymd';

const short_to_long = {
    int: 'integer',
    frac: 'fraction',
    man: 'mantissa',
    num: 'numerator',
    den: 'denominator',
};
const DAYSIZE = 86400;

/**
 * @param value
 * @param bigRange
 * @returns
 */
const dateOverflows = (value: number, bigRange: any) => {
    if (bigRange) {
        return value < MIN_L_DATE || value >= MAX_L_DATE;
    }
    return value < MIN_S_DATE || value >= MAX_S_DATE;
};

/**
 *
 * @param value
 * @param part
 * @param opts
 * @param l10n_
 */
export function runPart(value: number, part: PartType | any, opts: OptionsData, l10n_: LocaleData): any {
    let mantissa = '';
    let numerator = '';
    let denominator = '';
    let fraction = '';
    let integer = '';
    let exp = 0;

    let date = value | 0;
    let time = 0;
    let year = 0;
    let month = 1;
    let day = 0;
    let weekday = 0;
    let hour = 0;
    let minute = 0;
    let second = 0;
    let subsec = 0;

    const l10n: any = l10n_ || defaultLocale;

    // scale number
    if (!part.text && isFinite(part.scale) && part.scale !== 1) {
        value = clamp(value * part.scale);
    }
    // calc exponent
    if (part.exponential) {
        let v = Math.abs(value);
        if (v) {
            exp = Math.round(Math.log10(v));
        }
        if (part.int_max > 1) {
            exp = Math.floor(exp / part.int_max) * part.int_max;
        }
        v = exp < 0 ? v * 10 ** -exp : v / 10 ** exp;
        value = value < 0 ? -v : v;
        mantissa += Math.abs(exp);
    }
    // integer to text
    if (part.integer) {
        const i = Math.abs(round(value, part.fractions ? 1 : part.frac_max));
        integer += i < 1 ? '' : Math.floor(i);
    }

    // grouping
    if (part.grouping) {
        let gtmp = '';
        let ipos = integer.length;
        if (ipos > part.group_pri) {
            ipos -= part.group_pri;
            gtmp = l10n.group + integer.slice(ipos, ipos + part.group_pri) + gtmp;
        }
        while (ipos > part.group_sec) {
            ipos -= part.group_sec;
            gtmp = l10n.group + integer.slice(ipos, ipos + part.group_sec) + gtmp;
        }
        integer = ipos ? integer.slice(0, ipos) + gtmp : gtmp;
    }

    // fraction to text
    if (part.dec_fractions) {
        fraction = String(round(value, part.frac_max)).split('.')[1] || '';
    }

    // using vulgar fractions
    let have_fraction = false;
    if (part.fractions) {
        const _dec = Math.abs(part.integer ? value % 1 : value);
        if (_dec) {
            have_fraction = true;
            if (isFinite(part.denominator)) {
                // predefined denominator
                denominator += part.denominator;
                numerator += round(_dec * part.denominator);
                if (numerator === '0') {
                    numerator = '';
                    denominator = '';
                    have_fraction = false;
                    if (!integer) {
                        integer = '0';
                    }
                }
            } else {
                const nmax = part.integer ? part.num_max : Infinity;
                const frt = dec2frac(_dec, nmax, part.den_max);
                numerator += frt[0];
                denominator += frt[1];
                if (part.integer) {
                    if (numerator === '0') {
                        if (!integer) {
                            integer = '0';
                        }
                        numerator = '';
                        denominator = '';
                        have_fraction = false;
                    }
                }
            }
        }
    }

    // using date/time
    if (part.date_eval && dateOverflows(value, opts.dateSpanLarge)) {
        // if value is out of bounds and formatting is date Excel emits "#########" (full cell)
        // this does not happen, if the only date tokens are elapsed time
        // This copies the TEXT function which emits a #VALUE! error
        if (opts.dateErrorThrows) {
            throw new Error('Date out of bounds');
        }
        if (opts.dateErrorNumber) {
            return general([], {}, value, l10n).join('');
        }
        return opts.overflow;
    }
    if (part.date) {
        date = value | 0;
        const t = DAYSIZE * (value - date);
        time = Math.floor(t); // in seconds

        // "epsilon" correction
        subsec = t - time;
        if (Math.abs(subsec) < 1e-6) {
            // 0.000001
            subsec = 0;
        } else if (subsec > 0.9999) {
            subsec = 0;
            time += 1;
            if (time === DAYSIZE) {
                time = 0;
                date += 1;
            }
        }

        // serial date/time to gregorian calendar
        if (date || part.date_system) {
            const dout = toYMD(value, part.date_system, opts.leap1900);
            year = dout[0];
            month = dout[1];
            day = dout[2];
        }
        if (time || subsec) {
            // round time based on smallest used unit
            const minU =
                part.date & u_MSEC ||
                part.date & u_CSEC ||
                part.date & u_DSEC ||
                part.date & u_SEC ||
                part.date & u_MIN ||
                part.date & u_HOUR;
            if (
                (minU === u_MSEC && subsec > 0.9995) ||
                (minU === u_CSEC && subsec > 0.995) ||
                (minU === u_DSEC && subsec > 0.95) ||
                (minU === u_SEC && subsec >= 0.5) ||
                (minU === u_MIN && subsec >= 0.5) ||
                (minU === u_HOUR && subsec >= 0.5)
            ) {
                time++;
                subsec = 0;
            }
            const x = time < 0 ? DAYSIZE + time : time;
            second = Math.floor(x) % 60;
            minute = Math.floor(x / 60) % 60;
            hour = Math.floor(x / 60 / 60) % 60;
        }
        weekday = (6 + date) % 7;
    }

    // integer padding
    if (part.int_padding) {
        integer =
            part.int_padding.length === 1
                ? integer || part.int_padding
                : part.int_padding.substring(0, part.int_padding.length - integer.length) + integer;
    }
    // numerator padding
    if (part.num_padding) {
        numerator =
            part.num_padding.length === 1
                ? numerator || part.num_padding
                : part.num_padding.substring(0, part.num_padding.length - numerator.length) + numerator;
    }
    // denominator padding
    if (part.den_padding) {
        denominator =
            part.den_padding.length === 1
                ? denominator || part.den_padding
                : denominator + part.den_padding.slice(denominator.length);
    }
    // mantissa padding
    if (part.man_padding) {
        const m_sign = part.exp_plus ? '+' : '';
        mantissa =
            part.man_padding.length === 1
                ? (exp < 0 ? '-' : m_sign) + (mantissa || part.man_padding)
                : (exp < 0 ? '-' : m_sign) +
                  part.man_padding.slice(0, part.man_padding.length - mantissa.length) +
                  mantissa;
    }

    const ret = [];
    let integer_bits_counter = 0;
    const counter: any = {
        int: 0,
        frac: 0,
        man: 0,
        num: 0,
        den: 0,
    };
    for (let ti = 0, tl = part.tokens.length; ti < tl; ti++) {
        const tok = part.tokens[ti];
        const len = tok.num ? tok.num.length : 0;

        if (tok.type === 'string') {
            // special rules may apply if next or prev is numerator or denominator
            if (tok.rule) {
                if (tok.rule === 'num') {
                    if (have_fraction) {
                        ret.push(tok.value);
                    } else if (part.num_min > 0 || part.den_min > 0) {
                        ret.push(tok.value.replace(/./g, _numchars['?']));
                    }
                } else if (tok.rule === 'num+int') {
                    if (have_fraction && integer) {
                        ret.push(tok.value);
                    } else if (part.den_min > 0 && (integer || part.num_min)) {
                        ret.push(tok.value.replace(/./g, _numchars['?']));
                    }
                } else if (tok.rule === 'den') {
                    if (have_fraction) {
                        ret.push(tok.value);
                    } else if (part.den_min > 0 || part.den_min > 0) {
                        ret.push(tok.value.replace(/./g, _numchars['?']));
                    }
                }
            } else {
                ret.push(tok.value);
            }
        } else if (tok.type === 'error') {
            // token used to define invalid pattern
            ret.push(opts.invalid);
        } else if (tok.type === 'point') {
            // Excel always emits a period: TEXT(0, "#.#") => "."
            ret.push(part.date ? tok.value : l10n.decimal);
        } else if (tok.type === 'general') {
            general(ret, part, value, l10n);
        } else if (tok.type === 'exp') {
            ret.push(l10n.exponent);
        } else if (tok.type === 'minus') {
            if (tok.volatile && part.date) {
                // don't emit the prepended minus if this is a date
            } else if (tok.volatile && !part.fractions && (part.integer || part.dec_fractions)) {
                // minus is only shown if there is a non-zero digit present
                if ((integer && integer !== '0') || fraction) {
                    ret.push(l10n.negative);
                }
            } else {
                ret.push(l10n.negative);
            }
        } else if (tok.type === 'plus') {
            ret.push(l10n.positive);
        } else if (tok.type === 'text') {
            ret.push(value);
        } else if (tok.type === 'div') {
            if (have_fraction) {
                ret.push('/');
            } else if (part.num_min > 0 || part.den_min > 0) {
                ret.push(_numchars['?']);
            } else {
                ret.push(_numchars['#']);
            }
        } else if (tok.type === 'int') {
            if (part.int_pattern.length === 1) {
                // number isn't fragmented
                ret.push(integer);
            } else {
                const c_s = !integer_bits_counter ? Infinity : part.int_pattern.join('').length - counter.int;
                const c_e =
                    integer_bits_counter === part.int_pattern.length - 1
                        ? 0
                        : part.int_pattern.join('').length - (counter.int + tok.num.length);
                ret.push(integer.substring(integer.length - c_s, integer.length - c_e));
                integer_bits_counter++;
                counter.int += tok.num.length;
            }
        } else if (tok.type === 'frac') {
            const o = counter.frac;
            for (let i = 0; i < len; i++) {
                ret.push(fraction[i + o] || _numchars[tok.num[i]]);
            }
            counter.frac += len;
        } else if (tok.type in short_to_long) {
            if (part[`${tok.type}_pattern`].length === 1) {
                // number isn't fragmented
                if (tok.type === 'int') {
                    ret.push(integer);
                }
                if (tok.type === 'frac') {
                    ret.push(fraction);
                }
                if (tok.type === 'man') {
                    ret.push(mantissa);
                }
                if (tok.type === 'num') {
                    ret.push(numerator);
                }
                if (tok.type === 'den') {
                    ret.push(denominator);
                }
            } else {
                ret.push((short_to_long as any)[tok.type].slice(counter[tok.type], counter[tok.type] + len));
                counter[tok.type] += len;
            }
        } else if (tok.type === 'year') {
            if (year < 0) {
                ret.push(l10n.negative);
            }
            ret.push(String(Math.abs(year)).padStart(4, '0'));
        } else if (tok.type === 'year-short') {
            const y = year % 100;
            ret.push(y < 10 ? '0' : '', y);
        } else if (tok.type === 'month') {
            ret.push(tok.pad && month < 10 ? '0' : '', month);
        } else if (tok.type === 'monthname-single') {
            // This is what Excel does.
            // The Vietnamese list goes from ["Tháng 1", "Tháng 2", ... ] to [ "T", "T", ... ]
            // Simplified Chinese goes from [ 1月, ... 9月, 10月, 11月, 12月 ] to [ 1, ... 9, 1, 1, 1 ]
            if (part.date_system === EPOCH_1317) {
                ret.push(l10n.mmmm6[month - 1].charAt(0));
            } else {
                ret.push(l10n.mmmm[month - 1].charAt(0));
            }
        } else if (tok.type === 'monthname-short') {
            if (part.date_system === EPOCH_1317) {
                ret.push(l10n.mmm6[month - 1]);
            } else {
                ret.push(l10n.mmm[month - 1]);
            }
        } else if (tok.type === 'monthname') {
            if (part.date_system === EPOCH_1317) {
                ret.push(l10n.mmmm6[month - 1]);
            } else {
                ret.push(l10n.mmmm[month - 1]);
            }
        } else if (tok.type === 'weekday-short') {
            ret.push(l10n.ddd[weekday]);
        } else if (tok.type === 'weekday') {
            ret.push(l10n.dddd[weekday]);
        } else if (tok.type === 'day') {
            ret.push(tok.pad && day < 10 ? '0' : '', day);
        } else if (tok.type === 'hour') {
            const h = hour % part.clock || (part.clock < 24 ? part.clock : 0);
            ret.push(tok.pad && h < 10 ? '0' : '', h);
        } else if (tok.type === 'min') {
            ret.push(tok.pad && minute < 10 ? '0' : '', minute);
        } else if (tok.type === 'sec') {
            ret.push(tok.pad && second < 10 ? '0' : '', second);
        } else if (tok.type === 'subsec') {
            ret.push(l10n.decimal);
            // decimals is pre-determined by longest subsec token
            // but the number emitted is per-token
            const f = subsec.toFixed(part.sec_decimals);
            ret.push(f.slice(2, 2 + tok.decimals));
        } else if (tok.type === 'am') {
            const idx = hour < 12 ? 0 : 1;
            if (tok.short && !l10n_) {
                ret.push('AP'[idx]);
            } else {
                ret.push(l10n.ampm[idx]);
            }
        } else if (tok.type === 'hour-elap') {
            if (value < 0) {
                ret.push(l10n.negative);
            }
            const hh = date * 24 + Math.floor(Math.abs(time) / (60 * 60));
            ret.push(String(Math.abs(hh)).padStart(tok.pad, '0'));
        } else if (tok.type === 'min-elap') {
            if (value < 0) {
                ret.push(l10n.negative);
            }
            const mm = date * 1440 + Math.floor(Math.abs(time) / 60);
            ret.push(String(Math.abs(mm)).padStart(tok.pad, '0'));
        } else if (tok.type === 'sec-elap') {
            if (value < 0) {
                ret.push(l10n.negative);
            }
            const ss = date * DAYSIZE + Math.abs(time);
            ret.push(String(Math.abs(ss)).padStart(tok.pad, '0'));
        } else if (tok.type === 'b-year') {
            ret.push(year + 543);
        } else if (tok.type === 'b-year-short') {
            const y = (year + 543) % 100;
            ret.push(y < 10 ? '0' : '', y);
        }
    }
    if (opts.nbsp) {
        // can we detect ? or string tokens and only do this if needed?
        return ret.join('');
    }
    return ret.join('').replace(/\u00a0/g, ' ');
}
