import { describe, expect, it } from 'vitest';

import { currencySymbols } from '../base/const/CURRENCY-SYMBOLS';
import { getCurrencyType } from '../utils/currency';
import {
    getDecimalFromPattern,
    getDecimalString,
    isPatternEqualWithoutDecimal,
    setPatternDecimal,
} from '../utils/decimal';

describe('test numfmt utils function', () => {
    it('getCurrencyType', () => {
        expect(getCurrencyType(`_(${currencySymbols[3]} 123123`)).toBe(currencySymbols[3]);
        expect(getCurrencyType(`_(# 123123`)).toBeUndefined();
        expect(getCurrencyType(`_(${currencySymbols[3]} 123123 ${currencySymbols[4]}`)).toBe(currencySymbols[3]);
    });
    it('getDecimalFromPattern', () => {
        expect(getDecimalFromPattern('_(###0.000);--###0.00')).toBe(3);
        expect(getDecimalFromPattern('_(###0);-###0.00')).toBe(0); // the function decimal just use positive,negative configuration ignored
        expect(getDecimalFromPattern('_(###0.0);--###0.00')).toBe(1);
        expect(getDecimalFromPattern('_(###0.);--###0.00')).toBe(0);
    });
    it('isPatternEqualWithoutDecimal', () => {
        expect(isPatternEqualWithoutDecimal('_(###0.000);-###0.00', '[red]_(###0.0000);-###0.00')).toBe(true); // the positive color ignored
        expect(isPatternEqualWithoutDecimal('_(###0;-###0.00', '_(###0;[red]-###0.00')).toBe(false);
        expect(isPatternEqualWithoutDecimal('_(###00.0;-###0.00', '_(###0;[red]-###0.00')).toBe(false);
        expect(isPatternEqualWithoutDecimal('_(###0;-###0.00', '_(###0.00;-###0.00')).toBe(true);
    });
    it('getDecimalString', () => {
        expect(getDecimalString(3)).toBe('000'); // the positive color ignored
        expect(getDecimalString(-1)).toBe(''); // the positive color ignored
        expect(getDecimalString(0)).toBe(''); // the positive color ignored
    });
    it('setPatternDecimal', () => {
        expect(setPatternDecimal('0.', 4)).toBe('0.0000'); // the positive color ignored
        expect(setPatternDecimal('.', 4)).toBe('.0000'); // the positive color ignored
        expect(setPatternDecimal('0.0', 4)).toBe('0.0000'); // the positive color ignored
        expect(setPatternDecimal('0.0', 0)).toBe('0'); // the positive color ignored
    });
});
