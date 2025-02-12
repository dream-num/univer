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
import { nameCharacterCheck } from '../name';

describe('Test name', () => {
    it('Test nameCharacterCheck', () => {
        // Test cases
        const testNames = [
            '', // Invalid: empty string
            'Sheet1', // Valid
            'Sheet:Name', // Invalid: contains :
            'Sheet/Name', // Invalid: contains /
            'Sheet\\Name', // Invalid: contains \
            'Sheet?Name', // Invalid: contains ?
            'Sheet*Name', // Invalid: contains *
            'Sheet[Name]', // Invalid: contains [ and ]
            'Sheet]Name[', // Invalid: contains ] and [
            "'SheetName", // Invalid: starts with '
            "SheetName'", // Invalid: ends with '
            'ThisSheetNameIsWayTooLongForExcelSheets', // Invalid: more than 31 characters
            'ValidSheetName', // Valid
        ];

        const expectedResults = [
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
        ];

        testNames.forEach((name, i) => {
            expect(nameCharacterCheck(name)).toBe(expectedResults[i]);
        });
    });
});
