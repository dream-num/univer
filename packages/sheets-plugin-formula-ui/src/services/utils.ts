import { IFunctionInfo } from '@univerjs/base-formula-engine';
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

// TODO@Dushusir:  merge getFunctionName to here
export function getRealFunctionName(item: IFunctionInfo, localeService: LocaleService) {
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
