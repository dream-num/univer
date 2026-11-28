/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellData, ILanguagePack, LocaleService } from '@univerjs/core';
import { CellValueType } from '@univerjs/core';
import type { ErrorType } from '../../basics/error-type';
import type { IFunctionInfo, IFunctionParam } from '../../basics/function';
import { ERROR_LITERALS, ERROR_TYPE_SET } from '../../basics/error-type';
import { FUNCTION_LIST } from './function-list/function-list';

export const builtinsByName = new Map(FUNCTION_LIST.map((item) => [item.functionName, item]));

export function getFunctionAliases(localeService: LocaleService): Readonly<Record<string, string>> {
    const pack = localeService.getLocales()?.['engine-formula'] as ILanguagePack | undefined;
    return (pack?.functionAliases as Record<string, string> | undefined) ?? {};
}

export function getErrorAliases(localeService: LocaleService): Readonly<Partial<Record<ErrorType, string>>> {
    const pack = localeService.getLocales()?.['engine-formula'] as ILanguagePack | undefined;
    return pack?.errorAliases as Partial<Record<ErrorType, string>> ?? {};
}

/** Parse keyboard or clipboard literals using the interface language active at entry. */
export function parseCellLiteral(value: string, localeService: LocaleService): Pick<ICellData, 't' | 'v'> | undefined {
    const token = value.toUpperCase();
    if (token.startsWith('#')) {
        const aliases = getErrorAliases(localeService);
        for (const code of ERROR_LITERALS) {
            if ((aliases[code] ?? code) === token) return { t: CellValueType.STRING, v: code };
        }
        if (ERROR_TYPE_SET.has(token as ErrorType)) return { t: CellValueType.FORCE_STRING, v: value };
        return;
    }
    const aliases = getFunctionAliases(localeService);
    if (token === (aliases.TRUE ?? 'TRUE')) return { t: CellValueType.BOOLEAN, v: 1 };
    if (token === (aliases.FALSE ?? 'FALSE')) return { t: CellValueType.BOOLEAN, v: 0 };
    if (token === 'TRUE' || token === 'FALSE') return { t: CellValueType.STRING, v: value };
}

export function getFunctionName(item: IFunctionInfo, localeService: LocaleService) {
    if (item.aliasFunctionName) {
        const translated = localeService.t(item.aliasFunctionName);
        if (translated !== item.aliasFunctionName) return translated;
    }
    return getFunctionAliases(localeService)[item.functionName] ?? item.functionName;
}

export function generateParam(param: IFunctionParam) {
    if (!param.require && !param.repeat) {
        return `[${param.name}]`;
    } else if (param.require && !param.repeat) {
        return param.name;
    } else if (!param.require && param.repeat) {
        return `[${param.name},...]`;
    } else if (param.require && param.repeat) {
        return `${param.name},...`;
    }
}
