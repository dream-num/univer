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

import type {
    DocumentDataModel,
    ICustomRange,
    IDocumentData,
    IExecutionOptions,
    IMutation,
    IMutationCommonParams,
    JSONXActions,
    Nullable,
    TextXAction,
    TPriority,
} from '@univerjs/core';
import type { DocumentViewModel, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocStateChangeInfo } from '../../services/doc-state-emit.service';
import {
    CommandType,
    CustomRangeType,
    IUniverInstanceService,
    JSON1,
    JSONX,
    TextX,
    TextXActionType,
    Tools,
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

function canRemoveFootnoteReference(actions: JSONXActions, references: ICustomRange[]): boolean {
    let canRemove = false;
    const cursor = JSON1.type.readCursor(actions);
    cursor.traverse(null, (component) => {
        const path = cursor.getPath();
        if (path.length === 0) {
            canRemove = true;
        }
        if (canRemove || path[0] !== 'body') {
            return;
        }
        if (path.length === 1 && component.et === TextX.id && Array.isArray(component.e)) {
            let offset = 0;
            for (const action of component.e as TextXAction[]) {
                if (action.t === TextXActionType.DELETE && references.some((reference) =>
                    offset <= reference.endIndex && offset + action.len > reference.startIndex
                )) {
                    canRemove = true;
                    return;
                }
                if (action.t === TextXActionType.RETAIN && action.body?.customRanges != null) {
                    canRemove = true;
                    return;
                }
                if (action.t !== TextXActionType.INSERT) {
                    offset += action.len;
                }
            }
        } else if (path.length === 1 || path[1] === 'customRanges' || path[1] === 'dataStream') {
            canRemove = true;
        }
    });
    return canRemove;
}

function includeFootnoteCleanup(before: IDocumentData, actions: JSONXActions): JSONXActions {
    if (!before.footnotes) {
        return actions;
    }
    const references = before.body?.customRanges?.filter((range) => range.rangeType === CustomRangeType.FOOTNOTE) ?? [];
    if (references.length === 0 || !canRemoveFootnoteReference(actions, references)) {
        return actions;
    }
    // TextX edits mutate their body. Isolate the cleanup preview, and only run it
    // for edits that can remove a reference; ordinary typing keeps the fast path.
    const after = JSONX.apply(Tools.deepClone(before), actions) as unknown as IDocumentData;
    const remaining = new Set(after.body?.customRanges?.filter((range) => range.rangeType === CustomRangeType.FOOTNOTE)
        .map((range) => range.properties?.footnoteId));
    let cleanup: JSONXActions = null;
    const previousIds = new Set(references.map((reference) => reference.properties?.footnoteId));
    for (const id of previousIds) {
        if (typeof id === 'string' && !remaining.has(id) && after.footnotes?.[id]) {
            cleanup = JSONX.compose(cleanup, JSONX.getInstance().removeOp(['footnotes', id], after.footnotes[id]));
        }
    }
    return JSONX.isNoop(cleanup) ? actions : JSONX.compose(actions, cleanup);
}

function applyValidatedDocumentActions(
    documentDataModel: DocumentDataModel,
    segmentId: string,
    actions: JSONXActions
): { actions: JSONXActions; undoActions: JSONXActions; preservesStructure: boolean } {
    const before = documentDataModel.getSnapshot();
    const appliedActions = includeFootnoteCleanup(before, actions);
    const undoActions = JSONX.invertWithDoc(appliedActions, before);
    documentDataModel.apply(appliedActions);
    try {
        return {
            actions: appliedActions,
            undoActions,
            preservesStructure: validateDocStructureMutation(documentDataModel, segmentId, appliedActions, undoActions),
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
    const selectionTarget = { unitId, subUnitId: unitId };
    const currentSelection = selectionManager.getSelectionInfo(selectionTarget);
    const logicalTextRanges = textRanges.map((textRange, index) => ({
        ...textRange,
        segmentId: textRange.segmentId ?? params.segmentId ?? '',
        collapsed: textRange.startOffset === textRange.endOffset,
        isActive: index === textRanges.length - 1,
    }));
    if (currentSelection != null) {
        // Advance logical intent with the mutation. Only its visual refresh is
        // deferred; a later input or pointer selection must supersede this one.
        selectionManager.replaceSelectionInfoWithoutRefresh({
            ...currentSelection,
            segmentId: logicalTextRanges[logicalTextRanges.length - 1].segmentId,
            textRanges: logicalTextRanges,
            rectRanges: [],
            isEditing,
            options: params.options,
        }, selectionTarget);
    }
    const updatedSelection = selectionManager.getSelectionInfo(selectionTarget);
    queueMicrotask(() => {
        if (selectionManager.getSelectionInfo(selectionTarget) !== updatedSelection) {
            return;
        }
        if (updatedSelection == null) {
            selectionManager.replaceDocRanges(logicalTextRanges, selectionTarget, isEditing, params.options);
        } else {
            selectionManager.refreshSelection(selectionTarget, isEditing);
        }
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

        const { actions: appliedActions, undoActions, preservesStructure } = applyValidatedDocumentActions(
            documentDataModel,
            segmentId,
            actions
        );

        // Publish reference deletion and note cleanup in the same deterministic mutation.
        params.actions = appliedActions;
        resetDocumentViewModel(documentViewModel, documentDataModel, segmentId, appliedActions, preservesStructure);
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
                actions: appliedActions,
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
