import { currencySymbols } from '../base/const/CURRENCY-SYMBOLS';

export const getCurrencyType = (pattern: string) => {
    const item = currencySymbols.find((code) => pattern.includes(code));
    return item;
};
