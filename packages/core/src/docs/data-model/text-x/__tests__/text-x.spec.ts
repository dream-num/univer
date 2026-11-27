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
import type { IDocumentBody, IDocumentData } from '../../../../types/interfaces/i-document-data';
import type { IInsertAction, IRetainAction, TextXAction } from '../action-types';
import { UpdateDocsAttributeType } from '../../../../shared/command-enum';
import { Tools } from '../../../../shared/tools';
import { BooleanNumber } from '../../../../types/enum/text-style';
import {
    CustomDecorationType,
    CustomRangeType,
    DocumentBlockRangeType,
    SpecialCharacterKind,
} from '../../../../types/interfaces/i-document-data';
import { createBookmarkRangeId } from '../../../bookmark-id';
import { JSONX } from '../../json-x/json-x';
import { DataStreamTreeTokenType } from '../../types';
import { PRESERVE_INSERTED_PARAGRAPH_IDS, TextXActionType } from '../action-types';
import { BuildTextUtils } from '../build-utils';
import { copyCustomRange } from '../build-utils/custom-range';
import { validateDocumentStructure } from '../structure-validator';
import { TextX } from '../text-x';
import { composeBody, getBodySlice } from '../utils';

describe('test TextX methods and branches', () => {
    it.each([
        ['new', 5],
        ['z', 5],
        ['a', 5],
        ['z', null],
        ['a', null],
    ] as const)('restores existing bookmark order after undoing %s at %s', (rangeId, startIndex) => {
        const bookmark = (id: string, start: number) => ({
            rangeId: id,
            rangeType: CustomRangeType.BOOKMARK,
            startIndex: start,
            endIndex: start + 3,
            properties: { bookmarkId: id },
        });
        const original: IDocumentBody = { dataStream: 'Body\rNext\r\n', customRanges: [bookmark('z', 0), bookmark('a', 0)] };
        expect(validateDocumentStructure({ body: original })).toEqual([]);
        const action = TextX.makeInvertible([{
            t: TextXActionType.RETAIN,
            len: 0,
            rangeUpdates: [{ rangeId, range: startIndex == null ? null : bookmark(rangeId, startIndex) }],
        }], Tools.deepClone(original));
        const edited = TextX.apply(Tools.deepClone(original), action);
        const restored = TextX.apply(Tools.deepClone(edited), TextX.invert(action));
        expect(restored).toEqual(original);
        expect(TextX.apply(restored, action)).toEqual(edited);
    });

    it('keeps an authored bookmark and a field in the same order across batching and rebasing', () => {
        const original: IDocumentBody = { dataStream: 'Reference target\rBody\r\n' };
        const bookmark: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 0,
            rangeUpdates: [{
                rangeId: createBookmarkRangeId('target'),
                range: { rangeId: createBookmarkRangeId('target'), rangeType: CustomRangeType.BOOKMARK, startIndex: 0, endIndex: 15, properties: { bookmarkId: 'target' } },
            }],
        }];
        const field: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 21 },
            {
                t: TextXActionType.INSERT,
                len: 3,
                body: {
                    dataStream: '\u001F1\u001E',
                    customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 2, properties: { instruction: 'REF target' } }],
                },
            },
        ];
        const expected = TextX.apply(TextX.apply(Tools.deepClone(original), bookmark), field);
        expect(expected.customRanges?.map(({ rangeId }) => rangeId)).toEqual(['ref', createBookmarkRangeId('target')]);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(bookmark, field))).toEqual(expected);
        const afterField = TextX.apply(Tools.deepClone(original), field);
        expect(TextX.apply(afterField, TextX.transform(bookmark, field))).toEqual(expected);
    });

    it.each(['left', 'right'] as const)('converges for two bookmarks on the same text (%s)', (priority) => {
        const createBookmark = (rangeId: string): TextXAction[] => [{
            t: TextXActionType.RETAIN,
            len: 0,
            rangeUpdates: [{
                rangeId,
                range: { rangeId, rangeType: CustomRangeType.BOOKMARK, startIndex: 0, endIndex: 3, properties: { bookmarkId: rangeId } },
            }],
        }];
        const original: IDocumentBody = {
            dataStream: 'Body\r\n',
            customRanges: ['z', 'a'].map((rangeId) => ({
                rangeId,
                rangeType: CustomRangeType.BOOKMARK,
                startIndex: 0,
                endIndex: 3,
                properties: { bookmarkId: rangeId },
            })),
        };
        const left = createBookmark(createBookmarkRangeId('alpha'));
        const right = createBookmark(createBookmarkRangeId('beta'));
        const alice = TextX.apply(TextX.apply(Tools.deepClone(original), left), TextX.transform(right, left, priority));
        const bob = TextX.apply(TextX.apply(Tools.deepClone(original), right), TextX.transform(left, right, priority === 'left' ? 'right' : 'left'));
        expect(alice).toEqual(bob);
        expect(alice.customRanges?.map(({ rangeId }) => rangeId)).toEqual(['z', 'a', createBookmarkRangeId('alpha'), createBookmarkRangeId('beta')]);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(left, right))).toEqual(bob);
    });

    const bookmarkAt = (rangeId: string, startIndex = 0) => ({
        rangeId,
        rangeType: CustomRangeType.BOOKMARK,
        startIndex,
        endIndex: startIndex + 3,
        properties: { bookmarkId: rangeId },
    });
    const updateBookmarks = (rangeUpdates: IRetainAction['rangeUpdates']): TextXAction[] => [
        { t: TextXActionType.RETAIN, len: 0, rangeUpdates },
    ];

    it.each([false, true])('converges when deleting a moved bookmark’s original text (delete its next anchor: %s)', (deleteAnchor) => {
        const original: IDocumentBody = {
            dataStream: 'One\rTwo\rEnd\r\n',
            customRanges: [
                { ...bookmarkAt('z'), endIndex: 2 },
                deleteAnchor ? { ...bookmarkAt('a'), endIndex: 2 } : { ...bookmarkAt('a', 4), endIndex: 6 },
                { ...bookmarkAt('b', 4), endIndex: 6 },
            ],
            customBlocks: [],
        };
        const move = TextX.makeInvertible(updateBookmarks([{ rangeId: 'z', range: { ...bookmarkAt('z', 8), endIndex: 10 } }]), Tools.deepClone(original));
        const remove: TextXAction[] = [{ t: TextXActionType.DELETE, len: 3 }];
        const left = TextX.apply(TextX.apply(Tools.deepClone(original), move), TextX.transform(remove, move, 'left'));
        const right = TextX.apply(TextX.apply(Tools.deepClone(original), remove), TextX.transform(move, remove, 'right'));
        expect(left).toEqual(right);
        expect(left.customRanges?.map(({ rangeId }) => rangeId)).toEqual(deleteAnchor ? ['z', 'b'] : ['z', 'a', 'b']);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(move, remove))).toEqual(left);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(remove, TextX.transform(move, remove, 'right')))).toEqual(right);
    });

    it.each([true, false])('converges when a peer pastes a field during a legacy bookmark move (replaces target: %s)', (replaceTarget) => {
        const original: IDocumentBody = {
            dataStream: 'One\rTwo\rEnd\rLast\r\n',
            customRanges: [
                { ...bookmarkAt('z'), endIndex: 2 },
                { ...bookmarkAt('a', 4), endIndex: 6 },
            ],
        };
        const move = TextX.makeInvertible(
            updateBookmarks([{ rangeId: 'z', range: { ...bookmarkAt('z', 8), endIndex: 10 } }]),
            Tools.deepClone(original)
        );
        const paste: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 3,
            body: {
                dataStream: '\u001F1\u001E',
                customRanges: [{ rangeId: 'field', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 2, properties: { instruction: 'PAGE' } }],
            },
        }];
        if (replaceTarget) {
            paste.unshift({ t: TextXActionType.DELETE, len: 3 });
        }
        const moveAfterPaste = TextX.transform(move, paste, 'right');
        const pasteAfterMove = TextX.transform(paste, move, 'left');
        const left = TextX.apply(TextX.apply(Tools.deepClone(original), move), pasteAfterMove);
        const right = TextX.apply(TextX.apply(Tools.deepClone(original), paste), moveAfterPaste);
        expect(left.customRanges?.map(({ rangeId }) => rangeId)).toEqual(['field', 'a', 'z']);
        expect(right).toEqual(left);
        const composed = TextX.compose(move, pasteAfterMove);
        expect(TextX.apply(Tools.deepClone(original), composed)).toEqual(left);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(paste, moveAfterPaste))).toEqual(left);

        const later = TextX.makeInvertible(updateBookmarks([
            { rangeId: 'a', range: bookmarkAt('a', replaceTarget ? 12 : 15) },
        ]), Tools.deepClone(left));
        const sequential = TextX.apply(Tools.deepClone(left), later);
        expect(sequential.customRanges?.map(({ rangeId }) => rangeId)).toEqual(['field', 'a', 'z']);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(composed, later))).toEqual(sequential);

        const prefix: TextXAction[] = [{ t: TextXActionType.INSERT, len: 3, body: { dataStream: 'Pre' } }];
        const prefixed = TextX.apply(Tools.deepClone(left), prefix);
        const moveAgain = TextX.makeInvertible(updateBookmarks([
            { rangeId: 'z', range: { ...bookmarkAt('z', replaceTarget ? 7 : 6), endIndex: replaceTarget ? 9 : 8 } },
        ]), Tools.deepClone(prefixed));
        const sequentialMove = TextX.apply(Tools.deepClone(prefixed), moveAgain);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(TextX.compose(composed, prefix), moveAgain))).toEqual(sequentialMove);
    });

    it('preserves the slots of legacy bookmarks when moving onto the same target during a field paste', () => {
        const original: IDocumentBody = {
            dataStream: 'One\rTwo\rEnd\r\n',
            customRanges: [
                { ...bookmarkAt('z'), endIndex: 2 },
                { ...bookmarkAt('a'), endIndex: 2 },
                { ...bookmarkAt('b', 4), endIndex: 6 },
            ],
        };
        const moveToEnd = (rangeId: string, body: IDocumentBody): TextXAction[] => TextX.makeInvertible(
            updateBookmarks([{ rangeId, range: { ...bookmarkAt(rangeId, 8), endIndex: 10 } }]),
            Tools.deepClone(body)
        );
        const before = TextX.apply(Tools.deepClone(original), moveToEnd('z', original));
        const move = moveToEnd('a', before);
        const paste: TextXAction[] = [
            { t: TextXActionType.DELETE, len: 3 },
            {
                t: TextXActionType.INSERT,
                len: 3,
                body: {
                    dataStream: '\u001F1\u001E',
                    customRanges: [{ rangeId: 'field', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 2, properties: { instruction: 'PAGE' } }],
                },
            },
        ];
        const moveAfterPaste = TextX.transform(move, paste, 'right');
        const pasteAfterMove = TextX.transform(paste, move, 'left');
        const expected = TextX.apply(TextX.apply(Tools.deepClone(before), move), pasteAfterMove);
        expect(expected.customRanges?.map(({ rangeId }) => rangeId)).toEqual(['field', 'b', 'z', 'a']);
        expect(TextX.apply(TextX.apply(Tools.deepClone(before), paste), moveAfterPaste)).toEqual(expected);
        expect(TextX.apply(Tools.deepClone(before), TextX.compose(move, pasteAfterMove))).toEqual(expected);
        expect(TextX.apply(Tools.deepClone(before), TextX.compose(paste, moveAfterPaste))).toEqual(expected);
    });

    it.each([false, true])('deduplicates bookmark orders when composing separate moves (adds managed bookmarks: %s)', (addManaged) => {
        const count = 250;
        const before: IDocumentData = {
            id: 'doc',
            documentStyle: {},
            body: {
                dataStream: 'Body\rNext\r\n',
                customRanges: Array.from({ length: count }, (_, index) => bookmarkAt(`bookmark-${String(index).padStart(4, '0')}`)),
            },
        };
        const jsonX = JSONX.getInstance();
        let current = Tools.deepClone(before);
        const edits = before.body!.customRanges!.map(({ rangeId }, index) => {
            const updates = [{ rangeId, range: bookmarkAt(rangeId, 5) }];
            if (addManaged) {
                const managedId = createBookmarkRangeId(String(index));
                updates.push({ rangeId: managedId, range: bookmarkAt(managedId, 5) });
            }
            const edit = jsonX.editOp(updateBookmarks(updates));
            JSONX.invertWithDoc(edit, current);
            const transported = JSON.parse(JSON.stringify(edit)) as typeof edit;
            current = JSONX.apply(current, transported) as unknown as IDocumentData;
            return transported;
        });
        const composed = edits.reduce((combined, edit) => JSONX.compose(combined, edit));
        const wire = JSON.stringify(composed);
        expect(wire.length).toBeLessThan(count * (addManaged ? 750 : 400));
        expect(JSONX.apply(Tools.deepClone(before), JSON.parse(wire))).toEqual(current);
        expect(JSONX.apply(current, JSONX.invertWithDoc(JSON.parse(wire), before))).toEqual(before);
    });

    it('reuses encoded order entries in later merges and prunes a superseded prefix', () => {
        const orders: NonNullable<IRetainAction['bookmarkOrders']> = [
            ['a', 'b', 'c', 'd'],
            { segments: [[0, 2], 'd', 'c'] },
        ];
        const packed: IRetainAction = {
            t: TextXActionType.RETAIN,
            len: 0,
            bookmarkOrders: orders,
            rangeUpdates: [
                { rangeId: 'a', range: bookmarkAt('a', 4), fallbackNextRangeId: 'b', fallbackOrderIndex: 0 },
                { rangeId: 'b', range: bookmarkAt('b', 4), fallbackNextRangeId: 'c', fallbackOrderIndex: 1 },
            ],
        };
        const paragraph: TextXAction[] = [{ t: TextXActionType.INSERT, len: 1, body: { dataStream: 'A' } }];
        const composed = TextX.compose([packed], paragraph);
        const retained = composed.find((action): action is IRetainAction => action.t === TextXActionType.RETAIN && !!action.bookmarkOrders);
        expect(retained?.bookmarkOrders?.[1]).toBe(orders[1]);

        const next = TextX.compose(composed, updateBookmarks([{ rangeId: 'a', range: null }]));
        const remaining = next.find((action): action is IRetainAction => action.t === TextXActionType.RETAIN && !!action.bookmarkOrders);
        expect(remaining?.bookmarkOrders).toEqual([['a', 'b', 'd', 'c']]);
        expect(remaining?.rangeUpdates?.find((update) => update.rangeId === 'b')?.fallbackOrderIndex).toBe(0);
    });

    it.each([false, true])('keeps 500 bookmark moves alternating with REF fields compact (later section: %s)', { timeout: 60_000 }, (laterSection) => {
        const count = 500;
        const before: IDocumentData = {
            id: 'doc',
            documentStyle: {},
            body: {
                dataStream: `${'Book    '.repeat(count)}Heading\r\n`,
                customBlocks: [],
                customRanges: Array.from({ length: count }, (_, index) => bookmarkAt(`legacy-bookmark-${index}`, index * 8)),
            },
        };
        const jsonX = JSONX.getInstance();
        let current = Tools.deepClone(before);
        let composed: ReturnType<typeof jsonX.editOp> = null;

        function record(actions: TextXAction[]) {
            const edit = jsonX.editOp(actions);
            JSONX.invertWithDoc(edit, current);
            const transported = JSON.parse(JSON.stringify(edit)) as typeof edit;
            current = JSONX.apply(current, transported) as unknown as IDocumentData;
            composed = JSONX.compose(composed, transported);
        }

        for (const bookmark of before.body!.customRanges!) {
            const destination = laterSection ? count * 8 : bookmark.startIndex + 1;
            record(updateBookmarks([{ rangeId: bookmark.rangeId, range: bookmarkAt(bookmark.rangeId, destination) }]));
            record([
                { t: TextXActionType.RETAIN, len: laterSection ? current.body!.dataStream.length - 2 : count * 8 },
                { t: TextXActionType.INSERT, len: 3, body: {
                    dataStream: '\u001F1\u001E',
                    customRanges: [{
                        rangeId: `ref-${bookmark.rangeId}`,
                        rangeType: CustomRangeType.FIELD,
                        startIndex: 0,
                        endIndex: 2,
                        properties: { instruction: `REF ${bookmark.rangeId}` },
                    }],
                } },
            ]);
        }

        const wire = JSON.stringify(composed);
        expect(wire.length).toBeLessThan(500_000);
        expect(JSONX.apply(Tools.deepClone(before), JSON.parse(wire))).toEqual(current);
        expect(JSONX.apply(current, JSONX.invertWithDoc(JSON.parse(wire), before))).toEqual(before);
    });

    it.each([1, 4])('keeps serialized history for a bulk move across %s retains linear', (batches) => {
        const bytes = (count: number) => {
            const body: IDocumentBody = {
                dataStream: 'Body\rNext\r\n',
                customRanges: Array.from({ length: count }, (_, index) => bookmarkAt(`bookmark-${String(index).padStart(4, '0')}`)),
            };
            const updates = body.customRanges!.map(({ rangeId }) => ({ rangeId, range: bookmarkAt(rangeId, 5) }));
            const batchSize = Math.ceil(count / batches);
            const actions = Array.from({ length: batches }, (_, index) => updateBookmarks(updates.slice(index * batchSize, (index + 1) * batchSize))).flat();
            const edit = JSONX.getInstance().editOp(actions);
            const original: IDocumentData = { id: 'doc', documentStyle: {}, body };
            const undo = JSONX.invertWithDoc(edit, original);
            const wireEdit = JSON.stringify(edit);
            const after = JSONX.apply(Tools.deepClone(original), JSON.parse(wireEdit)) as unknown as IDocumentData;
            expect(JSONX.apply(after, JSON.parse(JSON.stringify(undo)))).toEqual(original);
            return wireEdit.length;
        };
        const small = bytes(500);
        const large = bytes(1000);
        expect(large).toBeLessThan(400_000);
        expect(large).toBeLessThan(small * 2.1);
    });

    it('converges when a peer pastes a bookmark during legacy bookmark undo', () => {
        const original: IDocumentBody = { dataStream: 'Body\rNext\r\n', customRanges: [bookmarkAt('old')], customBlocks: [] };
        const deletion = TextX.makeInvertible(updateBookmarks([{ rangeId: 'old', range: null }]), Tools.deepClone(original));
        const deleted = TextX.apply(Tools.deepClone(original), deletion);
        const restore = TextX.invert(deletion);
        const pasted = copyCustomRange(bookmarkAt(createBookmarkRangeId('source')));
        const paste: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 5 },
            { t: TextXActionType.INSERT, len: 4, body: { dataStream: 'Copy', customRanges: [pasted] } },
        ];
        const left = TextX.apply(TextX.apply(Tools.deepClone(deleted), restore), TextX.transform(paste, restore, 'left'));
        const right = TextX.apply(TextX.apply(Tools.deepClone(deleted), paste), TextX.transform(restore, paste, 'right'));
        expect(left).toEqual(right);
        expect(left.customRanges?.map(({ rangeId }) => rangeId)).toEqual(['old', pasted.rangeId]);
    });

    it('undoes a bookmark move combined with deletion through a second legacy bookmark', () => {
        const original: IDocumentBody = {
            dataStream: 'Body\rNext\rLast\r\n',
            customRanges: [bookmarkAt('a'), bookmarkAt('z', 5)],
            customBlocks: [],
        };
        const moveAndDelete = TextX.makeInvertible([
            { t: TextXActionType.RETAIN, len: 5 },
            { t: TextXActionType.DELETE, len: 1 },
            ...updateBookmarks([{ rangeId: 'a', range: bookmarkAt('a', 9) }]),
        ], Tools.deepClone(original));
        expect(TextX.apply(TextX.apply(Tools.deepClone(original), moveAndDelete), TextX.invert(moveAndDelete))).toEqual(original);
    });

    it('converges when a peer moves an existing bookmark and another creates a bookmark', () => {
        const original: IDocumentBody = { dataStream: 'Body\rNext\r\n', customRanges: [bookmarkAt('z'), bookmarkAt('a')] };
        const move = updateBookmarks([{ rangeId: 'z', range: bookmarkAt('z', 5) }]);
        const insert = updateBookmarks([{ rangeId: 'b', range: bookmarkAt('b') }]);
        const moved = TextX.apply(TextX.apply(Tools.deepClone(original), move), insert);
        const inserted = TextX.apply(TextX.apply(Tools.deepClone(original), insert), move);
        expect(moved).toEqual(inserted);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(move, insert))).toEqual(moved);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(insert, move))).toEqual(moved);
        expect(TextX.apply(TextX.apply(Tools.deepClone(original), insert), TextX.transform(move, insert, 'right'))).toEqual(moved);
        expect(TextX.apply(TextX.apply(Tools.deepClone(original), move), TextX.transform(insert, move, 'left'))).toEqual(moved);
    });

    it.each([
        { t: TextXActionType.INSERT, len: 1, body: { dataStream: '!' } },
        { t: TextXActionType.DELETE, len: 1 },
    ] as const)('keeps bookmark slots when a peer changes plain text ($t)', (textEdit) => {
        const original: IDocumentBody = {
            dataStream: 'Body\rNext\rLast Word\r\n',
            customRanges: [bookmarkAt('z'), bookmarkAt('a', 5)],
        };
        const move = updateBookmarks([{ rangeId: 'z', range: bookmarkAt('z', 10) }]);
        const text: TextXAction[] = [{ t: TextXActionType.RETAIN, len: 15 }, textEdit];
        const left = TextX.apply(TextX.apply(Tools.deepClone(original), move), TextX.transform(text, move, 'left'));
        const right = TextX.apply(TextX.apply(Tools.deepClone(original), text), TextX.transform(move, text, 'right'));
        expect(left).toEqual(right);
    });

    it.each([false, true])('converges when a peer removes a bookmark during an insert (authored: %s)', (authored) => {
        const original: IDocumentBody = { dataStream: 'Body\r\n', customRanges: [bookmarkAt('z'), bookmarkAt('a')] };
        const remove = updateBookmarks([{ rangeId: 'z', range: null }]);
        const rangeId = authored ? createBookmarkRangeId('b') : 'b';
        const insert = updateBookmarks([{ rangeId, range: bookmarkAt(rangeId) }]);
        const sequential = TextX.apply(TextX.apply(Tools.deepClone(original), remove), insert);
        const left = TextX.apply(TextX.apply(Tools.deepClone(original), remove), TextX.transform(insert, remove, 'left'));
        const right = TextX.apply(TextX.apply(Tools.deepClone(original), insert), TextX.transform(remove, insert, 'right'));
        expect(left).toEqual(right);
        expect(TextX.apply(Tools.deepClone(original), TextX.compose(remove, insert))).toEqual(sequential);
    });

    it.each([false, true])('converges when a peer restores a bookmark during an insert (authored: %s)', (authored) => {
        const original: IDocumentBody = { dataStream: 'Body\r\n', customRanges: [bookmarkAt('z'), bookmarkAt('a')] };
        const remove = TextX.makeInvertible(updateBookmarks([{ rangeId: 'z', range: null }]), Tools.deepClone(original));
        const deleted = TextX.apply(Tools.deepClone(original), remove);
        const restore = TextX.invert(remove);
        const rangeId = authored ? createBookmarkRangeId('b') : 'b';
        const insert = updateBookmarks([{ rangeId, range: bookmarkAt(rangeId) }]);
        const left = TextX.apply(TextX.apply(Tools.deepClone(deleted), restore), TextX.transform(insert, restore, 'left'));
        const right = TextX.apply(TextX.apply(Tools.deepClone(deleted), insert), TextX.transform(restore, insert, 'right'));
        expect(left).toEqual(right);
    });

    it.each([false, true])('preserves bookmark order when a peer pastes a field (authored: %s)', (authored) => {
        const original: IDocumentBody = {
            dataStream: 'Body\rNext\rLast\r\n',
            customRanges: [bookmarkAt('a'), bookmarkAt('d', 5)],
        };
        const rangeId = authored ? createBookmarkRangeId('b') : 'b';
        const insert = updateBookmarks([{ rangeId, range: bookmarkAt(rangeId, 10) }]);
        const paste: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 3,
            body: {
                dataStream: '\u001F1\u001E',
                customRanges: [{ rangeId: 'field', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 2, properties: { instruction: 'REF a' } }],
            },
        }];
        const left = TextX.apply(TextX.apply(Tools.deepClone(original), insert), TextX.transform(paste, insert, 'left'));
        const right = TextX.apply(TextX.apply(Tools.deepClone(original), paste), TextX.transform(insert, paste, 'right'));
        expect(left).toEqual(right);
    });

    it.each([false, true])('restores the saved bookmark order after undoing text deletion (authored: %s)', (authored) => {
        const rangeId = authored ? createBookmarkRangeId('d') : 'd';
        const source: IDocumentBody = {
            dataStream: 'Body\rNext\rLast\r\n',
            customBlocks: [],
            customRanges: [bookmarkAt('a'), bookmarkAt(rangeId, 5)],
        };
        const original = TextX.apply(source, updateBookmarks([{ rangeId: 'b', range: bookmarkAt('b', 10) }]));
        const deletion = TextX.makeInvertible([
            { t: TextXActionType.RETAIN, len: 5 },
            { t: TextXActionType.DELETE, len: 4 },
        ], Tools.deepClone(original));
        const edited = TextX.apply(Tools.deepClone(original), deletion);
        expect(edited.customRanges?.some((range) => range.rangeId === rangeId)).toBe(false);
        expect(TextX.apply(edited, TextX.invert(deletion))).toEqual(original);
    });

    it('converges when undo restores a removed bookmark and a peer moves its anchor', () => {
        const original: IDocumentBody = {
            dataStream: 'Body\rNext\rLast\r\n',
            customRanges: [bookmarkAt('z'), bookmarkAt('a'), bookmarkAt('c', 5)],
        };
        const deletion = TextX.makeInvertible(updateBookmarks([{ rangeId: 'z', range: null }]), Tools.deepClone(original));
        const deleted = TextX.apply(Tools.deepClone(original), deletion);
        const restore = TextX.invert(deletion);
        const move = updateBookmarks([{ rangeId: 'a', range: bookmarkAt('a', 10) }]);
        const alice = TextX.apply(TextX.apply(Tools.deepClone(deleted), restore), TextX.transform(move, restore, 'left'));
        const bob = TextX.apply(TextX.apply(Tools.deepClone(deleted), move), TextX.transform(restore, move, 'right'));
        expect(alice).toEqual(bob);
    });

    it('restores the complete snapshot when undoing a batch of bookmark moves', () => {
        const original: IDocumentBody = {
            dataStream: 'Body\rNext\r\n',
            customRanges: [bookmarkAt('b'), bookmarkAt('a'), bookmarkAt('c')],
        };
        const move = TextX.makeInvertible(updateBookmarks([
            { rangeId: 'a', range: bookmarkAt('a', 5) },
            { rangeId: 'b', range: bookmarkAt('b', 5) },
        ]), Tools.deepClone(original));
        const edited = TextX.apply(Tools.deepClone(original), move);
        expect(TextX.apply(edited, TextX.invert(move))).toEqual(original);
    });

    it('keeps a large bookmark undo linear and restores every slot', () => {
        const original: IDocumentBody = {
            dataStream: 'Body\r\n',
            customRanges: Array.from({ length: 1000 }, (_, index) => bookmarkAt(`bookmark-${String(1000 - index).padStart(4, '0')}`)),
        };
        const remove = updateBookmarks(original.customRanges!.map(({ rangeId }) => ({ rangeId, range: null })));
        TextX.makeInvertible(remove, Tools.deepClone(original));
        const undo = TextX.invert(remove);
        expect(JSON.stringify(undo).length).toBeLessThan(250_000);
        const deleted = TextX.apply(Tools.deepClone(original), remove);
        expect(TextX.apply(deleted, undo)).toEqual(original);
    });

    it.each(['b', 'zz'])('converges when restoring legacy bookmark order while a peer inserts %s', (rangeId) => {
        const bookmark = (id: string, startIndex = 0) => ({
            rangeId: id,
            rangeType: CustomRangeType.BOOKMARK,
            startIndex,
            endIndex: startIndex + 3,
            properties: { bookmarkId: id },
        });
        const original: IDocumentBody = {
            dataStream: 'Body\rNext\r\n',
            customRanges: [bookmark('z'), bookmark('a')],
        };
        const move = TextX.makeInvertible(
            [{
                t: TextXActionType.RETAIN,
                len: 0,
                rangeUpdates: [{ rangeId: 'a', range: bookmark('a', 5) }],
            }],
            Tools.deepClone(original)
        );
        const moved = TextX.apply(Tools.deepClone(original), move);
        const restore = TextX.invert(move);
        const insert: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 0,
            rangeUpdates: [{ rangeId, range: bookmark(rangeId) }],
        }];
        const alice = TextX.apply(TextX.apply(Tools.deepClone(moved), restore), TextX.transform(insert, restore, 'left'));
        const rebasedRestore = JSON.parse(JSON.stringify(TextX.transform(restore, insert, 'right'))) as TextXAction[];
        const afterInsert = TextX.apply(Tools.deepClone(moved), insert);
        const bob = TextX.apply(Tools.deepClone(afterInsert), rebasedRestore);
        expect(alice).toEqual(bob);
        expect(alice.customRanges?.filter((range) => range.rangeId !== rangeId)).toEqual(original.customRanges);
        const serializedRestore = JSON.parse(JSON.stringify(restore)) as TextXAction[];
        expect(TextX.apply(Tools.deepClone(afterInsert), serializedRestore)).toEqual(bob);

        const deleteText: TextXAction[] = [{ t: TextXActionType.DELETE, len: 4 }];
        const restoreAfterDelete = TextX.transform(rebasedRestore, deleteText);
        expect(TextX.apply(TextX.apply(afterInsert, deleteText), restoreAfterDelete)).toEqual(
            TextX.apply(bob, TextX.transform(deleteText, rebasedRestore, 'left'))
        );
    });

    it('converges when restoring a bookmark while a peer creates another', () => {
        const bookmark = (rangeId: string) => ({
            rangeId,
            rangeType: CustomRangeType.BOOKMARK,
            startIndex: 0,
            endIndex: 3,
            properties: { bookmarkId: rangeId },
        });
        const original: IDocumentBody = { dataStream: 'Body\r\n', customRanges: [bookmark('alpha'), bookmark('gamma')] };
        const remove = TextX.makeInvertible(
            [{
                t: TextXActionType.RETAIN,
                len: 0,
                rangeUpdates: [{ rangeId: 'alpha', range: null }],
            }],
            Tools.deepClone(original)
        );
        const deleted = TextX.apply(Tools.deepClone(original), remove);
        const restore = TextX.invert(remove);
        const insert: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 0,
            rangeUpdates: [{ rangeId: 'beta', range: bookmark('beta') }],
        }];
        const alice = TextX.apply(TextX.apply(Tools.deepClone(deleted), restore), TextX.transform(insert, restore, 'left'));
        const bob = TextX.apply(TextX.apply(Tools.deepClone(deleted), insert), TextX.transform(restore, insert, 'right'));
        expect(alice).toEqual(bob);
        expect(alice.customRanges?.map(({ rangeId }) => rangeId)).toEqual(['alpha', 'gamma', 'beta']);
    });

    it.each([false, true])('preserves newly inserted field boundaries through a composed refresh (nested=%s)', (nested) => {
        const original: IDocumentBody = {
            dataStream: '\u001FOld\u001E\r\n',
            customBlocks: [],
            customRanges: [{ rangeId: 'existing', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 4, properties: { fieldType: 'REF', instruction: 'REF old' } }],
            paragraphs: [{ startIndex: 5, paragraphId: 'para_original' }],
            sectionBreaks: [{ startIndex: 6, sectionId: 'section_original' }],
        };
        const range = { rangeId: 'reference', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 1, properties: { fieldType: nested ? 'TOC' : 'REF', instruction: nested ? 'TOC \\o "1-3"' : 'REF target', dirty: 1 } };
        const result: IDocumentBody = nested
            ? { dataStream: '\u001F1\u001E\rnext', customRanges: [{ rangeId: 'page', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 2, properties: { fieldType: 'PAGEREF', instruction: 'PAGEREF target' } }], paragraphs: [{ startIndex: 3, paragraphId: 'para_result' }] }
            : { dataStream: 'target' };
        Reflect.set(result, PRESERVE_INSERTED_PARAGRAPH_IDS, true);
        const inserted: TextXAction[] = [{ t: TextXActionType.INSERT, len: 2, body: { dataStream: '\u001F\u001E', customRanges: [range] } }];
        const refreshed: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 1 },
            { t: TextXActionType.INSERT, len: result.dataStream.length, body: result, valueRangeId: range.rangeId },
            { t: TextXActionType.RETAIN, len: 0, rangeUpdates: [{ rangeId: range.rangeId, range: { ...range, endIndex: result.dataStream.length + 1, properties: { ...range.properties, dirty: 0, cachedResult: result.dataStream } }, propertyPaths: [['dirty'], ['cachedResult']] }] },
        ];
        const bookmarkChanges: TextXAction[] = [{ t: TextXActionType.RETAIN, len: 0, rangeUpdates: [{ rangeId: 'target', range: { rangeId: 'target', rangeType: CustomRangeType.BOOKMARK, startIndex: 1, endIndex: 3, properties: { bookmarkId: 'target' } } }] }];
        const updated = TextX.apply(TextX.apply(TextX.apply(Tools.deepClone(original), bookmarkChanges), inserted), refreshed);
        const followingSection = updated.sectionBreaks![0];
        const sectionFormatting: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: followingSection.startIndex },
            { t: TextXActionType.RETAIN, len: 1, coverType: UpdateDocsAttributeType.REPLACE, body: { dataStream: '', sectionBreaks: [{ ...followingSection, startIndex: 0, sectionType: 1 }] } },
        ];
        const expected = TextX.apply(Tools.deepClone(updated), sectionFormatting);
        const combined = TextX.compose(TextX.compose(bookmarkChanges, inserted), refreshed);
        expect(TextX.apply(Tools.deepClone(original), combined)).toEqual(TextX.apply(Tools.deepClone(original), TextX.compose(bookmarkChanges, TextX.compose(inserted, refreshed))));
        const composed = TextX.makeInvertible(TextX.compose(combined, sectionFormatting), Tools.deepClone(original));
        const actual = TextX.apply(Tools.deepClone(original), JSON.parse(JSON.stringify(composed)));
        expect(validateDocumentStructure({ body: actual })).toEqual([]);
        expect(actual).toEqual(expected);
        expect(actual.customRanges!.map((item) => item.rangeId).sort()).toEqual(nested ? ['existing', 'page', 'reference', 'target'] : ['existing', 'reference', 'target']);
        expect(TextX.apply(Tools.deepClone(actual), TextX.invert(composed))).toEqual(original);
        expect(TextX.apply(Tools.deepClone(original), composed)).toEqual(expected);
        const peer: TextXAction[] = [{ t: TextXActionType.INSERT, len: 5, body: { dataStream: 'Peer ' } }];
        for (const priority of ['left', 'right'] as const) {
            const left = TextX.apply(TextX.apply(Tools.deepClone(original), composed), TextX.transform(peer, composed, priority));
            const right = TextX.apply(TextX.apply(Tools.deepClone(original), peer), TextX.transform(composed, peer, priority === 'left' ? 'right' : 'left'));
            expect(left).toEqual(right);
            expect(validateDocumentStructure({ body: left })).toEqual([]);
        }
    });

    it.each(['left', 'right'] as const)('keeps paragraph-boundary identities after concurrent inline input (%s)', (priority) => {
        for (const prefix of ['', 'Earlier\r']) {
            const original: IDocumentBody = {
                dataStream: `${prefix}Intro\r\n`,
                paragraphs: [
                    ...(prefix ? [{ startIndex: prefix.length - 1, paragraphId: 'earlier' }] : []),
                    { startIndex: prefix.length + 5, paragraphId: 'original' },
                ],
            };
            const offset: TextXAction[] = prefix ? [{ t: TextXActionType.RETAIN, len: prefix.length }] : [];
            const inline = TextX.makeInvertible([...offset, {
                t: TextXActionType.INSERT,
                len: 6,
                body: { dataStream: 'Alice ' },
            }], original);
            const paragraph = TextX.makeInvertible([...offset, {
                t: TextXActionType.INSERT,
                len: 4,
                body: { dataStream: 'Bob\r', paragraphs: [{ startIndex: 3, paragraphId: 'para_inserted' }] },
            }], original);
            const apply = (first: TextXAction[], second: TextXAction[]) => {
                const body = Tools.deepClone(original);
                TextX.apply(body, JSON.parse(JSON.stringify(first)));
                TextX.apply(body, JSON.parse(JSON.stringify(second)));
                return body;
            };
            const left = apply(inline, TextX.transform(paragraph, inline, priority));
            const right = apply(paragraph, TextX.transform(inline, paragraph, priority === 'left' ? 'right' : 'left'));
            expect(left).toEqual(right);
            expect(left.paragraphs!.map((item) => item.paragraphId)).toEqual([
                ...(prefix ? ['earlier'] : []),
                'para_inserted',
                'original',
            ]);
            expect(left).not.toHaveProperty(PRESERVE_INSERTED_PARAGRAPH_IDS);
        }
    });

    it('keeps peer formatting and nested fields when undoing heading metadata without text edits', () => {
        const body: IDocumentBody = {
            dataStream: 'Heading\rTail\r\n',
            paragraphs: [{ paragraphId: 'heading', startIndex: 7 }, { paragraphId: 'tail', startIndex: 12 }],
            textRuns: [{ st: 0, ed: 13, ts: { fs: 12 } }],
            customRanges: [
                { startIndex: 0, endIndex: 12, rangeId: 'outer', rangeType: CustomRangeType.FIELD },
                { startIndex: 2, endIndex: 4, rangeId: 'inner', rangeType: CustomRangeType.FIELD },
            ],
        };
        const originalParagraphs = Tools.deepClone(body.paragraphs);
        const fold = new TextX().retain(7).retain(1, {
            dataStream: '',
            paragraphs: [{ startIndex: 0, paragraphId: 'heading', headingCollapsed: true }],
        }).serialize();
        TextX.makeInvertible(fold, body);
        TextX.apply(body, fold);
        TextX.apply(body, new TextX().retain(7).retain(1, {
            dataStream: '',
            textRuns: [{ st: 0, ed: 1, ts: { it: BooleanNumber.TRUE } }],
        }).serialize());
        TextX.apply(body, new TextX().updateCustomRangeProperties(body.customRanges![0], {
            locked: BooleanNumber.TRUE,
        }).serialize());
        const expected = Tools.deepClone(body);
        expected.paragraphs = originalParagraphs;

        TextX.apply(body, TextX.invert(fold));

        expect(body).toEqual(expected);
    });

    it('keeps scalar identity distinct from adjacent typing, different controls and document snapshots', () => {
        const value = { t: TextXActionType.INSERT, len: 1, body: { dataStream: 'A' }, valueRangeId: 'first' } as IInsertAction;
        const edit = new TextX().insert(1, { dataStream: 'X' }).push(value).delete(1).serialize();
        const peer = new TextX().push({ ...value, body: { dataStream: 'B' } }).delete(1).serialize();
        const original = { dataStream: 'Old\r\n' };
        for (const priority of ['left', 'right'] as const) {
            const left = TextX.apply(TextX.apply(Tools.deepClone(original), edit), TextX.transform(peer, edit, priority === 'left' ? 'right' : 'left'));
            const right = TextX.apply(TextX.apply(Tools.deepClone(original), peer), TextX.transform(edit, peer, priority));
            expect(left).toEqual(right);
            expect(left.dataStream.replace('X', '')).toBe(`${priority === 'left' ? 'A' : 'B'}ld\r\n`);
            expect(left.dataStream).toContain('X');
            expect(JSON.stringify(left)).not.toContain('valueRangeId');
        }
        const independent = new TextX().push({ ...value, valueRangeId: 'second', body: { dataStream: 'C' } }).serialize();
        const left = TextX.apply(TextX.apply(Tools.deepClone(original), [value]), TextX.transform(independent, [value], 'right'));
        const right = TextX.apply(TextX.apply(Tools.deepClone(original), independent), TextX.transform([value], independent, 'left'));
        expect(left).toEqual(right);
        expect(left.dataStream).toBe('ACOld\r\n');
        TextX.makeInvertible(edit, original);
        const applied = TextX.apply(Tools.deepClone(original), edit);
        TextX.apply(applied, TextX.invert(edit));
        expect(applied.dataStream).toBe(original.dataStream);
    });

    it('keeps the retain before a losing scalar insertion finite when the winning edit ends earlier', () => {
        const insert: IInsertAction = { t: TextXActionType.INSERT, len: 3, body: { dataStream: 'Old' }, valueRangeId: 'scalar' };
        const remove = { t: TextXActionType.DELETE as const, len: 3, valueRangeId: 'scalar' };
        const first = new TextX().push(insert).retain(1).push(remove).serialize();
        const second = new TextX().retain(1).push(remove).retain(1).push(insert).serialize();
        for (const [winner, loser, expected] of [[first, second, 'OldLR\r\n'], [second, first, 'LROld\r\n']] as const) {
            const original = { dataStream: 'LOldR\r\n' };
            const transformed = TextX.transform(winner, loser, 'left');
            expect(transformed.every(({ len }) => Number.isFinite(len))).toBe(true);
            const afterWinner = TextX.apply(TextX.apply(Tools.deepClone(original), winner), TextX.transform(loser, winner, 'right'));
            const afterLoser = TextX.apply(TextX.apply(Tools.deepClone(original), loser), transformed);
            expect(afterWinner.dataStream).toBe(expected);
            expect(afterLoser).toEqual(afterWinner);
        }
    });

    it('rejects malformed scalar identities before any text is applied', () => {
        for (const valueRangeId of ['', null, 1, [], {}]) {
            const original = { dataStream: 'Old\r\n' };
            const actions = new TextX().insert(1, { dataStream: 'X' }).push({
                t: TextXActionType.INSERT,
                len: 1,
                body: { dataStream: 'A' },
                valueRangeId,
            } as IInsertAction).serialize();
            expect(() => TextX.apply(original, actions)).toThrow('Invalid scalar value range identity');
            expect(original.dataStream).toBe('Old\r\n');
        }
    });

    it('composes property edits with positional metadata and preserves independent concurrent metadata', () => {
        const range = { startIndex: 0, endIndex: 4, rangeId: 'sdt', rangeType: CustomRangeType.SDT, properties: { kind: 'text', alias: 'Old', tag: 'Old tag' } };
        const original: IDocumentBody = { dataStream: 'Value\r\n', customRanges: [range] };
        const edit = new TextX().updateCustomRangeProperties(range, { ...range.properties, alias: 'New' }).serialize();
        const legacy = new TextX().retain(5, { dataStream: '', customRanges: [{ ...range, properties: { ...range.properties, tag: 'Peer tag' } }] }).serialize();
        const left = Tools.deepClone(original);
        const right = Tools.deepClone(original);
        TextX.apply(left, edit);
        TextX.apply(left, TextX.transform(legacy, edit, 'right'));
        TextX.apply(right, legacy);
        TextX.apply(right, TextX.transform(edit, legacy, 'left'));
        expect(left).toEqual(right);
        expect(left.customRanges![0].properties).toMatchObject({ alias: 'New', tag: 'Peer tag' });
        const composed = Tools.deepClone(original);
        const sequential = Tools.deepClone(original);
        TextX.apply(composed, TextX.compose(edit, legacy));
        TextX.apply(sequential, edit);
        TextX.apply(sequential, legacy);
        expect(composed).toEqual(sequential);
    });

    it('roundtrips new nested property edits without leaving empty objects or reverting peers', () => {
        const range = { startIndex: 0, endIndex: 4, rangeId: 'sdt', rangeType: CustomRangeType.SDT, properties: { kind: 'date' } };
        const original: IDocumentBody = { dataStream: 'Value\r\n', customRanges: [range] };
        const first = new TextX().updateCustomRangeProperties(range, { ...range.properties, date: { format: 'yyyy' } }).serialize();
        TextX.makeInvertible(first, original);
        const body = Tools.deepClone(original);
        TextX.apply(body, first);
        TextX.apply(body, TextX.invert(first));
        expect(body).toEqual(original);
        const peer = new TextX().updateCustomRangeProperties(range, { ...range.properties, date: { locale: 'zh-CN' } }).serialize();
        TextX.apply(body, TextX.compose(first, peer));
        TextX.apply(body, TextX.transform(TextX.invert(first), peer, 'left'));
        expect(body.customRanges![0].properties).toEqual({ kind: 'date', date: { locale: 'zh-CN' } });
    });

    it.each(['left', 'right'] as const)('converges on nested property removal versus child edits (%s)', (priority) => {
        const range = { startIndex: 0, endIndex: 4, rangeId: 'sdt', rangeType: CustomRangeType.SDT, properties: { kind: 'date', date: { format: 'yyyy', locale: 'en-US' } } };
        const original: IDocumentBody = { dataStream: 'Value\r\n', customRanges: [range] };
        const remove = new TextX().updateCustomRangeProperties(range, { kind: 'date' }).serialize();
        const edit = new TextX().updateCustomRangeProperties(range, { ...range.properties, date: { format: 'dd', locale: 'en-US' } }).serialize();
        const left = Tools.deepClone(original);
        const right = Tools.deepClone(original);
        TextX.apply(left, remove);
        TextX.apply(left, TextX.transform(edit, remove, priority === 'left' ? 'right' : 'left'));
        TextX.apply(right, edit);
        TextX.apply(right, TextX.transform(remove, edit, priority));
        expect(left).toEqual(right);
        expect(left.customRanges![0].properties).toEqual(priority === 'left' ? { kind: 'date' } : { kind: 'date', date: { format: 'dd', locale: 'en-US' } });
    });

    it('rejects malformed identity metadata before applying any text edits', () => {
        const range = { startIndex: 0, endIndex: 4, rangeId: 'sdt', rangeType: CustomRangeType.SDT };
        const original: IDocumentBody = { dataStream: 'Value\r\n', customRanges: [range] };
        const invalidUpdates: unknown[] = [
            ...[{ startIndex: -1 }, { endIndex: 20 }, { rangeId: 'other' }]
                .map((patch) => ({ rangeId: 'sdt', range: { ...range, ...patch } })),
            { rangeId: 'sdt' },
            ...[false, 0, '', []].map((value) => ({ rangeId: 'sdt', range: value })),
            { rangeId: 'sdt', range, nextRangeId: 0 },
            ...[null, 'alias', [[]], [['__proto__', 'polluted']], [['alias', 1]]]
                .map((propertyPaths) => ({ rangeId: 'sdt', range, propertyPaths })),
        ];
        for (const update of invalidUpdates) {
            const body = Tools.deepClone(original);
            const actions = new TextX().insert(1, { dataStream: 'X' }).updateCustomRanges([
                update as NonNullable<IRetainAction['rangeUpdates']>[number],
            ]).serialize();
            expect(() => TextX.apply(body, actions)).toThrow('Invalid custom range');
            expect(body).toEqual(original);
        }
    });

    it.each(['', 'Value'])('roundtrips identity removal and history through JSONX for %j', (value) => {
        const original = {
            id: 'doc',
            documentStyle: {},
            body: {
                dataStream: `\x1F${value}\x1EAfter\r\n`,
                customRanges: [{ startIndex: 0, endIndex: value.length + 1, rangeId: 'sdt', rangeType: CustomRangeType.SDT, properties: { kind: 'text', placement: 'inline' } }],
            },
        } as IDocumentData;
        const edit = new TextX().delete(1).retain(value.length).delete(1).updateCustomRanges([{ rangeId: 'sdt', range: null }]).serialize();
        const op = JSONX.getInstance().editOp(edit);
        const undo = JSONX.invertWithDoc(op, Tools.deepClone(original));
        const removed = JSONX.apply(Tools.deepClone(original), JSON.parse(JSON.stringify(op))) as unknown as IDocumentData;
        expect(removed.body!.dataStream).toBe(`${value}After\r\n`);
        expect(removed.body!.customRanges).toEqual([]);
        const restored = JSONX.apply(Tools.deepClone(removed), JSON.parse(JSON.stringify(undo))) as unknown as IDocumentData;
        expect(restored.body!.dataStream).toBe(original.body!.dataStream);
        expect(restored.body!.customRanges).toEqual(original.body!.customRanges);
        const combined = JSONX.apply(Tools.deepClone(original), JSONX.compose(op, undo)) as unknown as IDocumentData;
        expect(combined.body!.dataStream).toBe(original.body!.dataStream);
        expect(combined.body!.customRanges).toEqual(original.body!.customRanges);

        const peer = new TextX().retain(1).insert(1, { dataStream: 'X' }).serialize();
        const peerAfterRemove = TextX.transform(peer, edit, 'right');
        const afterBoth = Tools.deepClone(removed.body!);
        TextX.apply(afterBoth, peerAfterRemove);
        const inverse = (undo![1] as { e: ReturnType<TextX['serialize']> }).e;
        TextX.apply(afterBoth, TextX.transform(inverse, peerAfterRemove, 'left'));
        expect(afterBoth.dataStream).toBe(`\x1FX${value}\x1EAfter\r\n`);
        expect(afterBoth.customRanges).toEqual([{ ...original.body!.customRanges![0], endIndex: value.length + 2 }]);
    });

    it('composes identity edits with later typing and resolves concurrent identity conflicts', () => {
        const range = { startIndex: 0, endIndex: 4, rangeId: 'sdt', rangeType: CustomRangeType.SDT, properties: { kind: 'text', alias: 'Old' } };
        const original: IDocumentBody = { dataStream: 'Value\r\n', customRanges: [range] };
        const first = new TextX().updateCustomRanges([{ rangeId: 'sdt', range: { ...range, properties: { ...range.properties, alias: 'First' } } }]).serialize();
        const second = new TextX().updateCustomRanges([{ rangeId: 'sdt', range: { ...range, properties: { ...range.properties, alias: 'Second' } } }]).serialize();
        const removal = new TextX().updateCustomRanges([{ rangeId: 'sdt', range: null }]).serialize();
        const insert = new TextX().retain(2).insert(1, { dataStream: 'X' }).serialize();
        const legacy = new TextX().retain(5, { dataStream: '', customRanges: [{ ...range, properties: { kind: 'text', alias: 'Legacy' } }] }).serialize();
        for (const next of [second, removal, insert, legacy]) {
            const composed = Tools.deepClone(original);
            TextX.apply(composed, TextX.compose(first, next));
            const sequential = Tools.deepClone(original);
            TextX.apply(sequential, first);
            TextX.apply(sequential, next);
            expect(composed.dataStream).toBe(sequential.dataStream);
            expect(composed.customRanges).toEqual(sequential.customRanges);
            for (const priority of ['left', 'right'] as const) {
                const left = Tools.deepClone(original);
                const right = Tools.deepClone(original);
                TextX.apply(left, first);
                TextX.apply(left, TextX.transform(next, first, priority === 'left' ? 'right' : 'left'));
                TextX.apply(right, next);
                TextX.apply(right, TextX.transform(first, next, priority));
                expect(left.dataStream).toBe(right.dataStream);
                expect(left.customRanges).toEqual(right.customRanges);
            }
        }
        const reinsert = new TextX().insert(1, { dataStream: 'X', customRanges: [{ ...range, startIndex: 0, endIndex: 0 }] }).serialize();
        const sequential = Tools.deepClone(original);
        TextX.apply(sequential, removal);
        TextX.apply(sequential, reinsert);
        const composed = Tools.deepClone(original);
        TextX.apply(composed, TextX.compose(removal, reinsert));
        expect(composed.dataStream).toBe(sequential.dataStream);
        expect(composed.customRanges).toEqual(sequential.customRanges);
    });

    it('joins inserted SDT content with its surviving paragraph anchor', () => {
        const anchor = {
            startIndex: 1,
            endIndex: 1,
            rangeId: 'control',
            rangeType: CustomRangeType.SDT,
            properties: { kind: 'dropDownList', placement: 'block' },
        };
        const body: IDocumentBody = { dataStream: 'X\r\n', customRanges: [anchor] };
        TextX.apply(body, new TextX().retain(1).insert(3, {
            dataStream: 'New',
            customRanges: [{ ...anchor, startIndex: 0, endIndex: 2 }],
        }).serialize());
        expect(body.dataStream).toBe('XNew\r\n');
        expect(body.customRanges).toEqual([{ ...anchor, startIndex: 1, endIndex: 4 }]);
    });

    it('keeps soft page-break tokens anchored through UTF-16 insertion, undo, deletion and redo', () => {
        const body: IDocumentBody = { dataStream: 'A\fB\fC\fD', renderedPageBreaks: [1, 5] };
        const inserted = new TextX().retain(1).insert(2, { dataStream: '😀' }).serialize();
        TextX.makeInvertible(inserted, body);
        TextX.apply(body, inserted);
        expect(body.renderedPageBreaks).toEqual([3, 7]);
        expect(body.renderedPageBreaks?.map((offset) => body.dataStream[offset])).toEqual(['\f', '\f']);
        TextX.apply(body, TextX.invert(inserted));
        expect(body.dataStream).toBe('A\fB\fC\fD');
        expect(body.renderedPageBreaks).toEqual([1, 5]);

        const deleted = new TextX().retain(1).delete(4).serialize();
        TextX.makeInvertible(deleted, body);
        TextX.apply(body, deleted);
        expect(body.dataStream).toBe('A\fD');
        expect(body.renderedPageBreaks).toEqual([1]);
        TextX.apply(body, TextX.invert(deleted));
        expect(body.dataStream).toBe('A\fB\fC\fD');
        expect(body.renderedPageBreaks).toEqual([1, 5]);
        TextX.apply(body, deleted);
        expect(body.renderedPageBreaks).toEqual([1]);
    });

    it('preserves soft page breaks when an imported insert is split and composed with text formatting', () => {
        const source: IDocumentBody = { dataStream: 'A\fB\fC\fD', renderedPageBreaks: [1, 5] };
        const inserted = new TextX().insert(source.dataStream.length, source).serialize();
        const formatted = new TextX().retain(4, { dataStream: '', textRuns: [{ st: 0, ed: 4, ts: { bl: BooleanNumber.TRUE } }] }).serialize();
        const body: IDocumentBody = { dataStream: '' };
        TextX.apply(body, TextX.compose(inserted, formatted));
        expect(body.dataStream).toBe(source.dataStream);
        expect(body.renderedPageBreaks).toEqual([1, 5]);
        expect(source.renderedPageBreaks).toEqual([1, 5]);
    });

    it('keeps every enclosing field intact when editing a nested field result', () => {
        const start = DataStreamTreeTokenType.CUSTOM_RANGE_START;
        const end = DataStreamTreeTokenType.CUSTOM_RANGE_END;
        const body: IDocumentBody = {
            dataStream: `${start}A${start}1${end}\rB${end}\0`,
            customRanges: [
                {
                    startIndex: 0,
                    endIndex: 7,
                    rangeId: 'toc',
                    rangeType: CustomRangeType.FIELD,
                    wholeEntity: false,
                    properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3"' },
                },
                {
                    startIndex: 2,
                    endIndex: 4,
                    rangeId: 'page-ref',
                    rangeType: CustomRangeType.FIELD,
                    wholeEntity: false,
                    properties: { fieldType: 'PAGEREF', instruction: 'PAGEREF _Toc1 \\h' },
                },
            ],
        };

        TextX.apply(body, new TextX().retain(4).insert(1, { dataStream: '0' }).serialize());

        expect(body.dataStream).toBe(`${start}A${start}10${end}\rB${end}\0`);
        expect(body.customRanges).toMatchObject([
            { rangeId: 'toc', startIndex: 0, endIndex: 8 },
            { rangeId: 'page-ref', startIndex: 2, endIndex: 5 },
        ]);
    });

    it('keeps a nested SDT as one entity and expands it when typing inside', () => {
        const body: IDocumentBody = {
            dataStream: 'Accept: Value\r',
            customRanges: [{
                startIndex: 8,
                endIndex: 12,
                rangeId: 'sdt-text-1',
                rangeType: CustomRangeType.SDT,
                wholeEntity: false,
                properties: { kind: 'text', placement: 'inline' },
            }],
        };

        TextX.apply(body, new TextX().retain(10).insert(1, { dataStream: 'X' }).serialize());

        expect(body.dataStream).toBe('Accept: VaXlue\r');
        expect(body.customRanges).toMatchObject([{
            rangeId: 'sdt-text-1',
            startIndex: 8,
            endIndex: 13,
        }]);
    });

    it('converges concurrent edits inside one SDT without duplicating the wrapper', () => {
        const original: IDocumentBody = {
            dataStream: 'Accept: Value\r',
            customRanges: [{
                startIndex: 8,
                endIndex: 12,
                rangeId: 'sdt-text-1',
                rangeType: CustomRangeType.SDT,
                wholeEntity: false,
                properties: { kind: 'text', placement: 'inline' },
            }],
        };
        const left = new TextX().retain(10).insert(1, { dataStream: 'X' }).serialize();
        const right = new TextX().retain(11).insert(1, { dataStream: 'Y' }).serialize();
        const leftFirst = JSON.parse(JSON.stringify(original)) as IDocumentBody;
        const rightFirst = JSON.parse(JSON.stringify(original)) as IDocumentBody;

        TextX.apply(leftFirst, TextX.compose(left, TextX.transform(right, left, 'right')));
        TextX.apply(rightFirst, TextX.compose(right, TextX.transform(left, right, 'left')));

        expect(leftFirst).toEqual(rightFirst);
        expect(leftFirst.customRanges).toEqual([expect.objectContaining({
            rangeId: 'sdt-text-1',
            startIndex: 8,
            endIndex: 14,
        })]);
    });

    it('composes updates for multiple nested custom ranges by range id', () => {
        const ranges = [
            { startIndex: 0, endIndex: 7, rangeId: 'toc', rangeType: CustomRangeType.FIELD },
            { startIndex: 2, endIndex: 4, rangeId: 'page-ref', rangeType: CustomRangeType.FIELD },
        ];
        const result = composeBody(
            { dataStream: '', customRanges: ranges },
            {
                dataStream: '',
                customRanges: ranges.map((range) => ({ ...range, properties: { dirty: BooleanNumber.TRUE } })),
            },
            UpdateDocsAttributeType.COVER
        );

        expect(result.customRanges).toEqual(ranges.map((range) => ({
            ...range,
            properties: { dirty: BooleanNumber.TRUE },
        })));
    });

    it('updates metadata without splitting an SDT around structural tokens', () => {
        const body: IDocumentBody = {
            dataStream: 'X\x1Cdd mmm yyyy\r\n\x1D',
            customRanges: [{
                startIndex: 1,
                endIndex: 15,
                rangeId: 'date-cell',
                rangeType: CustomRangeType.SDT,
                wholeEntity: false,
                properties: { kind: 'date', placement: 'cell', showingPlaceholder: true },
            }],
        };
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
                properties: { kind: 'date', placement: 'cell', showingPlaceholder: false },
            }],
        }).serialize();

        TextX.apply(body, TextX.compose(replacement, metadata));

        expect(body.dataStream).toBe('X\x1C06 Sep 2026\r\n\x1D');
        expect(body.customRanges).toEqual([{
            startIndex: 1,
            endIndex: 15,
            rangeId: 'date-cell',
            rangeType: CustomRangeType.SDT,
            wholeEntity: false,
            properties: { kind: 'date', placement: 'cell', showingPlaceholder: false },
        }]);
    });

    describe('test TextX methods', () => {
        it('test TextX insert method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.insert(5, body);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.INSERT,
                    body,
                    len: 5,
                },
            ]);
        });

        it('test TextX delete method', () => {
            const textX = new TextX();

            textX.delete(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.DELETE,
                    len: 5,
                },
            ]);
        });

        it('test TextX retain method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.retain(5, body, UpdateDocsAttributeType.COVER);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    body,
                    len: 5,
                    coverType: UpdateDocsAttributeType.COVER,
                },
            ]);
        });

        it('test TextX push method and merge two delete actions', () => {
            const textX = new TextX();

            textX.delete(5);
            textX.delete(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.DELETE,
                    len: 10, // 5 + 5
                },
            ]);
        });

        it('test TextX push method and put insert action before delete action', () => {
            const textX = new TextX();

            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.delete(5);
            textX.insert(5, body);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.INSERT,
                    body,
                    len: 5,
                },
                {
                    t: TextXActionType.DELETE,
                    len: 5,
                },
            ]);
        });

        it('test TextX push method and merge two simple retain action', () => {
            const textX = new TextX();

            textX.retain(4);
            textX.retain(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    len: 9,
                },
            ]);
        });

        it('test TextX push method and with more than one params', () => {
            const textX = new TextX();

            textX.push({
                t: TextXActionType.RETAIN,
                len: 4,
            }, {
                t: TextXActionType.RETAIN,
                len: 5,
            });

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    len: 9,
                },
            ]);
        });

        it('test TextX push method and with more than one params and merge the last two actions', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.push({
                t: TextXActionType.RETAIN,
                len: 4,
            }, {
                t: TextXActionType.DELETE,
                len: 5,
            });

            textX.push({
                t: TextXActionType.INSERT,
                len: 5,
                body,
            });

            const actions = textX.serialize();

            expect(actions.length).toBe(3);
            expect(actions[0].t).toBe(TextXActionType.RETAIN);
            expect(actions[1].t).toBe(TextXActionType.INSERT);
            expect(actions[2].t).toBe(TextXActionType.DELETE);
        });
    });

    describe('test TextX static methods', () => {
        it('keeps paragraph identity when undoing text formatting on its ending character', () => {
            const body: IDocumentBody = {
                dataStream: 'G\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'kept', paragraphStyle: { spaceAbove: { v: 12 } } }],
                textRuns: [{ st: 0, ed: 2, ts: { cl: { rgb: '#ff0000' } } }],
            };
            const original = JSON.parse(JSON.stringify(body)) as IDocumentBody;
            const actions = new TextX().retain(1).retain(1, {
                dataStream: '',
                textRuns: [{ st: 0, ed: 1, ts: { cl: { rgb: '#008000' } } }],
            }).serialize();
            TextX.makeInvertible(actions, body);
            TextX.apply(body, actions);
            TextX.apply(body, TextX.invert(actions));
            expect(body).toMatchObject(original);
        });

        it.each([
            {
                name: 'column group',
                offset: 2,
                body: {
                    dataStream: '\x12\x13Field\r\n\x14\x15\r\n',
                    columnGroups: [{ columnGroupId: 'columns-1', startIndex: 0, endIndex: 10 }],
                },
            },
            {
                name: 'quote block',
                offset: 1,
                body: {
                    dataStream: '\x10Field\r\x11\r\n',
                    blockRanges: [{ blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 0, endIndex: 7 }],
                },
            },
        ])('does not clip an enclosing $name when undoing formatting', ({ body, offset }) => {
            const original = JSON.parse(JSON.stringify(body)) as IDocumentBody;
            const actions = new TextX().retain(offset).retain(3, {
                dataStream: '',
                textRuns: [{ st: 0, ed: 3, ts: { bl: BooleanNumber.TRUE } }],
            }).serialize();
            TextX.makeInvertible(actions, body);
            TextX.apply(body, actions);
            TextX.apply(body, TextX.invert(actions));

            expect(body.columnGroups).toEqual(original.columnGroups);
            expect(body.blockRanges).toEqual(original.blockRanges);
            expect(body.dataStream).toBe(original.dataStream);
        });

        it('still restores table metadata when the retain explicitly changes it', () => {
            const dataStream = '\x1A\x1B\x1CField\r\n\x1D\x0E\x0F\r\n';
            const table = { tableId: 'table-1', startIndex: 0, endIndex: dataStream.length - 2 };
            const body: IDocumentBody = { dataStream, tables: [table] };
            const actions = new TextX().retain(table.endIndex, {
                dataStream: '',
                tables: [{ ...table, tableId: 'table-2' }],
            }).serialize();
            TextX.makeInvertible(actions, body);
            TextX.apply(body, actions);
            TextX.apply(body, TextX.invert(actions));

            expect(body.tables).toEqual([table]);
        });

        it('keeps enclosing table metadata intact when undoing and redoing a comment inside a cell', () => {
            const dataStream = '\x1A\x1B\x1CField\r\n\x1D\x0E\x0F\r\n';
            const tables = [{ tableId: 'table-1', startIndex: 0, endIndex: dataStream.length - 2 }];
            const body: IDocumentBody = { dataStream, tables: [...tables], customDecorations: [] };
            const actions = new TextX().retain(3).retain(3, {
                dataStream: '',
                customDecorations: [{ id: 'comment-1', type: CustomDecorationType.COMMENT, startIndex: 0, endIndex: 2 }],
            }).serialize();
            TextX.makeInvertible(actions, body);
            TextX.apply(body, actions);
            const undoActions = TextX.invert(actions);
            TextX.makeInvertible(undoActions, body);
            TextX.apply(body, undoActions);

            expect(body.tables).toEqual(tables);
            expect(body.customDecorations).toEqual([]);
            const redoActions = TextX.invert(undoActions);
            TextX.apply(body, redoActions);
            expect(body.tables).toEqual(tables);
            expect(body.dataStream).toBe(dataStream);
            expect(body.customDecorations).toEqual([
                expect.objectContaining({ id: 'comment-1', startIndex: 3, endIndex: 5 }),
            ]);
        });

        it('test TextX isNoop method', () => {
            const textX = new TextX();

            expect(TextX.isNoop(textX.serialize())).toBe(true);

            textX.retain(4);
            textX.delete(5);

            expect(TextX.isNoop(textX.serialize())).toBe(false);
        });

        it('textX name should to be text-x', () => {
            expect(TextX.name).toBe('text-x');
        });
    });

    it.each([
        { kind: SpecialCharacterKind.NON_BREAKING_HYPHEN, character: '\u2011' },
        { kind: SpecialCharacterKind.OPTIONAL_HYPHEN, character: '\u00AD' },
        { kind: 'emSpace', character: '\u2003' },
        { kind: 'enSpace', character: '\u2002' },
    ])('moves, copies, deletes and restores a semantic character without changing adjacent literal text (%j)', ({ kind, character }) => {
        const source: IDocumentBody = { dataStream: `AB${character}CD\r\n`, customRanges: [{ rangeId: 'hyphen', rangeType: CustomRangeType.CUSTOM, wholeEntity: true, startIndex: 2, endIndex: 2, properties: { kind } }] };
        const insert = new TextX().retain(1).insert(1, { dataStream: 'X' }).serialize();
        TextX.makeInvertible(insert, source);
        const shifted = TextX.apply(Tools.deepClone(source), insert);
        expect(shifted.dataStream).toBe(`AXB${character}CD\r\n`);
        expect(shifted.customRanges![0]).toEqual({ ...source.customRanges![0], startIndex: 3, endIndex: 3 });
        const restoredInsert = TextX.apply(Tools.deepClone(shifted), TextX.invert(insert));
        expect(restoredInsert.dataStream).toBe(source.dataStream);
        expect(restoredInsert.customRanges).toEqual(source.customRanges);
        const copied = getBodySlice(source, 2, 3);
        const pasted = TextX.apply({ dataStream: 'Z\r\n' }, new TextX().insert(1, copied).serialize());
        expect(pasted.dataStream).toBe(`${character}Z\r\n`);
        expect(pasted.customRanges).toEqual([{ ...source.customRanges![0], startIndex: 0, endIndex: 0 }]);
        const remove = new TextX().retain(3).delete(1).serialize();
        TextX.makeInvertible(remove, shifted);
        const deleted = TextX.apply(Tools.deepClone(shifted), remove);
        expect(deleted.dataStream).toBe('AXBCD\r\n');
        expect(deleted.customRanges).toEqual([]);
        const restoredDelete = TextX.apply(deleted, TextX.invert(remove));
        expect(restoredDelete.dataStream).toBe(shifted.dataStream);
        expect(restoredDelete.customRanges).toEqual(shifted.customRanges);
    });

    it.each([CustomRangeType.FIELD, CustomRangeType.SDT, CustomRangeType.BOOKMARK])('does not duplicate an enclosing range when undoing text-only formatting (%s)', (rangeType) => {
        const source: IDocumentBody = {
            dataStream: '\u001FValue\u001E\r\n',
            textRuns: [{ st: 1, ed: 6, ts: { fs: 11 } }],
            customRanges: [{ rangeId: 'enclosing', rangeType, wholeEntity: false, startIndex: 0, endIndex: 6, properties: { instruction: 'REF target' } }],
        };
        const actions = new TextX()
            .retain(1)
            .retain(5, { dataStream: '', textRuns: [{ st: 0, ed: 5, ts: { it: BooleanNumber.TRUE } }] }, UpdateDocsAttributeType.REPLACE)
            .updateCustomRanges([{ rangeId: 'enclosing', range: { ...source.customRanges![0], properties: { dirty: BooleanNumber.FALSE } }, propertyPaths: [['dirty']] }])
            .serialize();
        TextX.makeInvertible(actions, source);
        const changed = TextX.apply(Tools.deepClone(source), actions);
        const restored = TextX.apply(changed, TextX.invert(actions));

        expect(restored.customRanges).toEqual(source.customRanges);
        expect(restored.dataStream).toBe(source.dataStream);
        expect(restored.textRuns).toEqual(source.textRuns);
    });

    it('keeps an absent run array absent when inserting an unformatted undo placeholder', () => {
        const body: IDocumentBody = { dataStream: 'AB\r\n' };
        const actions = new TextX().retain(1).insert(1, { dataStream: 'X', textRuns: [{ st: 0, ed: 1, ts: {} }] }).serialize();
        const result = TextX.apply(Tools.deepClone(body), actions);
        expect(result.dataStream).toBe('AXB\r\n');
        expect(result.textRuns).toBeUndefined();
    });

    it.each([undefined, []])('keeps inserted character formatting when the destination has no runs (%j)', (textRuns) => {
        const body: IDocumentBody = { dataStream: 'AB\r\n', textRuns };
        const actions = new TextX().retain(1).insert(1, { dataStream: 'X', textRuns: [{ st: 0, ed: 1, ts: { it: BooleanNumber.TRUE } }] }).serialize();
        const result = TextX.apply(Tools.deepClone(body), actions);
        expect(result.dataStream).toBe('AXB\r\n');
        expect(result.textRuns).toEqual([{ st: 1, ed: 2, ts: { it: BooleanNumber.TRUE } }]);
        expect(body).toEqual({ dataStream: 'AB\r\n', textRuns });
    });
});
