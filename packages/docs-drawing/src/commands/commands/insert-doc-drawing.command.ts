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

import type { DocumentDataModel, IAccessor, ICommand, IMutationInfo, ITextRangeParam } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing } from '../../services/doc-drawing.service';
import {
    BooleanNumber,
    BuildTextUtils,
    CommandType,
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    getContentInsertRange,
    normalizeTextRange,
    RichTextEditingMutation,
} from '@univerjs/docs';

export interface IInsertDocDrawingCommandParams {
    unitId: string;
    drawings: IDocDrawing[];
    textRange?: ITextRangeParam;
}

/**
 * The command to insert new drawings
 */
export const InsertDocDrawingCommand: ICommand = {
    id: 'doc.command.insert-doc-image',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params?: IInsertDocDrawingCommandParams) => {
        if (!params) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { unitId, drawings, textRange } = params;
        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentDataModel) {
            return false;
        }

        const resolvedTextRange = resolveDocDrawingInsertTextRange(accessor, unitId, textRange);

        if (!resolvedTextRange) {
            return false;
        }

        const { segmentId = '' } = resolvedTextRange;
        const body = documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

        if (!body) {
            return false;
        }

        const snapshot = documentDataModel.getSnapshot();
        const isHeaderFooter = !!snapshot.headers?.[segmentId] || !!snapshot.footers?.[segmentId];
        const targetDrawings = isHeaderFooter
            ? drawings.map((drawing) => ({
                ...drawing,
                isMultiTransform: BooleanNumber.TRUE,
                transforms: drawing.transforms ?? (drawing.transform ? [drawing.transform] : null),
            }))
            : drawings;
        const actions = BuildTextUtils.drawing.add({
            selection: resolvedTextRange,
            documentDataModel,
            drawings: targetDrawings,
        });

        if (!actions) {
            return false;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges: [],
            },
        };

        doMutation.params.actions = actions;

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

function resolveDocDrawingInsertTextRange(
    accessor: IAccessor,
    unitId: string,
    textRange?: ITextRangeParam
): ITextRangeParam | null {
    const activeTextRange = accessor.get(DocSelectionManagerService).getActiveTextRange();
    const explicitTextRange = textRange ? normalizeTextRange(textRange) : null;
    const contentInsertRange = explicitTextRange ?? getContentInsertRange(accessor, unitId);
    if (!contentInsertRange) {
        return activeTextRange ?? null;
    }

    return {
        ...activeTextRange,
        startOffset: contentInsertRange.startOffset,
        endOffset: contentInsertRange.endOffset,
        collapsed: contentInsertRange.startOffset === contentInsertRange.endOffset,
        segmentId: contentInsertRange.segmentId ?? activeTextRange?.segmentId ?? '',
    };
}
