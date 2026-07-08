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
import {
    assertResourceRef,
    formatResourceRef,
    getResourceRefKey,
    getResourceRefUnitKey,
    getResourceRefUnitLocator,
    isResourceRefRangePart,
    normalizeResourceRef,
    normalizeResourceRefInput,
    parseResourceRef,
    ResourceRefError,
    ResourceRefErrorCode,
} from './resource-ref';

describe('resource ref', () => {
    it('parses, formats, and normalizes self resource refs', () => {
        const ref = parseResourceRef('#unit=sheet%201&type=sheet');

        expect(ref).toEqual({
            file: { kind: 'self' },
            unit: {
                selector: 'sheet 1',
                type: 'sheet',
            },
        });
        expect(formatResourceRef(ref)).toBe('#unit=sheet%201&type=sheet');
        expect(normalizeResourceRefInput('#unit=sheet%201&type=sheet')).toEqual(ref);
    });

    it('normalizes files, typed parts, custom parts, and extensions into stable keys', () => {
        const ref = normalizeResourceRef({
            file: { kind: 'relative', path: './book.univer' },
            unit: { selector: 'unit-1', type: 'sheet' },
            part: {
                kind: 'custom',
                z: ['2', '1'],
                a: 'first',
            },
            extensions: {
                z: 'last',
                a: ['x', 'y'],
            },
        });

        expect(ref).toEqual({
            file: { kind: 'relative', path: './book.univer' },
            unit: { selector: 'unit-1', type: 'sheet' },
            part: {
                a: 'first',
                kind: 'custom',
                z: ['2', '1'],
            },
            extensions: {
                a: ['x', 'y'],
                z: 'last',
            },
        });
        expect(getResourceRefUnitLocator(ref)).toEqual({
            file: { kind: 'relative', path: './book.univer' },
            unit: { selector: 'unit-1', type: 'sheet' },
        });
        expect(getResourceRefUnitKey(ref)).toBe(JSON.stringify(getResourceRefUnitLocator(ref)));
        expect(getResourceRefKey(ref)).toBe(JSON.stringify(ref));
    });

    it('recognizes and normalizes range parts', () => {
        const ref = normalizeResourceRef({
            file: { kind: 'self' },
            unit: { selector: 'unit-1', type: 'sheet' },
            part: {
                kind: 'range',
                ref: 'Sheet1!A1:B2',
                sheetName: 'Sheet1',
                sheetId: 'sheet-1',
                range: 'A1:B2',
            },
        });

        expect(isResourceRefRangePart(ref.part)).toBe(true);
        expect(ref.part).toEqual({
            kind: 'range',
            ref: 'Sheet1!A1:B2',
            sheetName: 'Sheet1',
            range: 'A1:B2',
            sheetId: 'sheet-1',
        });
    });

    it('rejects unsupported format targets and invalid fragment syntax', () => {
        expectResourceRefError(() => formatResourceRef({
            file: { kind: 'uri', uri: 'https://example.com/book.univer' },
            unit: { selector: 'unit-1', type: 'sheet' },
        }), ResourceRefErrorCode.ResourceRefFileUnsupported);

        expectResourceRefError(() => formatResourceRef({
            file: { kind: 'self' },
            unit: { selector: 'unit-1', type: 'sheet' },
            part: { kind: 'sheet', sheetName: 'Sheet1' },
        }), ResourceRefErrorCode.ResourceRefUriUnsupported);

        expectResourceRefError(() => parseResourceRef('unit=sheet&type=sheet'), ResourceRefErrorCode.InvalidUriReference);
        expectResourceRefError(() => parseResourceRef('#unit=sheet&type='), ResourceRefErrorCode.InvalidFragmentSyntax);
        expectResourceRefError(() => parseResourceRef('#unit=%E0%A4%A&type=sheet'), ResourceRefErrorCode.InvalidPercentEncoding);
    });

    it('reports validation errors with stable error codes', () => {
        expectResourceRefError(() => assertResourceRef(null as never), ResourceRefErrorCode.ResourceRefInvalid);
        expectResourceRefError(() => assertResourceRef({
            file: { kind: 'relative', path: '' },
            unit: { selector: 'unit-1', type: 'sheet' },
        }), ResourceRefErrorCode.ResourceRefInvalidRelativePath);
        expectResourceRefError(() => assertResourceRef({
            file: { kind: 'self' },
            unit: { selector: '', type: 'sheet' },
        }), ResourceRefErrorCode.ResourceRefInvalidUnit);
        expectResourceRefError(() => assertResourceRef({
            file: { kind: 'self' },
            unit: { selector: 'unit-1', type: 'sheet' },
            part: { kind: 'range', ref: 'Sheet1!A1', sheetName: '', range: 'A1' },
        }), ResourceRefErrorCode.ResourceRefInvalidRangePart);
        expectResourceRefError(() => assertResourceRef({
            file: { kind: 'self' },
            unit: { selector: 'unit-1', type: 'sheet' },
            extensions: { bad: [1 as never] },
        }), ResourceRefErrorCode.ResourceRefInvalidExtensionValue);
    });
});

function expectResourceRefError(fn: () => unknown, code: ResourceRefErrorCode): void {
    try {
        fn();
    } catch (error) {
        expect(error).toBeInstanceOf(ResourceRefError);
        expect((error as ResourceRefError).code).toBe(code);
        return;
    }

    throw new Error(`Expected ResourceRefError ${code}`);
}
