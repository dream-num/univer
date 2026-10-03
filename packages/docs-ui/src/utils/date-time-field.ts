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

export type DateTimeFieldFormat = 'short' | 'long' | 'time';

export function createDateTimeField(format: DateTimeFieldFormat, locale: string, date: Date) {
    const options: Intl.DateTimeFormatOptions = format === 'time'
        ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }
        : { year: 'numeric', month: format === 'long' ? 'long' : '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat(locale, { ...options, calendar: 'gregory', numberingSystem: 'latn' });
    const parts = formatter.formatToParts(date);
    const tokens: Record<string, string> = {
        year: 'yyyy',
        month: format === 'long' ? 'MMMM' : 'MM',
        day: 'dd',
        hour: 'HH',
        minute: 'mm',
        second: 'ss',
    };
    const mask = parts.map((part) => tokens[part.type] ?? `'${part.value.replace(/'/g, "''")}'`).join('');
    const fieldType = format === 'time' ? 'TIME' : 'DATE';
    return { fieldType, instruction: `${fieldType} \\@ "${mask}"`, cachedResult: formatter.format(date) };
}

export function resolveDateTimeField(instruction: string, locale: string, date: Date): string | undefined {
    try {
        Intl.getCanonicalLocales(locale);
    } catch {
        return undefined;
    }
    for (const format of ['short', 'long', 'time'] as const) {
        const field = createDateTimeField(format, locale, date);
        if (field.instruction === instruction) {
            return field.cachedResult;
        }
    }
}
