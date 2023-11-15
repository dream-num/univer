import { LocaleService } from '@univerjs/core';

export function getFunctionTypeValues(
    enumObj: any,
    localeService: LocaleService
): Array<{ label: string; value: string }> {
    return Object.keys(enumObj)
        .filter((key) => isNaN(Number(key)))
        .map((key) => ({
            label: localeService.t(`formula.formulaMore.${key.toLocaleLowerCase()}`),
            value: `${enumObj[key]}`,
        }));
}
