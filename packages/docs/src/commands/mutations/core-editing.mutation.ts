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

import { CommandType, type DocMutationParams, type IMutation, IUniverInstanceService } from '@univerjs/core';

import { DocSkeletonManagerService } from '../..';
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

        const docSkeletonManagerService = accessor.get(DocSkeletonManagerService);
        const skeleton = docSkeletonManagerService.getSkeletonByUnitId(unitId)?.skeleton;

        if (documentDataModel == null || documentViewModel == null || skeleton == null) {
            throw new Error(`DocumentDataModel or documentViewModel or skeleton not found for unitId: ${unitId}`);
        }

        if (mutations.length === 0) {
            throw new Error(`Mutation's length should great than 0 when call RichTextEditingMutation`);
        }

        // Step 1: Update Doc Data Model.
        const undoMutations = documentDataModel.apply(mutations);

        // Step 2: Update Doc View Model.
        const { segmentId } = mutations[0];
        const segmentDocumentDataModel = documentDataModel.getSelfOrHeaderFooterModel(segmentId);
        const segmentViewModel = documentViewModel.getSelfOrHeaderFooterViewModel(segmentId);

        segmentViewModel.reset(segmentDocumentDataModel);

        skeleton.calculate();

        return {
            unitId,
            mutations: undoMutations,
        };
    },
};
