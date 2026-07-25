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

import type { DocumentDataModel, ICommand, SectionType } from '@univerjs/core';
import {
    CommandType,
    createSectionId,
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    InsertDocumentColumnBreakCommand,
    InsertDocumentSectionBreakCommand,
} from '@univerjs/docs';

export interface IInsertDocumentSectionBreakOperationParams {
    sectionType: SectionType;
}

function getCollapsedBodyOffset(selectionManager: DocSelectionManagerService): number | null {
    const range = selectionManager.getActiveTextRange();
    if (!range?.collapsed || range.segmentId || !Number.isInteger(range.startOffset)) {
        return null;
    }
    return range.startOffset;
}

export const InsertDocumentColumnBreakOperation: ICommand = {
    id: 'docs.operation.insert-column-break',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const instanceService = accessor.get(IUniverInstanceService);
        const selectionManager = accessor.get(DocSelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const document = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const offset = getCollapsedBodyOffset(selectionManager);
        if (!document || document.getDocumentStyle().documentFlavor !== DocumentFlavor.TRADITIONAL || offset == null) {
            return false;
        }
        return commandService.syncExecuteCommand(InsertDocumentColumnBreakCommand.id, {
            unitId: document.getUnitId(),
            offset,
        });
    },
};

export const InsertDocumentSectionBreakOperation: ICommand<IInsertDocumentSectionBreakOperationParams> = {
    id: 'docs.operation.insert-section-break',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const instanceService = accessor.get(IUniverInstanceService);
        const selectionManager = accessor.get(DocSelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const document = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const offset = getCollapsedBodyOffset(selectionManager);
        const body = document?.getBody();
        if (!document || !body || document.getDocumentStyle().documentFlavor !== DocumentFlavor.TRADITIONAL || offset == null) {
            return false;
        }

        const sectionId = createSectionId(new Set(body.sectionBreaks?.map((section) => section.sectionId)));
        return commandService.syncExecuteCommand(InsertDocumentSectionBreakCommand.id, {
            unitId: document.getUnitId(),
            offset,
            sectionId,
            nextSectionType: params.sectionType,
        });
    },
};
