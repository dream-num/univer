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

import { beforeEach, describe, expect, it } from 'vitest';
import type { IAnchor } from '../anchor';
import { anchorUndoFactory, moveByAnchor, transformSupportSymmetryAnchor } from '../anchor';
import type { IConditionFormattingRule } from '../../models/type';

describe('Test anchor', () => {
    let list: IConditionFormattingRule[] = [];
    beforeEach(() => {
        list = [];
        new Array(10).fill('').forEach((_v, index) => {
            list.push({ cfId: String(index) } as IConditionFormattingRule);
        });
    });
    describe('Move forward from the back', () => {
        it('Move 8 in front of 2', () => {
            const startAnchor: IAnchor = { id: '8', type: 'self' };
            const endAnchor: IAnchor = { id: '2', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0182345679');

            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 8 in behind of 2', () => {
            const startAnchor: IAnchor = { id: '8', type: 'self' };
            const endAnchor: IAnchor = { id: '2', type: 'after' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0128345679');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 8 in front of 2, self', () => {
            const startAnchor: IAnchor = { id: '8', type: 'self' };
            const endAnchor: IAnchor = { id: '2', type: 'self' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0182345679');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        //--------------------------------------------------------------------------------------

        it('Move  7 in front of 2', () => {
            const startAnchor: IAnchor = { id: '8', type: 'before' };
            const endAnchor: IAnchor = { id: '2', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0172345689');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 7 in behind of 2', () => {
            const startAnchor: IAnchor = { id: '8', type: 'before' };
            const endAnchor: IAnchor = { id: '2', type: 'after' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0127345689');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 7 in front of 2,self', () => {
            const startAnchor: IAnchor = { id: '8', type: 'before' };
            const endAnchor: IAnchor = { id: '2', type: 'self' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0172345689');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        //--------------------------------------------------------------------------------------

        it('Move  9 in front of 2', () => {
            const startAnchor: IAnchor = { id: '8', type: 'after' };
            const endAnchor: IAnchor = { id: '2', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0192345678');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 9 in behind of 2', () => {
            const startAnchor: IAnchor = { id: '8', type: 'after' };
            const endAnchor: IAnchor = { id: '2', type: 'after' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0129345678');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        it('Move 9 in front of 2,self', () => {
            const startAnchor: IAnchor = { id: '8', type: 'after' };
            const endAnchor: IAnchor = { id: '2', type: 'self' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0192345678');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 9 in front of 0,self', () => {
            const startAnchor: IAnchor = { id: '8', type: 'after' };
            const endAnchor: IAnchor = { id: '0', type: 'self' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('9012345678');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 9 in front of 0', () => {
            const startAnchor: IAnchor = { id: '8', type: 'after' };
            const endAnchor: IAnchor = { id: '0', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('9012345678');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
    });
    describe('Move back and forth', () => {
        it('Move 2 in front of 8', () => {
            const startAnchor: IAnchor = { id: '2', type: 'self' };
            const endAnchor: IAnchor = { id: '8', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0134567289');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 2 in behind of 8', () => {
            const startAnchor: IAnchor = { id: '2', type: 'self' };
            const endAnchor: IAnchor = { id: '8', type: 'after' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0134567829');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 2 in front of 8, self', () => {
            const startAnchor: IAnchor = { id: '2', type: 'self' };
            const endAnchor: IAnchor = { id: '8', type: 'self' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0134567289');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        //--------------------------------------------------------------------------------------

        it('Move 1 in front of 8', () => {
            const startAnchor: IAnchor = { id: '2', type: 'before' };
            const endAnchor: IAnchor = { id: '8', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0234567189');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 1 in behind of 8', () => {
            const startAnchor: IAnchor = { id: '2', type: 'before' };
            const endAnchor: IAnchor = { id: '8', type: 'after' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0234567819');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 1 in front of 8,self', () => {
            const startAnchor: IAnchor = { id: '2', type: 'before' };
            const endAnchor: IAnchor = { id: '8', type: 'self' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0234567189');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        //--------------------------------------------------------------------------------------

        it('Move  3 in front of 8', () => {
            const startAnchor: IAnchor = { id: '2', type: 'after' };
            const endAnchor: IAnchor = { id: '8', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0124567389');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
        it('Move 3 in behind of 8', () => {
            const startAnchor: IAnchor = { id: '2', type: 'after' };
            const endAnchor: IAnchor = { id: '8', type: 'after' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0124567839');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        it('Move 3 in front of 8,self', () => {
            const startAnchor: IAnchor = { id: '2', type: 'after' };
            const endAnchor: IAnchor = { id: '8', type: 'self' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0124567389');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        // -----------------------------------------------------

        it('Move 0 in front of 8', () => {
            const startAnchor: IAnchor = { id: '0', type: 'self' };
            const endAnchor: IAnchor = { id: '8', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('1234567089');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        it('Move 0 in behind of 8', () => {
            const startAnchor: IAnchor = { id: '1', type: 'before' };
            const endAnchor: IAnchor = { id: '8', type: 'before' };
            const redoList = transformSupportSymmetryAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId)!;
            expect(!!redoList).toBeTruthy();
            moveByAnchor(...redoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('1234567089');
            const undoList = anchorUndoFactory(...redoList)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        // -----------------------------------------------------
        it('use before and after', () => {
            const startAnchor: IAnchor = { id: '1', type: 'before' };
            const endAnchor: IAnchor = { id: '1', type: 'after' };
            moveByAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('1023456789');
            const undoList = anchorUndoFactory(startAnchor, endAnchor)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });

        it('use after and before', () => {
            const startAnchor: IAnchor = { id: '1', type: 'after' };
            const endAnchor: IAnchor = { id: '1', type: 'before' };
            moveByAnchor(startAnchor, endAnchor, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0213456789');
            const undoList = anchorUndoFactory(startAnchor, endAnchor)!;
            expect(!!undoList).toBeTruthy();
            moveByAnchor(...undoList, list, (rule) => rule.cfId);
            expect(list.map((item) => item.cfId).join('')).toBe('0123456789');
        });
    });
});
