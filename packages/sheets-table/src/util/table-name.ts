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

import { customNameCharacterCheck } from '@univerjs/core';

export type SheetTableNameValidationReason = 'empty' | 'invalid';

export interface ISheetTableNameValidationResult {
    valid: boolean;
    reason?: SheetTableNameValidationReason;
}

export function validateSheetTableName(name: string, existingNamesSet: Set<string>): ISheetTableNameValidationResult {
    const trimmedName = name.trim();

    if (!trimmedName) {
        return { valid: false, reason: 'empty' };
    }

    const normalizedExistingNames = new Set(Array.from(existingNamesSet, (item) => item.toLowerCase()));
    const isValidName = customNameCharacterCheck(trimmedName.toLowerCase(), normalizedExistingNames);

    if (!isValidName) {
        return { valid: false, reason: 'invalid' };
    }

    return { valid: true };
}
