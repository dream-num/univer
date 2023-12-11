/**
 * Copyright 2023-present DreamNum Inc.
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

import {
    CommandType,
    type DocMutationParams,
    type IMutation,
    IUniverInstanceService,
    MemoryCursor,
} from '@univerjs/core';

import { DocViewModelManagerService } from '../../services/doc-view-model-manager.service';

export interface IRichTextEditingMutationParams {
    unitId: string;
    mutations: DocMutationParams[];
}

/**
 * The core mutator to change rich text mutations. The execution result would be undo mutation params. Could be directly
 * send to undo redo service (will be used by the triggering command).
 */
export const RichTextEditingMutation: IMutation<IRichTextEditingMutationParams, IRichTextEditingMutationParams> = {
    id: 'doc.mutation.rich-text-editing',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, mutations } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);

        const docViewModelManagerService = accessor.get(DocViewModelManagerService);
        const documentViewModel = docViewModelManagerService.getViewModel(unitId);

        if (!documentDataModel) {
            throw new Error(`DocumentDataModel not found for unitId: ${unitId}`);
        }

        // Step 1: Update Doc View Model.
        const memoryCursor = new MemoryCursor();

        memoryCursor.reset();

        mutations.forEach((mutation) => {
            const { segmentId, len } = mutation;
            const segmentViewModel = documentViewModel?.getSelfOrHeaderFooterViewModel(segmentId)!;

            if (mutation.t === 'r') {
                const { len } = mutation;

                memoryCursor.moveCursor(len);
            } else if (mutation.t === 'i') {
                const { body } = mutation;

                if (body.dataStream.length > 1 && /\r/.test(body.dataStream)) {
                    // TODO: @JOCS, The DocumentViewModel needs to be rewritten to better support the
                    // large area of updates that are brought about by the paste, abstract the
                    // methods associated with the DocumentViewModel insertion, and support atomic operations
                    const segmentDocumentDataModel = documentDataModel.getSelfOrHeaderFooterModel(segmentId);

                    segmentViewModel.reset(segmentDocumentDataModel);
                } else {
                    segmentViewModel.insert(body, memoryCursor.cursor);
                }

                // this._insertApply(body!, len, memoryCursor.cursor, segmentId);
                memoryCursor.moveCursor(len);
            } else if (mutation.t === 'd') {
                segmentViewModel.delete(memoryCursor.cursor, len);
            } else {
                throw new Error(`Unknown mutation type for mutation: ${mutation}.`);
            }
        });

        // Step 2: Update Doc Data Model.
        const undoMutations = documentDataModel.apply(mutations);

        return {
            unitId,
            mutations: undoMutations,
        };
    },
};
