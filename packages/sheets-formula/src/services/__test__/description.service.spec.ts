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
import { IConfigService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { FunctionService, FunctionType, IFunctionService } from '@univerjs/engine-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PLUGIN_CONFIG_KEY_BASE } from '../../controllers/config.schema';
import { DescriptionService, IDescriptionService } from '../description.service';

function createFunctionInfo(overrides: Partial<IFunctionInfo> = {}): IFunctionInfo {
    return {
        functionName: overrides.functionName ?? 'CUSTOMFUNC',
        aliasFunctionName: overrides.aliasFunctionName,
        functionType: overrides.functionType ?? FunctionType.User,
        description: overrides.description ?? 'custom.desc',
        abstract: overrides.abstract ?? 'custom.abstract',
        functionParameter: overrides.functionParameter ?? [
            {
                name: 'custom.param.name',
                detail: 'custom.param.detail',
                example: '1',
                require: 1,
                repeat: 0,
            },
        ],
    };
}

describe('DescriptionService', () => {
    let univer: Univer;
    let localeService: LocaleService;
    let descriptionService: IDescriptionService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();

        localeService = injector.get(LocaleService);
        localeService.load({
            [LocaleType.ZH_CN]: {},
            [LocaleType.EN_US]: {
                custom: {
                    alias: 'CUSTOM_ALIAS',
                    desc: 'Localized description',
                    abstract: 'Localized abstract',
                    param: {
                        name: 'Localized parameter',
                        detail: 'Localized parameter detail',
                    },
                },
            },
        });

        injector.get(IConfigService).setConfig(PLUGIN_CONFIG_KEY_BASE, { description: [] });
        injector.add([IFunctionService, { useClass: FunctionService }]);
        injector.add([IDescriptionService, { useClass: DescriptionService }]);

        descriptionService = injector.get(IDescriptionService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('registers descriptions, supports search, and unregisters by disposable', () => {
        const customInfo = createFunctionInfo();

        const disposable = descriptionService.registerDescriptions([customInfo]);

        expect(descriptionService.hasDescription('CUSTOMFUNC')).toBe(true);
        expect(descriptionService.hasFunction('customfunc')).toBe(true);
        expect(descriptionService.getFunctionInfo('customfunc')).toMatchObject({
            functionName: 'CUSTOMFUNC',
            abstract: 'custom.abstract',
        });
        expect(descriptionService.getSearchListByName('custom')).toContainEqual({
            name: 'CUSTOMFUNC',
            desc: 'custom.abstract',
        });
        expect(descriptionService.getSearchListByNameFirstLetter('custom')).toContainEqual({
            name: 'CUSTOMFUNC',
            desc: 'custom.abstract',
            functionType: FunctionType.User,
        });
        expect(descriptionService.getSearchListByType(FunctionType.User)).toEqual(
            expect.arrayContaining([
                {
                    name: 'CUSTOMFUNC',
                    desc: 'custom.abstract',
                },
            ])
        );

        disposable.dispose();

        expect(descriptionService.hasDescription('CUSTOMFUNC')).toBe(false);
        expect(descriptionService.getFunctionInfo('CUSTOMFUNC')).toBeUndefined();
    });

    it('handles defined-name descriptions according to current implementation semantics', () => {
        const rangeNameInfo = createFunctionInfo({
            functionName: 'BOOK_RANGE',
            functionType: FunctionType.DefinedName,
            description: 'A1:B2',
            abstract: 'Workbook range',
            functionParameter: [],
        });
        const formulaNameInfo = createFunctionInfo({
            functionName: 'BOOK_FORMULA',
            functionType: FunctionType.DefinedName,
            description: 'SUM(A1:A2)',
            abstract: 'Workbook formula',
            functionParameter: [],
        });

        descriptionService.registerDescriptions([rangeNameInfo, formulaNameInfo]);

        expect(descriptionService.hasDefinedNameDescription('BOOK_RANGE')).toBe(true);
        expect(descriptionService.hasDefinedNameDescription('BOOK_FORMULA')).toBe(true);
        expect(descriptionService.isFormulaDefinedName('BOOK_RANGE')).toBe(false);
        expect(descriptionService.isFormulaDefinedName('BOOK_FORMULA')).toBe(true);
        expect(descriptionService.getSearchListByName('BOOK')).toEqual([]);
        expect(descriptionService.getSearchListByType(-1)).not.toEqual(
            expect.arrayContaining([
                { name: 'BOOK_RANGE', desc: 'Workbook range' },
                { name: 'BOOK_FORMULA', desc: 'Workbook formula' },
            ])
        );
    });

    it('re-registers descriptions with localized alias names after locale changes', () => {
        const customInfo = createFunctionInfo({ aliasFunctionName: 'custom.alias' });

        descriptionService.registerDescriptions([customInfo]);
        localeService.setLocale(LocaleType.EN_US);

        expect(descriptionService.hasFunction('CUSTOM_ALIAS')).toBe(true);
        expect(descriptionService.getFunctionInfo('CUSTOM_ALIAS')).toMatchObject({
            functionName: 'CUSTOM_ALIAS',
            description: 'Localized description',
            abstract: 'Localized abstract',
            functionParameter: [
                {
                    name: 'Localized parameter',
                    detail: 'Localized parameter detail',
                    example: '1',
                    require: 1,
                    repeat: 0,
                },
            ],
        });
    });
});
