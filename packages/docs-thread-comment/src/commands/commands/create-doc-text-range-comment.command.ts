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

import type { DocumentDataModel, IAccessor, ICommand, IMutation, IMutationInfo, ITextRangeParam, JSONXActions } from '@univerjs/core';
import type { IThreadComment, ThreadCommentContent } from '@univerjs/thread-comment';
import {
    BuildTextUtils,
    CommandType,
    CustomDecorationType,

    generateRandomId,

    ICommandService,

    IUniverInstanceService,
    JSONX,

    sequenceExecute,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import {
    AddCommentMutation,
    getDT,

    IThreadCommentDataSourceService,
    normalizeThreadCommentContent,

} from '@univerjs/thread-comment';
import { DEFAULT_DOC_SUBUNIT_ID } from '../../common/const';

export interface IAddDocTextRangeCommentParams {
    unitId: string;
    comment: IThreadComment;
    range: ITextRangeParam;
}

/** Parameters accepted by the document text-range Facade. */
export interface ICreateDocTextRangeCommentParams {
    unitId: string;
    range: ITextRangeParam;
    content: ThreadCommentContent;
    attachments?: string[];
    id?: string;
    threadId?: string;
    personId?: string;
    dateTime?: Date;
}

interface IValidTextRange extends ITextRangeParam {
    startOffset: number;
    endOffset: number;
}

export interface IPreparedDocTextRangeComment {
    comment: IThreadComment;
    commentMutation: IMutationInfo;
    decorationMutationParams: IDocCommentDecorationMutationParams;
}

export interface IDocCommentDecorationMutationParams {
    unitId: string;
    actions: JSONXActions;
    segmentId?: string;
}

/** Applies document comment decoration actions without render or selection services. */
export const AddDocCommentDecorationMutation: IMutation<
    IDocCommentDecorationMutationParams,
    IDocCommentDecorationMutationParams | false
> = {
    id: 'docs-thread-comment.mutation.add-decoration',
    type: CommandType.MUTATION,
    handler(accessor, params) {
        if (!params || JSONX.isNoop(params.actions)) {
            return false;
        }
        const document = accessor.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        if (!document) {
            return false;
        }
        const undoActions = JSONX.invertWithDoc(params.actions, document.getSnapshot());
        document.apply(params.actions);
        return { ...params, actions: undoActions };
    },
};

function getValidRange(accessor: IAccessor, unitId: string, range: ITextRangeParam): IValidTextRange | null {
    const { startOffset, endOffset } = range;
    if (!Number.isInteger(startOffset) || !Number.isInteger(endOffset) || startOffset < 0 || endOffset <= startOffset) {
        return null;
    }

    const document = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
    const body = document?.getSelfOrHeaderFooterModel(range.segmentId)?.getBody();
    if (!body || endOffset > body.dataStream.length) {
        return null;
    }

    return { ...range, startOffset, endOffset, collapsed: false };
}

/** Builds the model mutations shared by headless and UI document comment commands. */
export async function prepareDocTextRangeComment(
    accessor: IAccessor,
    params: IAddDocTextRangeCommentParams
): Promise<IPreparedDocTextRangeComment | null> {
    const range = getValidRange(accessor, params.unitId, params.range);
    if (!range) {
        return null;
    }

    const savedComment = await accessor.get(IThreadCommentDataSourceService).addComment(params.comment);
    const comment: IThreadComment = {
        ...params.comment,
        ...savedComment,
        unitId: params.unitId,
        subUnitId: DEFAULT_DOC_SUBUNIT_ID,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        segmentId: range.segmentId,
        collapsed: false,
    };
    const textX = BuildTextUtils.customDecoration.add({
        ranges: [range],
        id: comment.id,
        type: CustomDecorationType.COMMENT,
    });
    const decorationMutationParams: IDocCommentDecorationMutationParams = {
        unitId: params.unitId,
        actions: JSONX.getInstance().editOp(textX.serialize()),
        segmentId: range.segmentId,
    };

    return {
        comment,
        commentMutation: {
            id: AddCommentMutation.id,
            params: { unitId: params.unitId, subUnitId: DEFAULT_DOC_SUBUNIT_ID, comment },
        },
        decorationMutationParams,
    };
}

/**
 * Creates a root comment and document decoration for an explicit text range.
 * This model command is safe to execute without loading document UI packages.
 */
export const CreateDocTextRangeCommentCommand: ICommand<ICreateDocTextRangeCommentParams> = {
    id: 'docs.command.create-text-range-comment',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }

        const range = getValidRange(accessor, params.unitId, params.range);
        if (!range) {
            return false;
        }
        const document = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        const body = document?.getSelfOrHeaderFooterModel(range.segmentId)?.getBody();
        if (!body) {
            return false;
        }

        const id = params.id ?? generateRandomId();
        const comment: IThreadComment = {
            id,
            threadId: params.threadId ?? id,
            unitId: params.unitId,
            subUnitId: DEFAULT_DOC_SUBUNIT_ID,
            ref: BuildTextUtils.transform.getPlainText(body.dataStream.slice(range.startOffset, range.endOffset)),
            text: normalizeThreadCommentContent(params.content),
            attachments: params.attachments ?? [],
            dT: getDT(params.dateTime),
            personId: params.personId ?? accessor.get(UserManagerService).getCurrentUser().userID,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            segmentId: range.segmentId,
            collapsed: false,
        };
        const prepared = await prepareDocTextRangeComment(accessor, { unitId: params.unitId, range, comment });
        if (!prepared) {
            return false;
        }
        return (await sequenceExecute([
            prepared.commentMutation,
            { id: AddDocCommentDecorationMutation.id, params: prepared.decorationMutationParams },
        ], accessor.get(ICommandService))).result;
    },
};
