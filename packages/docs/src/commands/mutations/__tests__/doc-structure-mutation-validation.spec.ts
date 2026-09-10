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

import { BuildTextUtils, CustomRangeType, DocumentDataModel, getRichTextEditPath, JSONX, TextX } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { validateDocStructureMutation } from '../doc-structure-mutation-validation';

describe('validateDocStructureMutation', () => {
    it('skips body structure scans for table metadata updates', () => {
        const getSelfOrHeaderFooterModel = vi.fn(() => {
            throw new Error('body structure should not be scanned');
        });
        const model = {
            getSnapshot: () => ({}),
            getSelfOrHeaderFooterModel,
        } as unknown as DocumentDataModel;
        const actions = JSONX.getInstance().replaceOp(
            ['tableSource', 'table-1', 'tableColumns', 0, 'size', 'width', 'v'],
            80,
            96
        );
        const undoActions = JSONX.getInstance().replaceOp(
            ['tableSource', 'table-1', 'tableColumns', 0, 'size', 'width', 'v'],
            96,
            80
        );

        // Regression: table resize on a 560-page document spent hundreds of milliseconds
        // validating an unchanged body before every visual update.
        expect(validateDocStructureMutation(model, '', actions, undoActions)).toBe(true);
        expect(getSelfOrHeaderFooterModel).not.toHaveBeenCalled();
    });

    it('skips body structure scans for named-style metadata updates', () => {
        const getSelfOrHeaderFooterModel = vi.fn(() => {
            throw new Error('body structure should not be scanned');
        });
        const model = {
            getSnapshot: () => ({}),
            getSelfOrHeaderFooterModel,
        } as unknown as DocumentDataModel;
        const actions = JSONX.getInstance().replaceOp(
            ['styles', 'heading-1', 'paragraphStyle', 'spaceBelow', 'v'],
            0,
            12
        );
        const undoActions = JSONX.getInstance().replaceOp(
            ['styles', 'heading-1', 'paragraphStyle', 'spaceBelow', 'v'],
            12,
            0
        );

        expect(validateDocStructureMutation(model, '', actions, undoActions)).toBe(true);
        expect(getSelfOrHeaderFooterModel).not.toHaveBeenCalled();
    });

    it('allows a history replay to restore structural content from a legacy document', () => {
        const getSelfOrHeaderFooterModel = vi.fn(() => {
            throw new Error('history replay should not reject restored baseline issues');
        });
        const model = {
            getSnapshot: () => ({}),
            getSelfOrHeaderFooterModel,
        } as unknown as DocumentDataModel;
        const actions = JSONX.getInstance().insertOp(['body', 'tables', 0], { tableId: 'legacy-table' });
        const undoActions = JSONX.getInstance().removeOp(['body', 'tables', 0], { tableId: 'legacy-table' });

        expect(validateDocStructureMutation(model, '', actions, undoActions, true)).toBe(false);
        expect(getSelfOrHeaderFooterModel).not.toHaveBeenCalled();
    });

    it('rejects typing inside a content-locked SDT', () => {
        const model = new DocumentDataModel({
            id: 'locked-sdt-doc',
            body: {
                dataStream: 'ABC\r',
                customRanges: [{
                    startIndex: 0,
                    endIndex: 2,
                    rangeId: 'locked-sdt',
                    rangeType: CustomRangeType.SDT,
                    properties: { kind: 'text', placement: 'inline', lock: 'contentLocked' },
                }],
            },
        });
        const edit = new TextX().retain(1).insert(1, { dataStream: 'X' }).serialize();
        const actions = JSONX.getInstance().editOp(edit, getRichTextEditPath(model));
        const undoActions = JSONX.invertWithDoc(actions, model.getSnapshot());
        model.apply(actions);

        expect(() => validateDocStructureMutation(model, '', actions, undoActions))
            .toThrow('[DocSDT] locked-sdt: content is locked');
    });

    it('allows a content-locked SDT to be unlocked through its properties', () => {
        const range = {
            startIndex: 0,
            endIndex: 2,
            rangeId: 'locked-sdt',
            rangeType: CustomRangeType.SDT,
            properties: { kind: 'text' as const, placement: 'inline' as const, lock: 'contentLocked' as const },
        };
        const model = new DocumentDataModel({
            id: 'unlock-sdt-doc',
            body: { dataStream: 'ABC\r', customRanges: [range] },
        });
        const edit = new TextX().retain(3, {
            dataStream: '',
            customRanges: [{ ...range, properties: { ...range.properties, lock: 'unlocked' as const } }],
        }).serialize();
        const actions = JSONX.getInstance().editOp(edit, getRichTextEditPath(model));
        const undoActions = JSONX.invertWithDoc(actions, model.getSnapshot());
        model.apply(actions);

        expect(() => validateDocStructureMutation(model, '', actions, undoActions)).not.toThrow();
        expect(model.getBody()?.customRanges?.[0].properties?.lock).toBe('unlocked');
    });

    it('allows an sdtLocked control to update its value while preserving the wrapper', () => {
        const model = new DocumentDataModel({
            id: 'wrapper-locked-sdt-doc',
            body: {
                dataStream: 'X\x1Cdd mmm yyyy\r\n\x1D',
                customRanges: [{
                    startIndex: 1,
                    endIndex: 15,
                    rangeId: 'date-cell',
                    rangeType: CustomRangeType.SDT,
                    wholeEntity: false,
                    properties: { kind: 'date', placement: 'cell', lock: 'sdtLocked', showingPlaceholder: true },
                }],
            },
        });
        const body = model.getBody()!;
        const replacement = BuildTextUtils.selection.delete([{
            startOffset: 2,
            endOffset: 13,
            collapsed: false,
        }], body, 0, { dataStream: '06 Sep 2026' });
        const metadata = new TextX().retain(1).retain(15, {
            dataStream: '',
            customRanges: [{
                ...body.customRanges![0],
                startIndex: 0,
                endIndex: 14,
                properties: { kind: 'date', placement: 'cell', lock: 'sdtLocked', showingPlaceholder: false },
            }],
        }).serialize();
        const actions = JSONX.getInstance().editOp(TextX.compose(replacement, metadata), getRichTextEditPath(model));
        const undoActions = JSONX.invertWithDoc(actions, model.getSnapshot());
        model.apply(actions);

        expect(() => validateDocStructureMutation(model, '', actions, undoActions)).not.toThrow();
        expect(model.getBody()?.customRanges).toEqual([expect.objectContaining({
            rangeId: 'date-cell',
            startIndex: 1,
            endIndex: 15,
            properties: expect.objectContaining({ showingPlaceholder: false }),
        })]);
    });
});
