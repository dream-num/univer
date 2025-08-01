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

import { customNameCharacterCheck } from '../../shared/name';

describe('customNameCharacterCheck', () => {
    it('should return false for empty name', () => {
        const result = customNameCharacterCheck('', new Set());
        expect(result).toBe(false);
    });

    it('should return false for name starting with invalid character', () => {
        const result = customNameCharacterCheck('1InvalidName', new Set());
        expect(result).toBe(false);
    });

    it('should return false for name containing invalid characters', () => {
        const result = customNameCharacterCheck('Invalid:Name', new Set());
        expect(result).toBe(false);
    });

    it('should return false for name conflicting with existing sheet names', () => {
        const sheetNameSet = new Set(['ExistingName']);
        const result = customNameCharacterCheck('ExistingName', sheetNameSet);
        expect(result).toBe(false);
    });

    it('should return true for valid name', () => {
        const result = customNameCharacterCheck('Valid_Name', new Set());
        expect(result).toBe(true);
    });

    it('should return true for valid name not conflicting with existing sheet names', () => {
        const sheetNameSet = new Set(['ExistingName']);
        const result = customNameCharacterCheck('NewName', sheetNameSet);
        expect(result).toBe(true);
    });

    it('should return false for name containing spaces', () => {
        const result = customNameCharacterCheck('Invalid Name', new Set());
        expect(result).toBe(false);
    });

    it('should return false for name containing special characters', () => {
        const result = customNameCharacterCheck('Invalid*Name', new Set());
        expect(result).toBe(false);
    });

    it('should return true for name starting with underscore', () => {
        const result = customNameCharacterCheck('_ValidName', new Set());
        expect(result).toBe(true);
    });
});
