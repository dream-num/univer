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

import type { DocumentDataModel, ICommand, IDocumentBody, ITextRange } from '@univerjs/core';
import type { IFindQuery, IReplaceAllResult } from '@univerjs/find-replace';
import {
    BuildTextUtils,
    CommandType,
    getRichTextEditPath,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    MemoryCursor,
    TextX,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { findDocRanges } from '../../controllers/utils';

export interface IDocsReplaceCommandParams {
    unitId: string;
    query: IFindQuery;
    replaceString: string;
    range?: ITextRange;
}

export const DocsReplaceCommand: ICommand<IDocsReplaceCommandParams, IReplaceAllResult> = {
    id: 'docs.command.replace',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) return { success: 0, failure: 0 };
        const instanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const doc = instanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        const body = doc?.getBody();
        if (!doc || !body) return { success: 0, failure: params.range ? 1 : 0 };

        const matches = findDocRanges(body, params.query, !!doc.getSnapshot().disabled);
        const candidates = params.range
            ? matches.filter((match) => match.startOffset === params.range!.startOffset && match.endOffset === params.range!.endOffset)
            : matches;
        const replaceable = candidates.filter((match) => match.replaceable);
        const failure = (params.range && candidates.length === 0 ? 1 : candidates.length) - replaceable.length;
        if (!replaceable.length) return { success: 0, failure };

        const textX = new TextX();
        const memoryCursor = new MemoryCursor();
        for (const match of replaceable) {
            const slice = doc.sliceBody(match.startOffset, match.endOffset);
            const insertBody: IDocumentBody | null = params.replaceString
                ? {
                    dataStream: params.replaceString,
                    textRuns: slice?.textRuns?.length
                        ? [{ ...slice.textRuns[0], st: 0, ed: params.replaceString.length }]
                        : undefined,
                    customRanges: slice?.customRanges?.length
                        ? [{ ...slice.customRanges[0], startIndex: 0, endIndex: params.replaceString.length - 1 }]
                        : undefined,
                }
                : null;
            textX.push(...BuildTextUtils.selection.delete([{
                startOffset: match.startOffset,
                endOffset: match.endOffset,
                collapsed: false,
            }], body, memoryCursor.cursor, insertBody, false));
            memoryCursor.moveCursorTo(match.endOffset);
        }

        const actions = JSONX.getInstance().editOp(textX.serialize(), getRichTextEditPath(doc));
        const result = commandService.syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: params.unitId,
            actions,
            textRanges: [],
        });
        return result
            ? { success: replaceable.length, failure }
            : { success: 0, failure: failure + replaceable.length };
    },
};
