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

import type { ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { CommandType, DataStreamTreeTokenType, ICommandService, IUniverInstanceService, JSONX, TextX, TextXActionType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getTextRunAtPosition } from '../../../basics/paragraph';
import { DocMenuStyleService } from '../../../services/doc-menu-style.service';
import { getCommandSkeleton, getRichTextEditPath } from '../../util';
import { generateParagraphs } from '../break-line.command';
import { genEmptyTable, genTableSource } from './table';

export const CreateDocTableCommandId = 'doc.command.create-table';

export interface ICreateDocTableCommandParams {
    rowCount: number;
    colCount: number;
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

        const activeRange = docSelectionManagerService.getActiveTextRange();
        if (activeRange == null) {
            return false;
        }
        const { segmentId, segmentPage } = activeRange;
        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody();
        if (docDataModel == null || body == null) {
            return false;
        }

        const unitId = docDataModel.getUnitId();
        const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);
        const skeleton = docSkeletonManagerService?.getSkeleton();

        if (skeleton == null) {
            return false;
        }
        const { startOffset } = activeRange;

        const paragraphs = body.paragraphs ?? [];
        const prevParagraph = paragraphs.find((p) => p.startIndex >= startOffset);
        const curGlyph = skeleton.findNodeByCharIndex(startOffset, segmentId, segmentPage);
        // const line = curGlyph?.parent?.parent;
        // const preGlyph = skeleton.findNodeByCharIndex(startOffset - 1, segmentId, segmentPage);
        // const isInParagraph = preGlyph && preGlyph.content !== '\r';

        if (curGlyph == null) {
            return false;
        }

        // Also need to create new paragraph when there is already a table in paragraph.
        // Always inert a paragraph before table.
        const needCreateParagraph = true; // isInParagraph || line.isBehindTable;

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

        textX.push({
            t: TextXActionType.INSERT,
            body: {
                dataStream: tableDataStream,
                paragraphs: tableParagraphs,
                sectionBreaks,
                textRuns: [{
                    ...curTextRun,
                    st: 0,
                    ed: tableDataStream.length,
                }],
                tables: [
                    {
                        startIndex: 0,
                        endIndex: tableDataStream.length,
                        tableId: tableSource.tableId,
                    },
                ],
            },
            len: tableDataStream.length,
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
