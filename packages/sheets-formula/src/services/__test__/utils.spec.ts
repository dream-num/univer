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

import type { IFunctionInfo } from '@univerjs/engine-formula';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateParam, getFunctionName } from '../utils';

describe('sheets-formula service utils', () => {
    let univer: Univer;
    let localeService: LocaleService;

    beforeEach(() => {
        univer = new Univer();
        localeService = univer.__getInjector().get(LocaleService);
        localeService.load({
            [LocaleType.ZH_CN]: {},
            [LocaleType.EN_US]: {
                custom: {
                    alias: 'ALIAS_NAME',
                },
            },
        });
    });

    afterEach(() => {
        univer.dispose();
    });

    it('prefers translated alias names and falls back to the original function name', () => {
        const aliasInfo = {
            functionName: 'FUNC_NAME',
            aliasFunctionName: 'custom.alias',
        } as IFunctionInfo;
        const noAliasInfo = {
            functionName: 'FALLBACK_NAME',
        } as IFunctionInfo;

        expect(getFunctionName(aliasInfo, localeService)).toBe('FUNC_NAME');

        localeService.setLocale(LocaleType.EN_US);

        expect(getFunctionName(aliasInfo, localeService)).toBe('ALIAS_NAME');
        expect(getFunctionName(noAliasInfo, localeService)).toBe('FALLBACK_NAME');
    });

    it('formats function parameters for each require and repeat combination', () => {
        expect(generateParam({ name: 'arg', detail: '', example: '', require: 0, repeat: 0 })).toBe('[arg]');
        expect(generateParam({ name: 'arg', detail: '', example: '', require: 1, repeat: 0 })).toBe('arg');
        expect(generateParam({ name: 'arg', detail: '', example: '', require: 0, repeat: 1 })).toBe('[arg,...]');
        expect(generateParam({ name: 'arg', detail: '', example: '', require: 1, repeat: 1 })).toBe('arg,...');
    });
});
