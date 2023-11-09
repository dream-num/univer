import { LocaleData } from './locale';
import { numdec } from './numdec';
import { PartType } from './parse-part';
import { round } from './round';

const fixLocale = (s: string, l10n: any) => s.replace(/\./, l10n.decimal);

/**
 *
 * @param ret
 * @param part
 * @param value
 * @param l10n
 */
export function general(ret: any[], part: PartType, value: number, l10n: LocaleData) {
    const int = value | 0;

    // sign is emitted if there is no condition or
    // if condition operator is one of [ '<>', '>=', '>' ]
    const showSign =
        value < 0 &&
        (!part.condition || part.condition[0] === '<>' || part.condition[0] === '>=' || part.condition[0] === '>');
    if (typeof value === 'string') {
        // special case
        // [<-25]General;[>25]General;General;General
        ret.push(value);
    } else if (value === int) {
        if (showSign) {
            ret.push(l10n.negative);
        }
        ret.push(Math.abs(int));
    } else {
        if (showSign) {
            ret.push(l10n.negative);
        }
        let exp = 0;
        const v = Math.abs(value);

        // FIXME: it is best if numdec returns all of these
        if (v) {
            exp = Math.floor(Math.log10(v));
        }
        let n = exp < 0 ? v * 10 ** -exp : v / 10 ** exp;
        if (n === 10) {
            n = 1;
            exp++;
        }

        // The application shall attempt to display the full number
        // up to 11 digits (inc. decimal point).
        const num_dig = numdec(v);

        const getExp = () => {
            const x = Math.abs(exp);
            let m;
            if (n === 1) {
                m = n;
            } else {
                m = round(n, 5);
            }
            ret.push(
                fixLocale(`${m}`, l10n),
                l10n.exponent,
                exp < 0 ? l10n.negative : l10n.positive,
                x < 10 ? '0' : '',
                x
            );
        };

        if (exp >= -4 && exp <= -1) {
            const o = v.toPrecision(10 + exp).replace(/0+$/, '');
            ret.push(fixLocale(o, l10n));
        } else if (exp === 10) {
            const o = v.toFixed(10).slice(0, 12).replace(/\.$/, '');
            ret.push(fixLocale(o, l10n));
        } else if (Math.abs(exp) <= 9) {
            const w = 11;
            if (num_dig.total <= w) {
                const o = round(v, 9).toFixed(num_dig.frac);
                ret.push(fixLocale(o, l10n));
            } else if (exp === 9) {
                ret.push(Math.floor(v));
            } else if (exp >= 0 && exp < 9) {
                ret.push(round(v, 9 - exp));
            } else {
                getExp();
            }
        } else if (num_dig.total >= 12) {
            getExp();
        } else if (Math.floor(v) === v) {
            ret.push(Math.floor(v));
        } else {
            ret.push(fixLocale(round(v, 9).toFixed(num_dig.frac), l10n));
        }
    }
    return ret;
}
