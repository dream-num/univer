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

import { LocaleService, LocaleType, RegionService, Univer, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import deDE from '../../../locale/de-DE';
import esES from '../../../locale/es-ES';
import { UniverFormulaEnginePlugin } from '../../../plugin';
import { ICalculateFormulaService } from '../../../services/calculate-formula.service';
import { getFormulaSyntax } from '../formula-syntax';
import excelSamples from './fixtures/excel-formula-local.json';

function syntaxFor(univer: Univer, region: string) {
    const injector = univer.__getInjector();
    const service = injector.get(RegionService);
    service.setRegion(region);
    return getFormulaSyntax(service, injector.get(LocaleService));
}

describe('regional formula editing', () => {
    // Each set contains the FormulaLocal strings returned by Excel for Mac 16.115 with an English UI.
    it('displays, parses and calculates the Excel samples for every measured region', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'book',
                sheetOrder: ['sheet'],
                sheets: { sheet: { id: 'sheet', cellData: { 0: { 0: { v: 4 } }, 2: { 0: { v: 6 } } } } },
            });
            const injector = univer.__getInjector();
            const calculate = injector.get(ICalculateFormulaService);
            const canonical = ['=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})', '=SUM(1,5)', '=SUM(1.5)', '=SUM((A1,A3))', '=IF(1.5>1,"a,b;c","unused")', '=INDEX({1.5,2;3,4},2,1)'];
            for (const { regions, formulas } of excelSamples) {
                for (const region of regions.split(' ')) {
                    const syntax = syntaxFor(univer, region);
                    expect(canonical.map((f) => syntax.toLocal(f)), region).toEqual(formulas);
                    const parsed = formulas.map((f) => syntax.toStandard(f));
                    expect(parsed, region).toEqual(canonical);
                    expect(syntax.toStandard('=SUM(A1;A3,A4)'), region).toBeNull();
                    const result = await calculate.executeFormulas({ book: { sheet: { 5: { 4: parsed.filter((f) => f !== null) } } } });
                    expect(result.book?.sheet[5][4].map((cell) => cell.value), region).toEqual([4, 10.5, 6, 1.5, 10, 'a,b;c', 3]);
                }
            }
        } finally {
            univer.dispose();
        }
    });

    it.each([
        ['az-Arab-IR', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['uz-AF', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['az-Cyrl-IR', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['uz-Cyrl-AF', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['en-AX', '=SUM(1,5;2,5)', '=SUM({1,5\\2;3\\4})'],
        ['ja-FI', '=SUM(1,5;2,5)', '=SUM({1,5\\2;3\\4})'],
        ['fi-US', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['haw-US', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['qaa-FI', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['enUS', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['es-MX', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['esES', '=SUM(1,5;2,5)', '=SUM({1,5\\2;3\\4})'],
        ['de-DE', '=SUM(1,5;2,5)', '=SUM({1,5\\2;3\\4})'],
        ['fr-FR', '=SUM(1,5;2,5)', '=SUM({1,5\\2;3\\4})'],
        ['de-CH', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['fr-CH', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['ru-CH', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['uz-CH', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['uz-Cyrl-CH', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['sh-CH', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['rm-Cyrl-CH', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['de-Cyrl-CH', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['ar-SA', '=SUM(1٫5;2٫5)', '=SUM({1٫5,2;3,4})'],
        ['fa-IR', '=SUM(1٫5؛2٫5)', '=SUM({1٫5,2;3,4})'],
        ['dv-MV', '=SUM(1.5،2.5)', '=SUM({1.5,2;3,4})'],
        ['fa-AF', '=SUM(1٫5؛2٫5)', '=SUM({1٫5,2;3,4})'],
        ['rm-CH', '=SUM(1,5;2,5)', '=SUM({1,5\\2;3\\4})'],
        ['af-NA', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
        ['de-LI', '=SUM(1.5;2.5)', '=SUM({1.5,2;3,4})'],
        ['bad tag', '=SUM(1.5,2.5)', '=SUM({1.5,2;3,4})'],
    ])('round-trips numbers, arguments and both array dimensions in %s', (region, localSum, localArray) => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            const syntax = syntaxFor(univer, region);
            expect(syntax.toStandard(localSum)).toBe('=SUM(1.5,2.5)');
            expect(syntax.toLocal('=SUM(1.5,2.5)')).toBe(localSum);
            expect(syntax.toStandard(localArray)).toBe('=SUM({1.5,2;3,4})');
            expect(syntax.toLocal('=SUM({1.5,2;3,4})')).toBe(localArray);
        } finally {
            univer.dispose();
        }
    });

    it('keeps language-specific array dimensions separate from the regional decimal and argument separators', () => {
        const univer = new Univer({ locale: LocaleType.DE_DE, locales: { [LocaleType.DE_DE]: deDE } });
        try {
            const injector = univer.__getInjector();
            const german = syntaxFor(univer, 'de-DE');
            expect(german.toLocal('=SUM({1.5,2;3,4})')).toBe('=SUMME({1,5.2;3.4})');
            expect(german.toStandard('=SUM(A1;A2)')).toBe('=_xludf.SUM(A1,A2)');
            expect(german.toLocal('=_xludf.SUM(A1,A2)')).toBe('=SUM(A1;A2)');
            expect(german.toStandard('=INDEX({1.2};1;2)')).toBe('=INDEX({1,2},1,2)');
            expect(german.toStandard('=INDEX({1\\2};1;2)')).toBeNull();
            expect(syntaxFor(univer, 'en-US').toStandard('=SUMME({1.5\\2;3\\4})')).toBe('=SUM({1.5,2;3,4})');
            injector.get(LocaleService).setLocale(LocaleType.IT_IT);
            expect(syntaxFor(univer, 'de-DE').toStandard('=X({1,5\\2.3\\4})')).toBe('=X({1.5,2;3,4})');
            injector.get(LocaleService).setLocale(LocaleType.RU_RU);
            const russian = syntaxFor(univer, 'de-DE');
            expect(russian.toStandard('=X({1,5;2:3;4};A1:A3)')).toBe('=X({1.5,2;3,4},A1:A3)');
            expect(russian.toStandard('=X({1,5;2:3\\4};A1:A3)')).toBeNull();
        } finally {
            univer.dispose();
        }
    });

    it('round-trips error literals without translating strings, structured references or spill operators', () => {
        const univer = new Univer({ locale: LocaleType.DE_DE, locales: { [LocaleType.DE_DE]: deDE } });
        try {
            const syntax = syntaxFor(univer, 'de-DE');
            const canonical = '=IFERROR(#VALUE!,"#VALUE!")';
            const local = '=WENNFEHLER(#WERT!;"#VALUE!")';
            expect(syntax.toLocal(canonical)).toBe(local);
            expect(syntax.toStandard(local)).toBe(canonical);
            expect(syntax.toStandard('=#VALUE!')).toBeNull();
            expect(syntax.toStandard('=#SPILL!')).toBeNull();
            expect(syntax.toStandard('=SUMME(A1#;Table1[Column #WERT!])')).toBe('=SUM(A1#,Table1[Column #WERT!])');
        } finally {
            univer.dispose();
        }
    });

    it('reopens Excel bindings without turning unresolved names or range endpoints into calls', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'book',
                sheetOrder: ['sheet'],
                sheets: { sheet: { id: 'sheet', name: 'Sheet1', cellData: { 0: { 0: { v: 2 } }, 1: { 0: { v: 3 } } } } },
            });
            const syntax = syntaxFor(univer, 'en-US');
            const formulas = [
                '=_xlfn.LET(_xlpm.A1,_xlnm.A1,_xlpm.A1)',
                '=_xlfn.LET(_xlpm.A1,42,_xlpm.A1)',
                '=_xlfn.LET(_xlpm.A1,2,SUM(_xlpm.A1:_xlnm.A2))',
                '=_xlfn.LET(_xlpm.x,A1,SUM(_xlpm.x:A2))',
                '=_xlfn.LET(_xlpm.A1,2,_xlfn.LET(_xlpm.A1,_xlpm.A1+3,_xlpm.A1))',
                '=IF(0,_xlfn.LET(_xlpm.A1,_xlnm.A1,_xlpm.A1),0)',
            ];
            const calculate = univer.__getInjector().get(ICalculateFormulaService);
            const result = await calculate.executeFormulas({ book: { sheet: { 4: { 1: formulas } } } });
            expect(result.book?.sheet[4][1].map((cell) => cell.value)).toEqual(['#NAME?', 42, '#NAME?', 5, 5, 0]);
            expect(syntax.toLocal(formulas[0])).toBe("=LET(A1,'A1',A1)");
            expect(syntax.toLocal(formulas[1])).toBe('=LET(A1,42,A1)');
            expect(syntax.toLocal(formulas[2])).toBe("=LET(A1,2,SUM(A1:'A2'))");
        } finally {
            univer.dispose();
        }
    });

    it('validates names in A1 entry separately from loading a stored Excel formula', () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            const syntax = syntaxFor(univer, 'en-US');
            for (const input of ['=LET(A1,A1,A1)', '=LET(A01,42,A01)', '=LAMBDA($A$1,1)(2)', '=LET(x,1,X,2,X)', '=R1C1+2', '=RC+2', '=A1+R[0]C[-1]']) {
                let error;
                expect(syntax.toStandard(input, (reason) => {
                    error = reason;
                })).toBeNull();
                expect(error).toBe('syntax');
            }
            for (const input of ['=LET(x,A1,x)', '=LET(R1C1,42,R1C1)', '=LET(x,42,LET(x,x+2,x))', '=LET(XFE1,4,XFE1)', '=RC1+2', '=SUM(C:C)', '=Z1S1+2']) {
                expect(syntax.toStandard(input)).toBe(input);
            }
            const locale = univer.__getInjector().get(LocaleService);
            for (const [ui, reserved] of [[LocaleType.DE_DE, 'Z1S1'], [LocaleType.FR_FR, 'L1C1'], [LocaleType.ES_ES, 'F1C1'], [LocaleType.PL_PL, 'W1K1']] as const) {
                locale.setLocale(ui);
                const local = syntaxFor(univer, 'en-US');
                expect(local.toStandard(`=${reserved}+2`)).toBeNull();
                expect(local.toStandard(`=LET(${reserved},42,${reserved})`)).toBe(`=LET(${reserved},42,${reserved})`);
            }
        } finally {
            univer.dispose();
        }
    });

    it('normalizes Excel numeric scripts inside numbers and A1 references while keeping names, bindings and strings', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'book',
                sheetOrder: ['Sheet1'],
                sheets: { Sheet1: { id: 'Sheet1', name: 'Sheet1', cellData: { 0: { 0: { v: 2 } }, 1: { 0: { v: 3 } } } } },
            });
            const us = syntaxFor(univer, 'en-US');
            const formulas = ['=١٢+۳', '=A۰۱+$A$२', '=SUM(Sheet1!A۱:A۲)', '=SUM({๑,۲;३,៤})', '=LET(a۱,3,a۱+۲)', '=LAMBDA(x۱,x۱+۲)(۲)', '=𞥑.𞥒+1', '=１２+3'];
            const parsed = formulas.map((formula) => us.toStandard(formula));
            expect(parsed).toEqual(['=12+3', '=A1+$A$2', '=SUM(Sheet1!A1:A2)', '=SUM({1,2;3,4})', '=LET(a۱,3,a۱+2)', '=LAMBDA(x۱,x۱+2)(2)', '=𞥑.𞥒+1', '=１２+3']);
            const calculate = univer.__getInjector().get(ICalculateFormulaService);
            const result = await calculate.executeFormulas({ book: { Sheet1: { 5: { 1: parsed.filter((f) => f !== null) } } } });
            expect(result.book?.Sheet1[5][1].map((cell) => cell.value)).toEqual([15, 5, 5, 10, 5, 4, '#NAME?', '#NAME?']);
            expect(us.toStandard('=IF(۱,"۱۲","٣")')).toBe('=IF(1,"۱۲","٣")');
            expect(us.toStandard("=FY۱۲!A۱+'A۱'!B۲+Table۱۲[Q۱]")).toBe("=FY۱۲!A1+'A۱'!B2+Table۱۲[Q۱]");
            expect(us.toStandard('=XFE۱+A۰+A۱۰۴۸۵۷۷')).toBe('=XFE۱+A۰+A۱۰۴۸۵۷۷');
            expect(us.toStandard('=߁߂+߃')).toBeNull();
            expect(us.toStandard('=۱.۲a')).toBeNull();
            expect(us.toEditorTokens('=SUM(A۰۱,۱۲)')).toHaveLength('=SUM(A۰۱,۱۲)'.length);
            for (const locale of [LocaleType.JA_JP, LocaleType.ZH_CN, LocaleType.KO_KR]) {
                univer.__getInjector().get(LocaleService).setLocale(locale);
                const eastAsian = syntaxFor(univer, 'en-US');
                expect(eastAsian.toStandard('=１２+A１+"３"')).toBe('=12+A1+"３"');
            }
            expect(us.toStandard('=１２.３')).toBe('=１２.３');
        } finally {
            univer.dispose();
        }
    });

    it('reads and displays localized boolean literals without changing quoted values or scoped names', async () => {
        const univer = new Univer({ locale: LocaleType.DE_DE, locales: { [LocaleType.DE_DE]: deDE } });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, { id: 'book', sheetOrder: ['sheet'], sheets: { sheet: { id: 'sheet' } } });
            const de = syntaxFor(univer, 'de-DE');
            const local = ['=WAHR+1', '=TRUE+1', '=LET(TRUE;2;TRUE)', '=LAMBDA(TRUE;TRUE+1)(2)', '=WENN(FALSCH;1;2)'];
            const formulas = local.map((formula) => de.toStandard(formula));
            expect(formulas).toEqual(['=TRUE+1', "='TRUE'+1", '=LET(TRUE,2,TRUE)', '=LAMBDA(TRUE,TRUE+1)(2)', '=IF(FALSE,1,2)']);
            expect(formulas.map((f) => de.toLocal(f!))).toEqual(local);
            expect(de.toStandard('=LET(WAHR;2;WAHR)')).toBeNull();
            expect(de.toStandard('=SUMME({WAHR.FALSE})')).toBeNull();
            expect(de.toStandard('=SUMME({WAHR.FALSCH})')).toBe('=SUM({TRUE,FALSE})');
            expect(de.toStandard('="WAHR"')).toBe('="WAHR"');
            expect(de.toStandard("='TRUE'!A1")).toBe("='TRUE'!A1");
            const calculate = univer.__getInjector().get(ICalculateFormulaService);
            const result = await calculate.executeFormulas({ book: { sheet: { 3: { 2: formulas.filter((f) => f !== null) } } } });
            expect(result.book?.sheet[3][2].map((cell) => cell.value)).toEqual([2, '#NAME?', 2, 3, 2]);
        } finally {
            univer.dispose();
        }
    });

    it('accepts complete rows of constants and keeps calculating after a malformed imported array', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, { id: 'book', sheetOrder: ['sheet'], sheets: { sheet: { id: 'sheet' } } });
            const us = syntaxFor(univer, 'en-US');
            for (const array of ['1;2,3', '1,2;3', '1,;2,3', '1,2;3,', '', '1,{2,3}', '1,A1', '1,2%', '1,2/3']) {
                expect(us.toStandard(`=INDEX({${array}},1,2)`)).toBeNull();
            }
            const good = '=INDEX({"a,b;""c",#N/A;TRUE,-2.5E2},2,2)';
            expect(us.toStandard(good)).toBe('=INDEX({"a,b;""c",#N/A;TRUE,-250},2,2)');
            const calculate = univer.__getInjector().get(ICalculateFormulaService);
            const result = await calculate.executeFormulas({ book: { sheet: { 3: { 2: ['=INDEX({1;2,3},1,2)', good, '=2+3'] } } } });
            expect(result.book?.sheet[3][2].map((cell) => cell.value)).toEqual(['#VALUE!', -250, 5]);
        } finally {
            univer.dispose();
        }
    });

    it('rejects leading and interior omitted arguments with Arabic list punctuation but accepts a trailing omission', () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            for (const [region, separator] of [['fa-IR', '؛'], ['dv-MV', '،'], ['dv-MV', ',']]) {
                const syntax = syntaxFor(univer, region);
                expect(syntax.toStandard(`=SUM( ${separator}2)`)).toBeNull();
                expect(syntax.toStandard(`=SUM(A1${separator} ${separator} A2)`)).toBeNull();
                expect(syntax.toStandard(`=SUM(A1${separator})`)).toBe('=SUM(A1,)');
                expect(syntax.toStandard(`=SUM(A1${separator}0${separator}A2)`)).toBe('=SUM(A1,0,A2)');
                expect(syntax.toLocal('=SUM(1,,2)')).toBe(`=SUM(1${syntax.argumentSeparator}${syntax.argumentSeparator}2)`);
            }
            expect(syntaxFor(univer, 'fr-CH').toStandard('=IF(1;;2)')).toBe('=IF(1,,2)');
        } finally {
            univer.dispose();
        }
    });

    it('uses the current input syntax for ambiguous commas and rejects mixed separators', () => {
        const univer = new Univer();
        try {
            const us = syntaxFor(univer, 'en-US');
            const es = syntaxFor(univer, 'es-ES');
            expect(us.toStandard('=1,234')).toBeNull();
            expect(es.toStandard('=1,234')).toBe('=1.234');
            const dv = syntaxFor(univer, 'dv-MV');
            expect(dv.toStandard('=SUM(1,234)')).toBe('=SUM(1,234)');
            expect(dv.toStandard('=SUM(A1,A2)')).toBe('=SUM(A1,A2)');
            expect(dv.toLocal('=SUM(A1,A2)')).toBe('=SUM(A1،A2)');
            expect(dv.toStandard('=1,234')).toBeNull();
            expect(dv.toStandard('=SUM({1,2}،3)')).toBe('=SUM({1,2},3)');
            expect(us.toStandard('=SUM(1,5)')).toBe('=SUM(1,5)');
            expect(es.toStandard('=SUM(1,5)')).toBe('=SUM(1.5)');
            expect(es.toLocal('=SUM(1,5)')).toBe('=SUM(1;5)');
            expect(us.toStandard('=SUM(1;5)')).toBeNull();
            expect(us.toStandard('=SUM(1،5)')).toBeNull();
            expect(dv.toStandard('=SUM(1،2,3)')).toBeNull();
            expect(syntaxFor(univer, 'de-CH').toStandard("=SUM(1'234.5;2)")).toBeNull();
            expect(syntaxFor(univer, 'fr-FR').toStandard('=SUM(1\u202F234,5;2)')).toBeNull();
            expect(syntaxFor(univer, 'ar-SA').toStandard('=SUM(1٬234٫5;2)')).toBeNull();
            expect(es.toStandard("=SUM(1:3 2:4;'1 234'!A1)")).toBe("=SUM(1:3 2:4,'1 234'!A1)");
            for (const mixed of ['=SUM(1.5,2.5)', '=SUM(A1,5)', '=SUM(1,5,2)', '=SUM(A1,B1)', '=SUM(1,A1)', '=SUM(A1 ,5)', '=SUM(1,5 ,2)']) {
                expect(es.toStandard(mixed)).toBeNull();
            }
        } finally {
            univer.dispose();
        }
    });

    it('translates only callable built-in names, numeric literals and syntactic separators', () => {
        const univer = new Univer({ locale: LocaleType.ES_ES, locales: { [LocaleType.ES_ES]: esES } });
        try {
            const locale = univer.__getInjector().get(LocaleService);
            const syntax = syntaxFor(univer, 'es-ES');
            const pairs = [
                ['=SUMA((A1;A3);.5)', null],
                ['=SUMA(1,5;DESVEST.P(A1;B2))', '=SUM(1.5,STDEV.P(A1,B2))'],
                ['=SUMA(\'Q1;Q2\'\'s\'!A1;SUMA;Mi.Nombre)', '=SUM(\'Q1;Q2\'\'s\'!A1,SUMA,Mi.Nombre)'],
                ['=LARGO("a;b,1""SUMA(2)")', '=LEN("a;b,1""SUMA(2)")'],
                ["=SUMA(Table1[[#Headers],[Col'[,;]];B1)", "=SUM(Table1[[#Headers],[Col'[,;]],B1)"],
            ] as const;
            for (const [local, standard] of pairs) {
                expect(syntax.toStandard(local)).toBe(standard);
                if (standard) expect(syntax.toLocal(standard)).toBe(local);
            }
            expect(syntax.toStandard('=SUMA((A1;A3);,5E-2)')).toBe('=SUM((A1,A3),0.005)');
            expect(syntax.toLocal('=1.25E-2+2')).toBe('=0,0125+2');
            expect(syntax.toEditorTokens('=1,25E-2+2')).toBe('=1.25E-2+2');
            expect(syntax.toStandard('=1,2345678901234567E-6')).toBe('=1.23456789012345E-06');
            expect(syntax.toStandard('=1E-308')).toBe('=0');
            expect(syntax.toStandard('=1E308')).toBeNull();
            expect(syntax.toStandard('=LET(suma;LAMBDA(x;x*2);suma(3))')).toBe('=LET(suma,LAMBDA(x,x*2),SUM(3))');
            expect(syntax.toStandard('=LET(sum;LAMBDA(x;x*2);sum(3))')).toBe('=LET(sum,LAMBDA(x,x*2),_xlpm.sum(3))');
            expect(syntax.toLocal('=LET(sum,LAMBDA(x,x*2),_xlpm.sum(3))')).toBe('=LET(sum;LAMBDA(x;x*2);sum(3))');
            expect(syntax.toStandard('=LAMBDA(sum;sum(3))(LAMBDA(x;x*2))')).toBe('=LAMBDA(sum,_xlpm.sum(3))(LAMBDA(x,x*2))');
            expect(syntax.toStandard('=SUMA(Q1Key;A1.1;_custom.fn(1,1);2025.1!$A$1)')).toBe('=SUM(Q1Key,A1.1,_custom.fn(1.1),2025.1!$A$1)');
            expect(syntax.toEditorTokens('=SUMA(1,5;')).toBe('=SUMA(1.5,');
            expect(syntax.toEditorTokens('=SUMA(1,5;A1')).toHaveLength('=SUMA(1,5;A1'.length);
            locale.setLocale(LocaleType.EN_US);
            expect(syntax.toStandard('=SUMA(1,5;2,5)')).toBe('=SUM(1.5,2.5)');
            expect(syntaxFor(univer, 'en-US').toLocal('=SUM(1.5,2.5)')).toBe('=SUM(1.5,2.5)');
        } finally {
            univer.dispose();
        }
    });
});
