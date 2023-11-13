import { IFunctionInfo } from '@univerjs/base-formula-engine';
import { LocaleService } from '@univerjs/core';

// TODO@Dushusir: merged to service/utils
export function getFunctionName(item: IFunctionInfo, localeService: LocaleService) {
    let functionName = '';
    if (item.aliasFunctionName) {
        functionName = localeService.t(item.aliasFunctionName) as string;

        if (functionName === item.aliasFunctionName) {
            functionName = item.functionName;
        }
    } else {
        functionName = item.functionName;
    }

    return functionName;
}
