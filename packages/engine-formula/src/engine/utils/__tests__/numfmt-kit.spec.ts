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

import { describe, expect, it } from 'vitest';
import { operatorToken } from '../../../basics/token';
import { compareNumfmtPriority, comparePatternPriority } from '../numfmt-kit';

const numfmtMap = {
    currency: '"¥"#,##0.00_);[Red]("¥"#,##0.00)',
    date: 'yyyy-mm-dd;@',
    datetime: 'yyyy-m-d am/pm h:mm',
    error: '#,##0',
    fraction: '# ?/?',
    grouped: '#,##0',
    number: '0',
    percent: '0%',
    scientific: '0.00E+00',
    text: '@',
    time: 'am/pm h":"mm":"ss',
    unknown: '#,##0',
    accounting: '_("¤"* #,##0.000_)',
};

describe('Test numfmt kit', () => {
    it('Function compareNumfmtPriority', () => {
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.currency)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.date)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.datetime)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.error)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.fraction)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.grouped)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.number)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.percent)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.scientific)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.text)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.time)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.unknown)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.currency, numfmtMap.accounting)).toBe(numfmtMap.currency);

        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.currency)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.date)).toBe(numfmtMap.date);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.datetime)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.error)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.fraction)).toBe(numfmtMap.fraction);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.grouped)).toBe(numfmtMap.grouped);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.number)).toBe(numfmtMap.date);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.percent)).toBe(numfmtMap.percent);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.scientific)).toBe(numfmtMap.scientific);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.text)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.time)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.unknown)).toBe(numfmtMap.unknown);
        expect(compareNumfmtPriority(numfmtMap.date, numfmtMap.accounting)).toBe(numfmtMap.accounting);

        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.currency)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.date)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.datetime)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.error)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.fraction)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.grouped)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.number)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.percent)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.scientific)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.text)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.time)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.unknown)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.datetime, numfmtMap.accounting)).toBe(numfmtMap.datetime);

        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.currency)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.date)).toBe(numfmtMap.date);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.datetime)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.error)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.fraction)).toBe(numfmtMap.fraction);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.grouped)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.number)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.percent)).toBe(numfmtMap.percent);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.scientific)).toBe(numfmtMap.scientific);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.text)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.time)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.unknown)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.error, numfmtMap.accounting)).toBe(numfmtMap.accounting);

        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.currency)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.date)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.datetime)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.error)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.fraction)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.grouped)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.number)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.percent)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.scientific)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.text)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.time)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.unknown)).toBe(numfmtMap.number);
        expect(compareNumfmtPriority(numfmtMap.number, numfmtMap.accounting)).toBe(numfmtMap.number);

        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.currency)).toBe(numfmtMap.currency);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.date)).toBe(numfmtMap.date);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.datetime)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.error)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.fraction)).toBe(numfmtMap.fraction);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.grouped)).toBe(numfmtMap.grouped);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.number)).toBe(numfmtMap.percent);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.percent)).toBe(numfmtMap.percent);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.scientific)).toBe(numfmtMap.scientific);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.text)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.time)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.unknown)).toBe(numfmtMap.unknown);
        expect(compareNumfmtPriority(numfmtMap.percent, numfmtMap.accounting)).toBe(numfmtMap.accounting);

        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.currency)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.date)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.datetime)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.error)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.fraction)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.grouped)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.number)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.percent)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.scientific)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.text)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.time)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.unknown)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.text, numfmtMap.accounting)).toBe(numfmtMap.text);

        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.currency)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.date)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.datetime)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.error)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.fraction)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.grouped)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.number)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.percent)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.scientific)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.text)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.time)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.unknown)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.time, numfmtMap.accounting)).toBe(numfmtMap.time);

        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.currency)).toBe(numfmtMap.accounting);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.date)).toBe(numfmtMap.date);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.datetime)).toBe(numfmtMap.datetime);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.error)).toBe(numfmtMap.error);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.fraction)).toBe(numfmtMap.fraction);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.grouped)).toBe(numfmtMap.grouped);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.number)).toBe(numfmtMap.accounting);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.percent)).toBe(numfmtMap.percent);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.scientific)).toBe(numfmtMap.scientific);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.text)).toBe(numfmtMap.text);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.time)).toBe(numfmtMap.time);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.unknown)).toBe(numfmtMap.unknown);
        expect(compareNumfmtPriority(numfmtMap.accounting, numfmtMap.accounting)).toBe(numfmtMap.accounting);
    });

    it('Function comparePatternPriority', () => {
        // Currency + Currency = Currency
        expect(comparePatternPriority(numfmtMap.currency, numfmtMap.currency, operatorToken.PLUS)).toBe(numfmtMap.currency);
        // Currency - Currency = Currency
        expect(comparePatternPriority(numfmtMap.currency, numfmtMap.currency, operatorToken.MINUS)).toBe(numfmtMap.currency);
        // Currency * Currency = General
        expect(comparePatternPriority(numfmtMap.currency, numfmtMap.currency, operatorToken.MULTIPLY)).toBe('');
        // Currency / Currency = General
        expect(comparePatternPriority(numfmtMap.currency, numfmtMap.currency, operatorToken.DIVIDED)).toBe('');
        // Date + Date = General
        expect(comparePatternPriority(numfmtMap.date, numfmtMap.date, operatorToken.PLUS)).toBe('');
        // Date - Date = General
        expect(comparePatternPriority(numfmtMap.date, numfmtMap.date, operatorToken.MINUS)).toBe('');
        // Date * Date = General
        expect(comparePatternPriority(numfmtMap.date, numfmtMap.date, operatorToken.MULTIPLY)).toBe('');
        // Date / Date = General
        expect(comparePatternPriority(numfmtMap.date, numfmtMap.date, operatorToken.DIVIDED)).toBe('');

        expect(comparePatternPriority(numfmtMap.date, '', operatorToken.PLUS)).toBe(numfmtMap.date);
        expect(comparePatternPriority('', numfmtMap.accounting, operatorToken.MINUS)).toBe(numfmtMap.accounting);
    });
});
