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
import { isDocSdtMutationAllowed, validateDocStructureMutation } from '../doc-structure-mutation-validation';

describe('validateDocStructureMutation', () => {
    it('does not treat an SDT identity edit as a footnote structure replacement', () => {
        const model = new DocumentDataModel({ id: 'legacy-table', body: {
            dataStream: '\x1AValue\r\n',
            customRanges: [{ startIndex: 1, endIndex: 5, rangeId: 'control', rangeType: CustomRangeType.SDT, properties: { kind: 'text', placement: 'inline' } }],
        } });
        const before = structuredClone(model.getSnapshot());
        const actions = JSONX.getInstance().editOp(new TextX().updateCustomRanges([{ rangeId: 'control', range: null }]).serialize());
        const undo = JSONX.invertWithDoc(actions, model.getSnapshot());
        model.apply(actions);
        expect(validateDocStructureMutation(model, '', actions, undo)).toBe(true);
        expect(model.getBody()!.dataStream).toBe(before.body!.dataStream);
        expect(model.getBody()!.customRanges).toEqual([]);
        model.apply(undo);
        expect(model.getBody()!.customRanges).toEqual(before.body!.customRanges);
    });

    it('still rejects a missing footnote introduced by an identity edit', () => {
        const model = new DocumentDataModel({ id: 'invalid-note', body: { dataStream: 'X\r\n' } });
        const actions = JSONX.getInstance().editOp(new TextX().updateCustomRanges([{
            rangeId: 'ref',
            range: { startIndex: 0, endIndex: 0, rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, properties: { noteId: 'missing' } },
        }]).serialize());
        const undo = JSONX.invertWithDoc(actions, model.getSnapshot());
        model.apply(actions);
        expect(() => validateDocStructureMutation(model, '', actions, undo)).toThrow('[DocStructure]');
    });

    it.each([
        { editSource: false, sameStore: true, sourceLocked: false, allowed: false },
        { editSource: true, sameStore: true, sourceLocked: false, allowed: true },
        { editSource: true, sameStore: false, sourceLocked: false, allowed: false },
        { editSource: true, sameStore: true, sourceLocked: true, allowed: false },
    ])('validates a locked XML-bound mirror: %j', ({ editSource, sameStore, sourceLocked, allowed }) => {
        const controls = [0, 1].map((index) => ({
            startIndex: index * 4,
            endIndex: index * 4 + 2,
            rangeId: `bound-${index}`,
            rangeType: CustomRangeType.SDT,
            properties: {
                kind: 'text',
                placement: 'inline',
                lock: index === 1 || sourceLocked ? 'contentLocked' : 'unlocked',
                dataBinding: { storeItemID: index === 1 && !sameStore ? 'other' : 'store', xpath: '/value' },
            },
        }));
        const model = new DocumentDataModel({ id: 'locked-mirror', body: { dataStream: 'Old Old\r\n', customRanges: controls } });
        const edit = new TextX();
        if (editSource) {
            edit.delete(3).insert(3, { dataStream: 'New', customRanges: [controls[0]] }).retain(1);
        } else {
            edit.retain(4);
        }
        edit.delete(3).insert(3, { dataStream: 'New', customRanges: [{ ...controls[1], startIndex: 0, endIndex: 2 }] });
        const actions = JSONX.getInstance().editOp(edit.serialize());
        expect(isDocSdtMutationAllowed(model, '', actions)).toBe(allowed);
        expect(model.getBody()?.dataStream).toBe('Old Old\r\n');
    });

    it.each([
        { rangeIndex: 0, allowed: true },
        { rangeIndex: 2, allowed: false },
    ])('keeps nested repeating-section policies independent when removing range $rangeIndex', ({ rangeIndex, allowed }) => {
        const item = { startIndex: 0, endIndex: 0, rangeId: 'inner-item', rangeType: CustomRangeType.SDT, properties: { kind: 'repeatingSectionItem', placement: 'block' } };
        const model = new DocumentDataModel({
            id: 'nested-repeat-policy',
            body: { dataStream: 'A\r\n', customRanges: [
                item,
                { ...item, rangeId: 'inner', properties: { kind: 'repeatingSection', placement: 'block' } },
                { ...item, rangeId: 'outer-item' },
                { ...item, rangeId: 'outer', properties: { kind: 'repeatingSection', placement: 'block', repeatingSection: { doNotAllowInsertDelete: true } } },
            ] },
        });
        const before = structuredClone(model.getSnapshot());
        const actions = JSONX.getInstance().removeOp(['body', 'customRanges', rangeIndex], before.body!.customRanges![rangeIndex]);
        expect(isDocSdtMutationAllowed(model, '', actions)).toBe(allowed);
        expect(model.getSnapshot()).toEqual(before);
    });

    it.each([
        { action: 'remove-item', allowed: false },
        { action: 'add-item', allowed: false },
        { action: 'edit-content', allowed: true },
        { action: 'unlock', allowed: true },
    ])('enforces repeating-section insertion/deletion policy for $action', ({ action, allowed }) => {
        const section = {
            startIndex: 0,
            endIndex: 2,
            rangeId: 'repeat',
            rangeType: CustomRangeType.SDT,
            properties: { kind: 'repeatingSection', placement: 'block', repeatingSection: { doNotAllowInsertDelete: true } },
        };
        const first = {
            startIndex: 0,
            endIndex: 0,
            rangeId: 'first',
            rangeType: CustomRangeType.SDT,
            properties: { kind: 'repeatingSectionItem', placement: 'block' },
        };
        const model = new DocumentDataModel({
            id: 'repeat-policy',
            body: { dataStream: 'A\rB\r\n', customRanges: [first, section, { ...first, rangeId: 'second', startIndex: 2, endIndex: 2 }] },
        });
        const jsonX = JSONX.getInstance();
        let actions;
        if (action === 'remove-item') {
            actions = jsonX.editOp(new TextX().delete(2).serialize(), getRichTextEditPath(model));
        } else if (action === 'add-item') {
            actions = jsonX.editOp(new TextX().retain(2).insert(2, { dataStream: 'C\r', customRanges: [{ ...first, rangeId: 'third' }] }).serialize(), getRichTextEditPath(model));
        } else if (action === 'unlock') {
            actions = jsonX.replaceOp(['body', 'customRanges', 1, 'properties', 'repeatingSection', 'doNotAllowInsertDelete'], true, false);
        } else {
            actions = jsonX.editOp(new TextX().retain(1).insert(1, { dataStream: 'X' }).serialize(), getRichTextEditPath(model));
        }
        const before = structuredClone(model.getSnapshot());
        expect(isDocSdtMutationAllowed(model, '', actions)).toBe(allowed);
        expect(model.getSnapshot()).toEqual(before);
    });

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
        const before = structuredClone(model.getSnapshot());
        expect(isDocSdtMutationAllowed(model, '', actions)).toBe(false);
        expect(model.getSnapshot()).toEqual(before);
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
        expect(isDocSdtMutationAllowed(model, '', actions)).toBe(true);
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
        expect(isDocSdtMutationAllowed(model, '', actions)).toBe(true);
        model.apply(actions);

        expect(() => validateDocStructureMutation(model, '', actions, undoActions)).not.toThrow();
        expect(model.getBody()?.customRanges).toEqual([expect.objectContaining({
            rangeId: 'date-cell',
            startIndex: 1,
            endIndex: 15,
            properties: expect.objectContaining({ showingPlaceholder: false }),
        })]);
    });

    it.each([
        { offset: 5, childLock: 'sdtLocked' as const, allowed: true },
        { offset: 1, childLock: 'sdtLocked' as const, allowed: false },
        { offset: 9, childLock: 'sdtLocked' as const, allowed: false },
        { offset: 5, childLock: 'sdtContentLocked' as const, allowed: false },
    ])('preserves Word group boundaries at $offset with child lock $childLock', ({ offset, childLock, allowed }) => {
        const model = new DocumentDataModel({
            id: 'group-lock',
            body: {
                dataStream: 'leftABCright\r',
                customRanges: [
                    { startIndex: 0, endIndex: 11, rangeId: 'group', rangeType: CustomRangeType.SDT, properties: { kind: 'group', placement: 'block', lock: 'contentLocked' } },
                    { startIndex: 4, endIndex: 6, rangeId: 'child', rangeType: CustomRangeType.SDT, properties: { kind: 'richText', placement: 'inline', lock: childLock } },
                ],
            },
        });
        const before = structuredClone(model.getSnapshot());
        const actions = JSONX.getInstance().editOp(new TextX().retain(offset).insert(1, { dataStream: 'X' }).serialize(), getRichTextEditPath(model));
        expect(isDocSdtMutationAllowed(model, '', actions)).toBe(allowed);
        expect(model.getSnapshot()).toEqual(before);
        const removeChild = JSONX.getInstance().removeOp(['body', 'customRanges', 1], before.body!.customRanges![1]);
        expect(isDocSdtMutationAllowed(model, '', removeChild)).toBe(false);
    });
});
