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

import type { DocumentDataModel, ICommand, IDocumentBody, IMutationInfo, IParagraph, ISectionBreak, ITextRun, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { CommandType, containsInteriorInsertionOffset, createParagraphId, DataStreamTreeTokenType, getBlockRangeInterval, getParagraphContentStartOffset, getRichTextEditPath, getTableRangeInterval, ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType, UniverInstanceType } from '@univerjs/core';
import { DocContentInsertService, DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getTextRunAtPosition } from '../../../basics/paragraph';
import { DocMenuStyleService } from '../../../services/doc-menu-style.service';
import { getCommandSkeleton } from '../../util';
import { generateParagraphs } from '../break-line.command';
import { genEmptyTable, genTableSource } from './table';

export const CreateDocTableCommandId = 'doc.command.create-table';

export interface ICreateDocTableCommandParams {
    rowCount: number;
    colCount: number;
}

export interface IDocTableInsertBodyParams {
    tableDataStream: string;
    tableParagraphs: IParagraph[];
    sectionBreaks: ISectionBreak[];
    tableId: string;
    textRun: ITextRun;
    existingParagraphIds?: Set<string>;
}

export function buildDocTableInsertBody(params: IDocTableInsertBodyParams) {
    const { tableDataStream, tableParagraphs, sectionBreaks, tableId, textRun } = params;
    const existingParagraphIds = params.existingParagraphIds ?? new Set(tableParagraphs.map((paragraph) => paragraph.paragraphId));
    const dataStream = `${tableDataStream}${DataStreamTreeTokenType.PARAGRAPH}`;
    const tableEnd = tableDataStream.length;

    return {
        dataStream,
        paragraphs: [
            ...tableParagraphs,
            {
                startIndex: tableEnd,
                paragraphId: createParagraphId(existingParagraphIds),
            },
        ],
        sectionBreaks,
        textRuns: [{
            ...textRun,
            st: 0,
            ed: tableEnd,
        }],
        tables: [{
            startIndex: 0,
            endIndex: tableEnd,
            tableId,
        }],
    };
}

export function shouldCreateParagraphBeforeTable(body: { dataStream: string }, startOffset: number): boolean {
    return startOffset <= 0 || body.dataStream[startOffset - 1] !== DataStreamTreeTokenType.PARAGRAPH;
}

export function normalizeTableInsertOffset(body: { dataStream: string }, startOffset: number): number {
    return startOffset === 0 && body.dataStream[0] === DataStreamTreeTokenType.PARAGRAPH ? 1 : startOffset;
}

export function canInsertTableAtOffset(body: Pick<IDocumentBody, 'tables' | 'blockRanges' | 'customBlocks'>, offset: number): boolean {
    return !(
        isOffsetInTableRange(body.tables, offset) ||
        isOffsetInIndexRange(body.blockRanges, offset) ||
        isOffsetOnPointRange(body.customBlocks, offset)
    );
}

function isOffsetInTableRange(ranges: Array<{ startIndex: number; endIndex: number }> | undefined, offset: number): boolean {
    return Boolean(ranges?.some((range) => containsInteriorInsertionOffset(getTableRangeInterval(range), offset)));
}

function isOffsetInIndexRange(ranges: Array<{ startIndex: number; endIndex: number }> | undefined, offset: number): boolean {
    return Boolean(ranges?.some((range) => containsInteriorInsertionOffset(getBlockRangeInterval(range), offset)));
}

function isOffsetOnPointRange(ranges: Array<{ startIndex: number }> | undefined, offset: number): boolean {
    return Boolean(ranges?.some((range) => range.startIndex === offset));
}

/**
 * The command to create a table at cursor point.
 */
export const CreateDocTableCommand: ICommand<ICreateDocTableCommandParams> = {
    id: CreateDocTableCommandId,
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params: ICreateDocTableCommandParams) => {
        const { rowCount, colCount } = params;
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docMenuStyleService = accessor.get(DocMenuStyleService);

        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (docDataModel == null) {
            return false;
        }
        let contentInsertRange: ReturnType<DocContentInsertService['consumeInsertRange']> = null;
        try {
            contentInsertRange = accessor.get(DocContentInsertService).consumeInsertRange(docDataModel.getUnitId());
        } catch {
            contentInsertRange = null;
        }

        const activeRange = docSelectionManagerService.getActiveTextRange();
        if (activeRange == null && contentInsertRange == null) {
            return false;
        }
        const segmentId = contentInsertRange?.segmentId ?? activeRange?.segmentId ?? '';
        const segmentPage = activeRange?.segmentPage;
        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (body == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();
        const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);
        const skeleton = docSkeletonManagerService?.getSkeleton();

        if (skeleton == null) {
            return false;
        }
        const startOffset = normalizeTableInsertOffset(body, contentInsertRange?.startOffset ?? activeRange!.startOffset);
        if (!canInsertTableAtOffset(body, startOffset)) {
            return false;
        }

        const paragraphs = body.paragraphs ?? [];
        const prevParagraph = paragraphs.find((paragraph) => {
            const paragraphStartOffset = getParagraphContentStartOffset(body, paragraph);
            return paragraphStartOffset < startOffset && startOffset <= paragraph.startIndex;
        });
        const curGlyph = skeleton.findNodeByCharIndex(startOffset, segmentId, segmentPage);
        // const line = curGlyph?.parent?.parent;
        // const preGlyph = skeleton.findNodeByCharIndex(startOffset - 1, segmentId, segmentPage);
        // const isInParagraph = preGlyph && preGlyph.content !== '\r';

        if (curGlyph == null) {
            return false;
        }

        const needCreateParagraph = shouldCreateParagraphBeforeTable(body, startOffset);

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        // 4 is cal by `\r + TableStart + RowStart + CellStart`, 3 is cal by `TableStart + RowStart + CellStart`.
        const cursor = startOffset + (needCreateParagraph ? 4 : 3);
        const textRanges: ITextRangeWithStyle[] = [{
            startOffset: cursor,
            endOffset: cursor,
            collapsed: true,
        }];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        // Step 1: Break lines if necessary.
        if (startOffset > 0) {
            textX.push({
                t: TextXActionType.RETAIN,
                len: startOffset,
            });
        }

        // Insert a paragraph before table.
        if (needCreateParagraph) {
            textX.push({
                t: TextXActionType.INSERT,
                body: {
                    dataStream: DataStreamTreeTokenType.PARAGRAPH,
                    paragraphs: generateParagraphs(DataStreamTreeTokenType.PARAGRAPH, prevParagraph),
                },
                len: 1,
            });
        }

        // Step 2: Insert table.
        const defaultTextStyle = docMenuStyleService.getDefaultStyle();
        const styleCache = docMenuStyleService.getStyleCache();
        const curTextRun = getTextRunAtPosition(
            body,
            startOffset,
            defaultTextStyle,
            styleCache
        );
        const { dataStream: tableDataStream, paragraphs: tableParagraphs, sectionBreaks } = genEmptyTable(rowCount, colCount);
        const page = curGlyph.parent?.parent?.parent?.parent?.parent;
        if (page == null) {
            return false;
        }
        const { pageWidth, marginLeft, marginRight } = page;
        const tableSource = genTableSource(rowCount, colCount, pageWidth - marginLeft - marginRight);
        const tableInsertBody = buildDocTableInsertBody({
            tableDataStream,
            tableParagraphs,
            sectionBreaks,
            tableId: tableSource.tableId,
            textRun: curTextRun,
            existingParagraphIds: new Set(body.paragraphs?.map((paragraph) => paragraph.paragraphId)),
        });

        textX.push({
            t: TextXActionType.INSERT,
            body: tableInsertBody,
            len: tableInsertBody.dataStream.length,
        });

        const path = getRichTextEditPath(docDataModel, segmentId);
        rawActions.push(jsonX.editOp(textX.serialize(), path)!);

        // Step 3: Insert table source;
        const insertTableSource = jsonX.insertOp(['tableSource', tableSource.tableId], tableSource);
        rawActions.push(insertTableSource!);

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
