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

import type { DocumentDataModel, ICommand, IDocumentBody, IDocumentData, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { CommandType, getBodySliceForTextXAction, ICommandService, IUniverInstanceService, JSONX, TextX, Tools, UniverInstanceType } from '@univerjs/core';
import { DocBlockMoveValidatorService, RichTextEditingMutation } from '@univerjs/docs';

export interface IMoveDocBlockCommandParams {
    unitId?: string;
    sourceRange: {
        startOffset: number;
        endOffset: number;
    };
    targetOffset: number;
}

export interface IMoveDocBlockActionResult {
    nextDocumentData: IDocumentData;
    movedRange: {
        startOffset: number;
        endOffset: number;
    };
}

export interface IMoveDocBlockTextChange {
    movedRange: {
        startOffset: number;
        endOffset: number;
    };
    sourceRange: {
        startOffset: number;
        endOffset: number;
    };
    targetOffset: number;
}

const DOC_BLOCK_MOVE_BODY_PATCH_KEYS = [
    'paragraphs',
    'sectionBreaks',
    'tables',
    'columnGroups',
    'customBlocks',
    'blockRanges',
    'customRanges',
    'customDecorations',
    'textRuns',
] as const satisfies Array<keyof NonNullable<IDocumentData['body']>>;

export const MoveDocBlockCommand: ICommand<IMoveDocBlockCommandParams> = {
    id: 'doc.command.move-block',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const { unitId, sourceRange, targetOffset } = params;
        const doc = unitId
            ? univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)
            : univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

        if (!doc) {
            return false;
        }

        const previousDocumentData = doc.getSnapshot();
        const moveResult = buildMoveDocBlockActions({
            documentData: previousDocumentData,
            sourceRange,
            targetOffset,
        });
        const { nextDocumentData, movedRange } = accessor.get(DocBlockMoveValidatorService).transformMoveResult({
            unitId: doc.getUnitId(),
            sourceRange,
            targetOffset,
            previousDocumentData,
            result: moveResult,
        });
        const actions = buildReplaceDocumentBodyActions(previousDocumentData, nextDocumentData, {
            sourceRange,
            targetOffset,
            movedRange,
        });

        if (!actions) {
            return false;
        }

        const textRanges: ITextRangeWithStyle[] = [{
            startOffset: movedRange.startOffset,
            endOffset: movedRange.endOffset,
            collapsed: false,
        }];

        return Boolean(commandService.syncExecuteCommand<IRichTextEditingMutationParams>(RichTextEditingMutation.id, {
            unitId: doc.getUnitId(),
            actions,
            textRanges,
        }));
    },
};

export function buildMoveDocBlockActions(params: {
    documentData: IDocumentData;
    sourceRange: {
        startOffset: number;
        endOffset: number;
    };
    targetOffset: number;
}): IMoveDocBlockActionResult {
    const nextDocumentData = Tools.deepClone(params.documentData);
    const body = nextDocumentData.body;

    if (!body?.dataStream) {
        return {
            nextDocumentData,
            movedRange: params.sourceRange,
        };
    }

    const dataStreamLength = body.dataStream.length;
    const startOffset = clamp(params.sourceRange.startOffset, 0, dataStreamLength);
    const endOffset = clamp(params.sourceRange.endOffset, startOffset, dataStreamLength);
    const targetOffset = clamp(params.targetOffset, 0, dataStreamLength);

    if (startOffset === endOffset || (targetOffset >= startOffset && targetOffset <= endOffset)) {
        return {
            nextDocumentData,
            movedRange: {
                startOffset,
                endOffset,
            },
        };
    }

    const movingText = body.dataStream.slice(startOffset, endOffset);
    const moveLength = movingText.length;
    const insertOffset = targetOffset > endOffset ? targetOffset - moveLength : targetOffset;
    const withoutMovingText = body.dataStream.slice(0, startOffset) + body.dataStream.slice(endOffset);
    body.dataStream = withoutMovingText.slice(0, insertOffset) + movingText + withoutMovingText.slice(insertOffset);

    remapBodyIndexesAfterMove(body, startOffset, endOffset, targetOffset, insertOffset, moveLength);

    return {
        nextDocumentData,
        movedRange: {
            startOffset: insertOffset,
            endOffset: insertOffset + moveLength,
        },
    };
}

export function buildReplaceDocumentBodyActions(previousDocumentData: IDocumentData, nextDocumentData: IDocumentData, move?: IMoveDocBlockTextChange): JSONXActions | null {
    const jsonX = JSONX.getInstance();
    const previousBody = previousDocumentData.body;
    const nextBody = nextDocumentData.body;

    if (!previousBody || !nextBody) {
        return null;
    }

    const rawActions: JSONXActions[] = [];
    let intermediateDocumentData = Tools.deepClone(previousDocumentData);

    const moveTextAction = move ? buildMoveBodyTextAction(previousBody, nextBody, move) : null;
    if (moveTextAction) {
        rawActions.push(moveTextAction);
        intermediateDocumentData = JSONX.apply(intermediateDocumentData, moveTextAction) as unknown as IDocumentData;
    }

    const residualTextAction = buildSingleBodyTextChangeAction(intermediateDocumentData.body, nextBody);
    if (residualTextAction) {
        rawActions.push(residualTextAction);
        intermediateDocumentData = JSONX.apply(intermediateDocumentData, residualTextAction) as unknown as IDocumentData;
    }

    if (!moveTextAction) {
        collectBodyPatchActions(intermediateDocumentData.body, nextBody, rawActions);
    }

    return rawActions.reduce((acc, cur) => JSONX.compose(acc, cur), null as JSONXActions);
}

function buildMoveBodyTextAction(previousBody: IDocumentBody, nextBody: IDocumentBody, move: IMoveDocBlockTextChange): JSONXActions | null {
    const dataStreamLength = previousBody.dataStream.length;
    const startOffset = clamp(move.sourceRange.startOffset, 0, dataStreamLength);
    const endOffset = clamp(move.sourceRange.endOffset, startOffset, dataStreamLength);
    const targetOffset = clamp(move.targetOffset, 0, dataStreamLength);
    const moveLength = endOffset - startOffset;

    if (moveLength <= 0 || (targetOffset >= startOffset && targetOffset <= endOffset)) {
        return null;
    }

    const textX = new TextX();
    const insertOffset = move.movedRange.startOffset;
    const insertBody = getBodySliceForTextXAction(nextBody, insertOffset, insertOffset + moveLength, false);

    if (targetOffset < startOffset) {
        textX.retain(targetOffset);
        textX.insert(moveLength, insertBody);
        textX.retain(startOffset - targetOffset);
        textX.delete(moveLength);
    } else {
        textX.retain(startOffset);
        textX.delete(moveLength);
        textX.retain(targetOffset - endOffset);
        textX.insert(moveLength, insertBody);
    }

    return JSONX.getInstance().editOp(textX.serialize(), ['body']);
}

function buildSingleBodyTextChangeAction(previousBody: IDocumentBody | undefined, nextBody: IDocumentBody): JSONXActions | null {
    const textChange = getSingleDataStreamChange(previousBody?.dataStream, nextBody.dataStream);

    if (!textChange) {
        return null;
    }

    const textX = new TextX();
    textX.retain(textChange.start);
    if (textChange.insertLength > 0) {
        textX.insert(
            textChange.insertLength,
            getBodySliceForTextXAction(nextBody, textChange.start, textChange.start + textChange.insertLength, false)
        );
    }
    if (textChange.deleteLength > 0) {
        textX.delete(textChange.deleteLength);
    }

    return JSONX.getInstance().editOp(textX.serialize(), ['body']);
}

function getSingleDataStreamChange(previousDataStream: string | undefined, nextDataStream: string | undefined): { start: number; deleteLength: number; insertLength: number } | null {
    if (previousDataStream == null || nextDataStream == null || previousDataStream === nextDataStream) {
        return null;
    }

    let start = 0;
    while (
        start < previousDataStream.length &&
        start < nextDataStream.length &&
        previousDataStream[start] === nextDataStream[start]
    ) {
        start++;
    }

    let previousEnd = previousDataStream.length;
    let nextEnd = nextDataStream.length;
    while (
        previousEnd > start &&
        nextEnd > start &&
        previousDataStream[previousEnd - 1] === nextDataStream[nextEnd - 1]
    ) {
        previousEnd--;
        nextEnd--;
    }

    return {
        start,
        deleteLength: previousEnd - start,
        insertLength: nextEnd - start,
    };
}

function collectBodyPatchActions(previousBody: IDocumentBody | undefined, nextBody: IDocumentBody, actions: JSONXActions[]): void {
    for (const key of DOC_BLOCK_MOVE_BODY_PATCH_KEYS) {
        collectPatchActions(
            JSONX.getInstance(),
            ['body', key],
            previousBody?.[key],
            nextBody[key],
            actions
        );
    }
}

function collectPatchActions(
    jsonX: JSONX,
    path: (string | number)[],
    oldValue: unknown,
    newValue: unknown,
    actions: JSONXActions[]
): void {
    if (isEmptyArrayEquivalent(oldValue, newValue)) {
        return;
    }

    if (Tools.diffValue(oldValue, newValue)) {
        return;
    }

    if (oldValue == null) {
        actions.push(jsonX.insertOp(path, newValue));
        return;
    }

    if (newValue == null) {
        actions.push(jsonX.removeOp(path, oldValue));
        return;
    }

    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        collectArrayPatchActions(jsonX, path, oldValue, newValue, actions);
        return;
    }

    if (isPlainObject(oldValue) && isPlainObject(newValue)) {
        const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

        keys.forEach((key) => {
            collectPatchActions(
                jsonX,
                [...path, key],
                (oldValue as Record<string, unknown>)[key],
                (newValue as Record<string, unknown>)[key],
                actions
            );
        });
        return;
    }

    actions.push(jsonX.replaceOp(path, oldValue, newValue));
}

function collectArrayPatchActions(
    jsonX: JSONX,
    path: (string | number)[],
    oldItems: unknown[],
    newItems: unknown[],
    actions: JSONXActions[]
): void {
    if (oldItems.length === newItems.length) {
        oldItems.forEach((item, index) => collectPatchActions(jsonX, [...path, index], item, newItems[index], actions));
        return;
    }

    let prefix = 0;
    while (prefix < oldItems.length && prefix < newItems.length && Tools.diffValue(oldItems[prefix], newItems[prefix])) {
        prefix++;
    }

    let oldSuffix = oldItems.length - 1;
    let newSuffix = newItems.length - 1;
    while (oldSuffix >= prefix && newSuffix >= prefix && Tools.diffValue(oldItems[oldSuffix], newItems[newSuffix])) {
        oldSuffix--;
        newSuffix--;
    }

    for (let index = oldSuffix; index >= prefix; index--) {
        actions.push(jsonX.removeOp([...path, index], oldItems[index]));
    }

    for (let index = prefix; index <= newSuffix; index++) {
        actions.push(jsonX.insertOp([...path, index], newItems[index]));
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isEmptyArrayEquivalent(oldValue: unknown, newValue: unknown): boolean {
    return (
        (oldValue == null && Array.isArray(newValue) && newValue.length === 0) ||
        (newValue == null && Array.isArray(oldValue) && oldValue.length === 0)
    );
}

function remapBodyIndexesAfterMove(
    body: IDocumentBody,
    startOffset: number,
    endOffset: number,
    targetOffset: number,
    insertOffset: number,
    moveLength: number
) {
    body.paragraphs = body.paragraphs?.map((paragraph) => ({
        ...paragraph,
        startIndex: remapIndexAfterMove(paragraph.startIndex, startOffset, endOffset, targetOffset, insertOffset, moveLength),
    })).sort((left, right) => left.startIndex - right.startIndex);

    body.sectionBreaks = body.sectionBreaks?.map((sectionBreak) => ({
        ...sectionBreak,
        startIndex: remapIndexAfterMove(sectionBreak.startIndex, startOffset, endOffset, targetOffset, insertOffset, moveLength),
    })).sort((left, right) => left.startIndex - right.startIndex);

    body.customBlocks = body.customBlocks?.map((customBlock) => ({
        ...customBlock,
        startIndex: remapIndexAfterMove(customBlock.startIndex, startOffset, endOffset, targetOffset, insertOffset, moveLength),
    })).sort((left, right) => left.startIndex - right.startIndex);

    body.tables = body.tables?.map((table) => remapExclusiveRange(table, startOffset, endOffset, targetOffset, insertOffset, moveLength))
        .sort((left, right) => left.startIndex - right.startIndex);

    body.columnGroups = body.columnGroups?.map((columnGroup) => remapExclusiveRange(columnGroup, startOffset, endOffset, targetOffset, insertOffset, moveLength))
        .sort((left, right) => left.startIndex - right.startIndex);

    body.blockRanges = body.blockRanges?.map((blockRange) => remapInclusiveRange(blockRange, startOffset, endOffset, targetOffset, insertOffset, moveLength))
        .sort((left, right) => left.startIndex - right.startIndex);

    body.customRanges = body.customRanges?.map((customRange) => remapInclusiveRange(customRange, startOffset, endOffset, targetOffset, insertOffset, moveLength))
        .sort((left, right) => left.startIndex - right.startIndex);

    body.customDecorations = body.customDecorations?.map((customDecoration) => remapInclusiveRange(customDecoration, startOffset, endOffset, targetOffset, insertOffset, moveLength))
        .sort((left, right) => left.startIndex - right.startIndex);

    body.textRuns = body.textRuns?.map((textRun) => {
        const remapped = remapExclusiveRange({ startIndex: textRun.st, endIndex: textRun.ed }, startOffset, endOffset, targetOffset, insertOffset, moveLength);
        return {
            ...textRun,
            st: remapped.startIndex,
            ed: remapped.endIndex,
        };
    }).sort((left, right) => left.st - right.st);
}

function remapExclusiveRange<T extends { startIndex: number; endIndex: number }>(
    range: T,
    startOffset: number,
    endOffset: number,
    targetOffset: number,
    insertOffset: number,
    moveLength: number
): T {
    if (range.startIndex >= startOffset && range.endIndex <= endOffset) {
        return {
            ...range,
            startIndex: insertOffset + range.startIndex - startOffset,
            endIndex: insertOffset + range.endIndex - startOffset,
        };
    }

    return {
        ...range,
        startIndex: remapIndexAfterMove(range.startIndex, startOffset, endOffset, targetOffset, insertOffset, moveLength),
        endIndex: remapExclusiveEndIndexAfterMove(range.endIndex, startOffset, endOffset, targetOffset, insertOffset, moveLength),
    };
}

function remapInclusiveRange<T extends { startIndex: number; endIndex: number }>(
    range: T,
    startOffset: number,
    endOffset: number,
    targetOffset: number,
    insertOffset: number,
    moveLength: number
): T {
    if (range.startIndex >= startOffset && range.endIndex < endOffset) {
        return {
            ...range,
            startIndex: insertOffset + range.startIndex - startOffset,
            endIndex: insertOffset + range.endIndex - startOffset,
        };
    }

    return {
        ...range,
        startIndex: remapIndexAfterMove(range.startIndex, startOffset, endOffset, targetOffset, insertOffset, moveLength),
        endIndex: remapIndexAfterMove(range.endIndex, startOffset, endOffset, targetOffset, insertOffset, moveLength),
    };
}

function remapIndexAfterMove(index: number, startOffset: number, endOffset: number, targetOffset: number, insertOffset: number, moveLength: number): number {
    if (index >= startOffset && index < endOffset) {
        return insertOffset + index - startOffset;
    }

    if (targetOffset < startOffset && index >= targetOffset && index < startOffset) {
        return index + moveLength;
    }

    if (targetOffset > endOffset && index >= endOffset && index < targetOffset) {
        return index - moveLength;
    }

    return index;
}

function remapExclusiveEndIndexAfterMove(index: number, startOffset: number, endOffset: number, targetOffset: number, insertOffset: number, moveLength: number): number {
    if (index > startOffset && index <= endOffset) {
        return insertOffset + index - startOffset;
    }

    if (targetOffset > endOffset && index >= endOffset && index <= targetOffset) {
        return index - moveLength;
    }

    return remapIndexAfterMove(index, startOffset, endOffset, targetOffset, insertOffset, moveLength);
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
