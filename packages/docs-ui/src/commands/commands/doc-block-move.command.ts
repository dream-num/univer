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
import { CommandType, ICommandService, IUniverInstanceService, JSONX, Tools, UniverInstanceType } from '@univerjs/core';
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

export const MoveDocBlockCommand: ICommand<IMoveDocBlockCommandParams> = {
    id: 'doc.command.move-block',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const doc = (params.unitId
            ? univerInstanceService.getUnit(params.unitId, UniverInstanceType.UNIVER_DOC)
            : univerInstanceService.getCurrentUniverDocInstance()) as DocumentDataModel | undefined;

        if (!doc) {
            return false;
        }

        const previousDocumentData = doc.getSnapshot();
        const moveResult = buildMoveDocBlockActions({
            documentData: previousDocumentData,
            sourceRange: params.sourceRange,
            targetOffset: params.targetOffset,
        });
        const { nextDocumentData, movedRange } = accessor.get(DocBlockMoveValidatorService).transformMoveResult({
            unitId: doc.getUnitId(),
            sourceRange: params.sourceRange,
            targetOffset: params.targetOffset,
            previousDocumentData,
            result: moveResult,
        });
        const actions = buildReplaceDocumentBodyActions(previousDocumentData, nextDocumentData);

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

function buildReplaceDocumentBodyActions(previousDocumentData: IDocumentData, nextDocumentData: IDocumentData): JSONXActions | null {
    const jsonX = JSONX.getInstance();
    const previousBody = previousDocumentData.body;
    const nextBody = nextDocumentData.body;

    if (!previousBody || !nextBody) {
        return null;
    }

    const rawActions = [
        jsonX.replaceOp(['body', 'dataStream'], previousBody.dataStream, nextBody.dataStream),
        jsonX.replaceOp(['body', 'paragraphs'], previousBody.paragraphs, nextBody.paragraphs),
        jsonX.replaceOp(['body', 'sectionBreaks'], previousBody.sectionBreaks, nextBody.sectionBreaks),
        jsonX.replaceOp(['body', 'tables'], previousBody.tables, nextBody.tables),
        jsonX.replaceOp(['body', 'columnGroups'], previousBody.columnGroups, nextBody.columnGroups),
        jsonX.replaceOp(['body', 'customBlocks'], previousBody.customBlocks, nextBody.customBlocks),
        jsonX.replaceOp(['body', 'blockRanges'], previousBody.blockRanges, nextBody.blockRanges),
        jsonX.replaceOp(['body', 'customRanges'], previousBody.customRanges, nextBody.customRanges),
        jsonX.replaceOp(['body', 'customDecorations'], previousBody.customDecorations, nextBody.customDecorations),
        jsonX.replaceOp(['body', 'textRuns'], previousBody.textRuns, nextBody.textRuns),
    ].filter(Boolean) as JSONXActions[];

    return rawActions.reduce((acc, cur) => JSONX.compose(acc, cur), null as JSONXActions);
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
