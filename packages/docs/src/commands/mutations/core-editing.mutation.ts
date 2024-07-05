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

import { CommandType, IUniverInstanceService, JSONX } from '@univerjs/core';
import type { IMutation, IMutationCommonParams, JSONXActions, Nullable } from '@univerjs/core';
import { IRenderManagerService, type ITextRangeWithStyle } from '@univerjs/engine-render';
import { serializeTextRange, TextSelectionManagerService } from '../../services/text-selection-manager.service';
import type { IDocStateChangeParams } from '../../services/doc-state-change-manager.service';
import { DocStateChangeManagerService } from '../../services/doc-state-change-manager.service';
import { IMEInputManagerService } from '../../services/ime-input-manager.service';
import { DocSkeletonManagerService } from '../../services/doc-skeleton-manager.service';

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
        } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);

        const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const documentViewModel = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService).getViewModel();
        if (documentDataModel == null || documentViewModel == null) {
            throw new Error(`DocumentDataModel or documentViewModel not found for unitId: ${unitId}`);
        }

        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const selections = textSelectionManagerService.getSelections() ?? [];

        const serializedSelections = selections.map(serializeTextRange);

        const docStateChangeManagerService = accessor.get(DocStateChangeManagerService);

        const imeInputManagerService = accessor.get(IMEInputManagerService);

        // TODO: `disabled` is only used for read only demo, and will be removed in the future.
        const disabled = !!documentDataModel.getSnapshot().disabled;

        if (JSONX.isNoop(actions) || (actions && actions.length === 0) || disabled) {
            // The actions' length maybe 0 when the mutation is from collaborative editing.
            // The return result will not be used.
            return {
                unitId,
                actions: [],
                textRanges: serializedSelections,
            };
        }

        // console.log(params);
        // console.log('redoActions', actions);

        // Step 1: Update Doc Data Model.
        const undoActions = JSONX.invertWithDoc(actions, documentDataModel.getSnapshot());
        // console.log('undoActions', undoActions);
        documentDataModel.apply(actions);

        // console.log('trigger', trigger);
        // console.log(documentDataModel);

        // Step 2: Update Doc View Model.
        documentViewModel.reset(documentDataModel);

        // Step 3: Update cursor & selection.
        // Make sure update cursor & selection after doc skeleton is calculated.
        if (!noNeedSetTextRange && textRanges && trigger != null) {
            queueMicrotask(() => {
                textSelectionManagerService.replaceTextRanges(textRanges);
            });
        }

        // Step 4: Emit state change event.
        const changeState: IDocStateChangeParams = {
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
                textRanges: prevTextRanges ?? serializedSelections,
            },
        };

        // Handle IME input.
        if (isCompositionEnd) {
            const historyParams = imeInputManagerService.fetchComposedUndoRedoMutationParams();

            if (historyParams == null) {
                throw new Error('historyParams is null in RichTextEditingMutation');
            }

            const { undoMutationParams, redoMutationParams, previousActiveRange } = historyParams;
            changeState.redoState.actions = redoMutationParams.actions;
            changeState.undoState.actions = undoMutationParams.actions;
            changeState.undoState.textRanges = [previousActiveRange];
        }

        docStateChangeManagerService.setChangeState(changeState);

        return {
            unitId,
            actions: undoActions,
            textRanges: serializedSelections,
        };
    },
};
