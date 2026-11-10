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

import type { DocumentDataModel, ICommand } from '@univerjs/core';
import {
    CommandType,
    DocumentFlavor,
    getParagraphContentStartOffset,
    getRichTextEditPath,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    JSONX,
    TextX,
    TextXActionType,
    UniverInstanceType,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { DocumentViewModel } from '@univerjs/engine-render';
import { DocSelectionManagerService } from '../../services/doc-selection-manager.service';
import { canEditDocumentTargets } from '../../services/permission/document-permission';
import { getDocumentEditTargetObjectIds } from '../../services/permission/document-permission-resolver';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export interface ISetHeadingCollapsedCommandParams {
    unitId: string;
    paragraphId: string;
    collapsed: boolean;
}

export const SetHeadingCollapsedCommand: ICommand<ISetHeadingCollapsedCommandParams> = {
    id: 'doc.command.set-heading-collapsed',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params || typeof params.collapsed !== 'boolean') {
            return false;
        }
        const doc = accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        if (!doc || doc.getDisabled() || doc.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.MODERN) {
            return false;
        }
        const body = doc.getBody();
        const matches = body?.paragraphs?.filter((paragraph) => paragraph.paragraphId === params.paragraphId) ?? [];
        const paragraph = matches[0];
        if (!body || matches.length !== 1 || (paragraph.headingCollapsed === true) === params.collapsed) {
            return false;
        }
        const viewModel = new DocumentViewModel(doc);
        try {
            const section = viewModel.getHeadingSections().find((section) => section.paragraphId === params.paragraphId);
            if (!section || (params.collapsed && section.startOffset >= section.endOffset) || viewModel.getCollapsedHeadingAtOffset(paragraph.startIndex)) {
                return false;
            }
            const targets = getDocumentEditTargetObjectIds(doc, '', {
                startOffset: getParagraphContentStartOffset(body, paragraph),
                endOffset: paragraph.startIndex + 1,
            });
            if (!canEditDocumentTargets(accessor.get(IPermissionService), params.unitId, targets)) {
                return false;
            }
            const textX = new TextX();
            if (paragraph.startIndex > 0) {
                textX.push({ t: TextXActionType.RETAIN, len: paragraph.startIndex });
            }
            textX.push({
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    paragraphs: [{ paragraphId: paragraph.paragraphId, startIndex: 0, headingCollapsed: params.collapsed }],
                },
            });
            const actions = JSONX.getInstance().editOp(textX.serialize(), getRichTextEditPath(doc));
            const selectionService = accessor.get(DocSelectionManagerService);
            const selectionTarget = { unitId: params.unitId, subUnitId: params.unitId };
            const ranges = selectionService.getDocRanges(selectionTarget) ?? [];
            const hidesSelection = params.collapsed && !selectionService.getSelectionInfo(selectionTarget)?.segmentId && ranges.some((range) => !range.segmentId &&
                range.startOffset != null && range.endOffset != null &&
                range.endOffset >= section.startOffset && range.startOffset < section.endOffset);
            return Boolean(accessor.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: params.unitId,
                actions,
                textRanges: hidesSelection ? [{ startOffset: paragraph.startIndex, endOffset: paragraph.startIndex, collapsed: true }] : null,
                prevTextRanges: ranges,
                noNeedSetTextRange: !hidesSelection,
                isEditing: false,
                trigger: SetHeadingCollapsedCommand.id,
            }));
        } finally {
            viewModel.dispose();
        }
    },
};
