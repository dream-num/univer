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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

import type { ResolvedFormatOptions } from './types';

export const defaultOptions: Readonly<ResolvedFormatOptions> = {
    // Overflow error string
    overflow: '######', // dateErrorThrow needs to be off! [prev in locale]
    // Should it throw when there is an overflow error?
    dateErrorThrows: false,
    // Should it emit a number when date has an overflow error? (Sheets does this)
    dateErrorNumber: true, // dateErrorThrow needs to be off!
    // Should it emit a number when bigint has an is an overflow error?
    bigintErrorNumber: false,
    // Sheets mode (see #3)
    dateSpanLarge: true,
    // Simulate the Lotus 1-2-3 leap year bug
    leap1900: true,
    // Emit regular vs. non-breaking spaces
    nbsp: false,
    // Robust/throw mode
    throws: true,
    // What is emitted when robust mode fails to parse (###### currently)
    invalid: '######',
    // Locale
    locale: '',
    // Don't adjust dates to UTC when converting them to serial time
    ignoreTimezone: false,
    // Integer digit grouping
    grouping: [3, 3],
    // resolve indexed colors to hex
    indexColors: true,
    // Skip-next signifier character
    skipChar: '',
    // Repear-next signifier character
    fillChar: '',
};
