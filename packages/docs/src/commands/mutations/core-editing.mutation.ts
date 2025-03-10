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

import type { IMutation, IMutationCommonParams, JSONXActions, Nullable } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocStateChangeInfo } from '../../services/doc-state-emit.service';
import { CommandType, IUniverInstanceService, JSONX } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocSelectionManagerService } from '../../services/doc-selection-manager.service';
import { DocSkeletonManagerService } from '../../services/doc-skeleton-manager.service';
import { DocStateEmitService } from '../../services/doc-state-emit.service';

export interface IRichTextEditingMutationParams extends IMutationCommonParams {
    unitId: string;
    actions: JSONXActions;
    textRanges: Nullable<ITextRangeWithStyle[]>;
    segmentId?: string;
    prevTextRanges?: Nullable<ITextRangeWithStyle[]>;
    noNeedSetTextRange?: boolean;
    isCompositionEnd?: boolean;
    noHistory?: boolean;
    // Do you need to compose the undo and redo of history, and compose of the change states.
    debounce?: boolean;
    options?: { [key: string]: boolean };
    // Whether this mutation is from a sync operation.
    isSync?: boolean;
    isEditing?: boolean;
    syncer?: string;
}

const RichTextEditingMutationId = 'doc.mutation.rich-text-editing';

/**
 * The core mutator to change rich text actions. The execution result would be undo mutation params. Could be directly
 * send to undo redo service (will be used by the triggering command).
 */
export const RichTextEditingMutation: IMutation<IRichTextEditingMutationParams, IRichTextEditingMutationParams> = {
    id: RichTextEditingMutationId,

    type: CommandType.MUTATION,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor, params) => {
        const {
            unitId,
            segmentId = '',
            actions,
            textRanges,
            prevTextRanges,
            trigger,
            noHistory,
            isCompositionEnd,
            noNeedSetTextRange,
            debounce,
            isEditing = true,
            isSync,
            syncer,
        } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const docStateEmitService = accessor.get(DocStateEmitService);

        const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const documentViewModel = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService).getViewModel();
        if (documentDataModel == null || documentViewModel == null) {
            throw new Error(`DocumentDataModel or documentViewModel not found for unitId: ${unitId}`);
        }

        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const docRanges = docSelectionManagerService.getDocRanges() ?? [];

        // TODO: `disabled` is only used for read only demo, and will be removed in the future.
        const disabled = !!documentDataModel.getSnapshot().disabled;

        if (JSONX.isNoop(actions) || (actions && actions.length === 0) || disabled) {
            // The actions' length maybe 0 when the mutation is from collaborative editing.
            // The return result will not be used.
            return {
                unitId,
                actions: [],
                textRanges: docRanges,
            };
        }

        // Step 1: Update Doc Data Model.
        const undoActions = JSONX.invertWithDoc(actions, documentDataModel.getSnapshot());
        documentDataModel.apply(actions);

        // Step 2: Update Doc View Model.
        documentViewModel.reset(documentDataModel);
        // Step 3: Update cursor & selection.
        // Make sure update cursor & selection after doc skeleton is calculated.
        if (!noNeedSetTextRange && textRanges && trigger != null && !isSync) {
            queueMicrotask(() => {
                docSelectionManagerService.replaceDocRanges(textRanges, { unitId, subUnitId: unitId }, isEditing, params.options);
            });
        }

        // Step 4: Emit state change event.
        const changeState: IDocStateChangeInfo = {
            commandId: RichTextEditingMutationId,
            unitId,
            segmentId,
            trigger,
            noHistory,
            debounce,
            redoState: {
                actions,
                textRanges,
            },
            undoState: {
                actions: undoActions,
                textRanges: prevTextRanges ?? docRanges,
            },
            isCompositionEnd,
            isSync,
            syncer,
        };
        docStateEmitService.emitStateChangeInfo(changeState);

        return {
            unitId,
            actions: undoActions,
            textRanges: docRanges,
        };
    },
};
