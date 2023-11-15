import { currencySymbols } from '../base/const/CURRENCY-SYMBOLS';
import { CURRENCYFORMAT, DATEFMTLISG, NUMBERFORMAT } from '../base/const/FORMATDETAIL';

export const getCurrencyOptions = () => currencySymbols.map((item) => ({ label: item, value: item }));

export const getCurrencyFormatOptions = (suffix: string) =>
    CURRENCYFORMAT.map((item) => ({
        label: item.label(suffix),
        value: item.suffix(suffix),
        color: item.color,
    }));

export const getDateFormatOptions = () => DATEFMTLISG.map((item) => ({ label: item.label, value: item.suffix }));

export const getNumberFormatOptions = () =>
    NUMBERFORMAT.map((item) => ({ label: item.label, value: item.suffix, color: item.color }));
