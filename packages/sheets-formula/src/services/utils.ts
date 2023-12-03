import type { LocaleService } from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';

export function getFunctionTypeValues(
    enumObj: any,
    localeService: LocaleService
): Array<{ label: string; value: string }> {
    return Object.keys(enumObj)
        .filter((key) => isNaN(Number(key)))
        .map((key) => ({
            label: localeService.t(`formula.functionType.${key.toLocaleLowerCase()}`),
            value: `${enumObj[key]}`,
        }));
}

export function getFunctionName(item: IFunctionInfo, localeService: LocaleService) {
    let functionName = '';
    if (item.aliasFunctionName) {
        functionName = localeService.t(item.aliasFunctionName);

        if (functionName === item.aliasFunctionName) {
            functionName = item.functionName;
        }
    } else {
        functionName = item.functionName;
    }

    return functionName;
}
