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

import type { DocumentDataModel, IExecutionOptions, IMutation, IMutationCommonParams, JSONXActions, Nullable, TPriority } from '@univerjs/core';
import type { DocumentViewModel, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocStateChangeInfo } from '../../services/doc-state-emit.service';
import {
    CommandType,

    IUniverInstanceService,
    JSONX,

    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocSelectionManagerService } from '../../services/doc-selection-manager.service';
import { DocSkeletonManagerService } from '../../services/doc-skeleton-manager.service';
import { DocStateEmitService } from '../../services/doc-state-emit.service';
import { RICH_TEXT_EDITING_MUTATION_ID } from './core-editing.mutation-id';
import { validateDocStructureMutation } from './doc-structure-mutation-validation';

export enum DocHistoryAction {
    DeleteChart = 'delete-chart',
    DeleteDivider = 'delete-divider',
    DeleteImage = 'delete-image',
    DeleteShape = 'delete-shape',
    EditTableCell = 'edit-table-cell',
    FormatParagraph = 'format-paragraph',
    InsertCustomRange = 'insert-custom-range',
    UpdateImage = 'update-image',
    UpdatePageLayout = 'update-page-layout',
}

export interface IRichTextEditingMutationParams extends IMutationCommonParams {
    unitId: string;
    historyAction?: string;
    historyActions?: string[];
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

function extractDocumentBodyActions(actions: JSONXActions, segmentId: string): Nullable<JSONXActions> {
    if (!Array.isArray(actions)) {
        return;
    }
    const bodyActions = actions.indexOf('body') > -1
        ? actions
        : actions.find((action) => Array.isArray(action) && action.indexOf('body') > -1);
    if (!Array.isArray(bodyActions)) {
        return;
    }

    const bodyIndex = bodyActions.indexOf('body');
    if (bodyIndex === -1) {
        return;
    }
    const actionSegmentId = bodyIndex === 0 ? '' : bodyActions[bodyIndex - 1];
    return actionSegmentId === segmentId ? bodyActions.slice(bodyIndex) : undefined;
}

/**
 * Transforms document selections through the same JSONX actions applied by a rich-text mutation.
 * Collaboration and rendering use this shared offset rule so the Main interaction window follows
 * the transformed local caret before an authoritative background layout is published.
 */
export function transformDocumentTextRanges(
    actions: JSONXActions,
    textRanges: ITextRangeWithStyle[],
    priority: TPriority = 'right'
): ITextRangeWithStyle[] {
    if (textRanges.length === 0) {
        return [];
    }

    const segmentId = textRanges[0].segmentId ?? '';

    const bodyActions = extractDocumentBodyActions(actions, segmentId);
    if (bodyActions == null) {
        return textRanges;
    }

    return textRanges.map((textRange) => {
        const startOffset = JSONX.transformPosition(bodyActions, textRange.startOffset, priority);
        const endOffset = JSONX.transformPosition(bodyActions, textRange.endOffset, priority);
        return {
            ...textRange,
            startOffset,
            endOffset,
            collapsed: startOffset === endOffset,
        };
    });
}

function applyValidatedDocumentActions(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    actions: JSONXActions
): { undoActions: JSONXActions; preservesStructure: boolean } {
    const undoActions = JSONX.invertWithDoc(actions, documentDataModel.getSnapshot());
    documentDataModel.apply(actions);
    try {
        return {
            undoActions,
            preservesStructure: validateDocStructureMutation(documentDataModel, segmentId, actions, undoActions),
        };
    } catch (error) {
        documentDataModel.apply(undoActions);
        throw error;
    }
}

function resetDocumentViewModel(
    documentViewModel: DocumentViewModel | null | undefined,
    documentDataModel: DocumentDataModel,
    segmentId: string,
    actions: JSONXActions,
    preservesStructure: boolean
): void {
    if (documentViewModel == null) {
        return;
    }
    const didResetIncrementally = segmentId === '' && preservesStructure && (
        documentViewModel.resetByValidatedTextMutation?.(documentDataModel, actions) ||
        documentViewModel.resetByValidatedMetadataMutation?.(documentDataModel, actions)
    );
    if (!didResetIncrementally) {
        documentViewModel.reset(documentDataModel);
    }
}

function scheduleDocumentSelectionUpdate(
    selectionManager: DocSelectionManagerService,
    params: IRichTextEditingMutationParams,
    isSync: boolean
): void {
    const { unitId, textRanges, trigger, noNeedSetTextRange, isEditing = true } = params;
    if (noNeedSetTextRange || textRanges == null || textRanges.length === 0 || trigger == null || isSync) {
        return;
    }
    queueMicrotask(() => {
        const selectionTarget = { unitId, subUnitId: unitId };
        const currentSelection = selectionManager.getSelectionInfo(selectionTarget);
        if (currentSelection == null) {
            selectionManager.replaceDocRanges(textRanges, selectionTarget, isEditing, params.options);
            return;
        }

        const logicalTextRanges = textRanges.map((textRange, index) => ({
            ...textRange,
            collapsed: textRange.startOffset === textRange.endOffset,
            isActive: index === textRanges.length - 1,
        }));

        // The logical range advances with the mutation even if its new physical
        // page has not been published yet. Keeping that intent in the model lets
        // the render layer retry the same caret after foreground pagination.
        selectionManager.replaceSelectionInfoWithoutRefresh({
            ...currentSelection,
            textRanges: logicalTextRanges,
            rectRanges: [],
            isEditing,
            options: params.options,
        }, selectionTarget);
        selectionManager.refreshSelection(selectionTarget, isEditing);
    });
}

/**
 * The core mutator to change rich text actions. The execution result would be undo mutation params. Could be directly
 * send to undo redo service (will be used by the triggering command).
 */
export const RichTextEditingMutation: IMutation<IRichTextEditingMutationParams, IRichTextEditingMutationParams> = {
    id: RICH_TEXT_EDITING_MUTATION_ID,

    type: CommandType.MUTATION,

    handler: (accessor, params, options?: IExecutionOptions) => {
        const {
            unitId,
            segmentId = '',
            actions,
            textRanges,
            prevTextRanges,
            trigger,
            noHistory,
            isCompositionEnd,
            debounce,
            isEditing = true,
            isSync: paramsIsSync,
            syncer,
        } = params;
        const isSync = Boolean(paramsIsSync || options?.fromCollab || options?.fromChangeset);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const docStateEmitService = accessor.get(DocStateEmitService);

        const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const documentViewModel = renderManagerService.getRenderUnitById(unitId)?.with(DocSkeletonManagerService).getViewModel();
        if (documentDataModel == null) {
            throw new Error(`DocumentDataModel not found for unitId: ${unitId}`);
        }

        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const docRanges = docSelectionManagerService.getDocRanges() ?? [];
        // Capture selection intent before applying actions so undo can restore structural selections.
        const selectionInfo = docSelectionManagerService.getSelectionInfo();

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

        const { undoActions, preservesStructure } = applyValidatedDocumentActions(
            documentDataModel,
            segmentId,
            actions
        );

        resetDocumentViewModel(documentViewModel, documentDataModel, segmentId, actions, preservesStructure);
        scheduleDocumentSelectionUpdate(docSelectionManagerService, params, isSync);

        // Step 4: Emit state change event.
        const changeState: IDocStateChangeInfo = {
            commandId: RICH_TEXT_EDITING_MUTATION_ID,
            unitId,
            segmentId,
            trigger,
            noHistory,
            debounce,
            redoState: {
                actions,
                textRanges,
                options: params.options,
                isEditing,
            },
            undoState: {
                actions: undoActions,
                textRanges: prevTextRanges ?? docRanges,
                options: selectionInfo?.options,
                isEditing: selectionInfo?.isEditing,
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
