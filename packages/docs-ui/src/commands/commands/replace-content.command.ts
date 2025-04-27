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

import type { DocumentDataModel, ICommand, IDocumentBody, IDocumentData, IMutationInfo, ITextRange, JSONXActions } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { BuildTextUtils, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, JSONX, TextX, TextXActionType, Tools, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getRichTextEditPath } from '../util';

export interface IReplaceSnapshotCommandParams {
    unitId: string;
    snapshot: IDocumentData;
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
    options: { [key: string]: boolean };
}

export const ReplaceSnapshotCommand: ICommand<IReplaceSnapshotCommandParams> = {
    id: 'doc.command-replace-snapshot',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor, params: IReplaceSnapshotCommandParams) => {
        const { unitId, snapshot, textRanges, segmentId = '', options } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const prevSnapshot = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getSnapshot();

        if (docDataModel == null || prevSnapshot == null) {
            return false;
        }

        const { body, tableSource, footers, headers, lists, drawings, drawingsOrder, documentStyle } = Tools.deepClone(snapshot);
        const {
            body: prevBody,
            tableSource: prevTableSource,
            footers: prevFooters,
            headers: prevHeaders,
            lists: prevLists,
            drawings: prevDrawings,
            drawingsOrder: prevDrawingsOrder,
            documentStyle: prevDocumentStyle,
        } = prevSnapshot;

        if (body == null || prevBody == null) {
            return false;
        }

        // Handle body is equal to previous prevBody, only set the text ranges.
        if (Tools.diffValue(body, prevBody) && textRanges) {
            docSelectionManagerService.replaceDocRanges(textRanges, {
                unitId,
                subUnitId: unitId,
            }, false);

            return true;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
            },
        };

        if (options) {
            doMutation.params.options = options;
        }

        const rawActions: JSONXActions = [];

        const jsonX = JSONX.getInstance();

        if (!Tools.diffValue(prevDocumentStyle, documentStyle)) {
            const actions = jsonX.replaceOp(['documentStyle'], prevDocumentStyle, documentStyle);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

        if (!Tools.diffValue(body, prevBody)) {
            const actions = jsonX.replaceOp(['body'], prevBody, body);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

        if (!Tools.diffValue(tableSource, prevTableSource)) {
            const actions = jsonX.replaceOp(['tableSource'], prevTableSource, tableSource);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

        if (!Tools.diffValue(footers, prevFooters)) {
            const actions = jsonX.replaceOp(['footers'], prevFooters, footers);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

        if (!Tools.diffValue(headers, prevHeaders)) {
            const actions = jsonX.replaceOp(['headers'], prevHeaders, headers);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

        if (!Tools.diffValue(lists, prevLists)) {
            const actions = jsonX.replaceOp(['lists'], prevLists, lists);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

        if (!Tools.diffValue(drawings, prevDrawings)) {
            const actions = jsonX.replaceOp(['drawings'], prevDrawings, drawings);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

        if (!Tools.diffValue(drawingsOrder, prevDrawingsOrder)) {
            const actions = jsonX.replaceOp(['drawingsOrder'], prevDrawingsOrder, drawingsOrder);
            if (actions != null) {
                rawActions.push(actions);
            }
        }

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

interface IReplaceContentCommandParams {
    unitId: string;
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    textRanges: ITextRangeWithStyle[];
    segmentId?: string;
    options: { [key: string]: boolean };
}

// Replace all content with new body, and reserve undo/redo stack.
/**
 * @deprecated please use ReplaceSnapshotCommand instead.
 */
export const ReplaceContentCommand: ICommand<IReplaceContentCommandParams> = {
    id: 'doc.command-replace-content',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IReplaceContentCommandParams) => {
        const { unitId, body, textRanges, segmentId = '', options } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const prevBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getSnapshot().body;

        if (docDataModel == null || prevBody == null) {
            return false;
        }

        const doMutation = getMutationParams(unitId, segmentId, docDataModel, prevBody, body);

        doMutation.params.textRanges = textRanges;
        if (options) {
            doMutation.params.options = options;
        }

        // Handle body is equal to prevBody.
        if (doMutation.params.actions == null && textRanges) {
            docSelectionManagerService.replaceDocRanges(textRanges, {
                unitId,
                subUnitId: unitId,
            }, false);

            return true;
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};

interface ICoverContentCommandParams {
    unitId: string;
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    segmentId?: string;
}

// Cover all content with new body, and clear undo/redo stack.
export const CoverContentCommand: ICommand<ICoverContentCommandParams> = {
    id: 'doc.command-cover-content',

    type: CommandType.COMMAND,

    handler: async (accessor, params: ICoverContentCommandParams) => {
        const { unitId, body, segmentId = '' } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const docDatModel = univerInstanceService.getUniverDocInstance(unitId);

        const prevBody = docDatModel?.getSnapshot().body;

        if (docDatModel == null || prevBody == null) {
            return false;
        }

        const doMutation = getMutationParams(unitId, segmentId, docDatModel, prevBody, body);

        // No need to set the cursor or selection.
        doMutation.params.noNeedSetTextRange = true;
        doMutation.params.noHistory = true;

        commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(
            doMutation.id,
            doMutation.params
        );

        undoRedoService.clearUndoRedo(unitId);

        return true;
    },
};

function getMutationActions(segmentId: string, docDatModel: DocumentDataModel, prevBody: IDocumentBody, body: IDocumentBody) {
    const textX = new TextX();
    const jsonX = JSONX.getInstance();

    const deleteLen = prevBody?.dataStream.length - 2;
    if (deleteLen > 0) {
        textX.push({
            t: TextXActionType.DELETE,
            len: deleteLen,
        });
    }

    if (body.dataStream.length > 0) {
        textX.push({
            t: TextXActionType.INSERT,
            body,
            len: body.dataStream.length,
        });
    }

    const path = getRichTextEditPath(docDatModel, segmentId);

    return jsonX.editOp(textX.serialize(), path);
}

function getMutationParams(unitId: string, segmentId: string, docDatModel: DocumentDataModel, prevBody: IDocumentBody, body: IDocumentBody) {
    const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
        id: RichTextEditingMutation.id,
        params: {
            unitId,
            actions: [],
            textRanges: [],
        },
    };

    const actions = getMutationActions(segmentId, docDatModel, prevBody, body);

    doMutation.params.actions = actions;

    return doMutation;
}

export interface IReplaceSelectionCommandParams {
    unitId: string;
    selection?: ITextRange;
    body: IDocumentBody; // Do not contain `\r\n` at the end.
    textRanges?: ITextRangeWithStyle[];
}

export const ReplaceSelectionCommand: ICommand<IReplaceSelectionCommandParams> = {
    id: 'doc.command.replace-selection',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const { unitId, body: insertBody, textRanges } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        if (!docDataModel) {
            return false;
        }

        const body = docDataModel.getBody();
        const selection = params.selection ?? docSelectionManagerService.getActiveTextRange();
        if (!selection || !body) {
            return false;
        }

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                debounce: true,
            },
        };

        const textX = new TextX();
        const jsonX = JSONX.getInstance();
        // delete
        textX.push(...BuildTextUtils.selection.delete([selection], body, 0, insertBody));
        doMutation.params.actions = jsonX.editOp(textX.serialize());
        return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    },
};

export const ReplaceTextRunsCommand: ICommand<IReplaceContentCommandParams> = {
    id: 'doc.command.replace-text-runs',
    type: CommandType.COMMAND,

    handler: (accessor, params: IReplaceContentCommandParams) => {
        const { unitId, body, textRanges, segmentId = '', options } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        // const docSelectionManagerService = accessor.get(DocSelectionManagerService);

        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        const prevBody = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getSnapshot().body;

        if (docDataModel == null || prevBody == null) {
            return false;
        }

        const textX = BuildTextUtils.selection.replaceTextRuns({
            doc: docDataModel,
            body,
            selection: {
                startOffset: 0,
                endOffset: prevBody.dataStream.length - 2,
                collapsed: false,
            },
        });

        if (!textX) {
            return false;
        }

        const doMutation = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                noHistory: true,
            } as IRichTextEditingMutationParams,
        };
        const jsonX = JSONX.getInstance();
        const path = getRichTextEditPath(docDataModel, segmentId);
        doMutation.params.actions = jsonX.editOp(textX.serialize(), path);
        doMutation.params.textRanges = textRanges;
        if (options) {
            doMutation.params.options = options;
        }

        const result = commandService.syncExecuteCommand(doMutation.id, doMutation.params);
        return Boolean(result);
    },
};
