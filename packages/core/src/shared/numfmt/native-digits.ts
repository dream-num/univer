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

// Excel encodes a digit system in the high byte of a number format's locale ID.
const digitSystems = [
    [0x02, 0x0660, 0x0401],
    [0x03, 0x06F0, 0x0401],
    [0x04, 0x0966, 0x0439],
    [0x05, 0x09E6, 0x0445],
    [0x06, 0x0A66, 0x0446],
    [0x07, 0x0AE6, 0x0447],
    [0x08, 0x0B66, 0x0448],
    [0x09, 0x0BE6, 0x0449],
    [0x0A, 0x0C66, 0x044A],
    [0x0B, 0x0CE6, 0x044B],
    [0x0C, 0x0D66, 0x044C],
    [0x0D, 0x0E50, 0x041E],
    [0x0E, 0x0ED0, 0x0454],
    [0x0F, 0x0F20, 0x0451],
    [0x10, 0x1040, 0x0455],
    [0x12, 0x17E0, 0x0453],
    [0x13, 0x1810, 0x0450],
] as const;
const nativeDigitPattern = new RegExp(`[${digitSystems.map(([, zero]) => `${String.fromCharCode(zero)}-${String.fromCharCode(zero + 9)}`).join('')}]`, 'g');
const zeros = new Map<number, number>(digitSystems.map(([system, zero]) => [system, zero]));

export function getDigitZero(localeCode: number): number | undefined {
    return zeros.get(localeCode >>> 24);
}

export function normalizeNativeDigits(input: string) {
    let system = 0;
    let locale = 0;
    const value = input.replace(nativeDigitPattern, (digit) => {
        const code = digit.charCodeAt(0);
        const match = digitSystems.find(([, zero]) => code >= zero && code < zero + 10)!;
        [system, , locale] = match;
        return String(code - match[1]);
    });

    return { value, system, locale };
}

export function nativeDigitFormat(system: number, locale: number, pattern: string): string {
    return `[$-${(system * 0x1000000 + locale).toString(16).toUpperCase()}]${pattern}`;
}
