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

import type { ILanguagePack, LocaleService } from '@univerjs/core';
import type { IFunctionInfo, IFunctionParam } from '../../basics/function';
import { FUNCTION_LIST } from './function-list/function-list';

export const builtinsByName = new Map(FUNCTION_LIST.map((item) => [item.functionName, item]));

export function getFunctionAliases(localeService: LocaleService): Readonly<Record<string, string>> {
    const pack = localeService.getLocales()?.['engine-formula'] as ILanguagePack | undefined;
    return (pack?.functionAliases as Record<string, string> | undefined) ?? {};
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
