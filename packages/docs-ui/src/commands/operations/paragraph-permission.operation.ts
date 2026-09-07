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
import { CommandType, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { getDocumentParagraphPermissionObjectId, SetDocumentPermissionCommand } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UnitObject } from '@univerjs/protocol';

import { openObjectPermissionDialog } from '@univerjs/ui';
import { DocEventManagerService } from '../../services/doc-event-manager.service';

export const OpenDocParagraphPermissionOperation: ICommand = {
    id: 'doc.operation.open-paragraph-permission',
    type: CommandType.OPERATION,
    handler(accessor) {
        const model = accessor.get(IUniverInstanceService).getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const target = model && accessor.get(IRenderManagerService).getRenderUnitById(model.getUnitId())?.with(DocEventManagerService).contextMenuParagraph;
        if (!target) {
            return false;
        }
        const { unitId, segmentId, paragraphId } = target;
        const exists = () => accessor.get(IUniverInstanceService).getUnit<DocumentDataModel>(unitId)?.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.paragraphs?.some((item) => item.paragraphId === paragraphId) === true;
        if (!exists()) {
            return false;
        }
        return openObjectPermissionDialog(accessor, {
            target: { unitId, objectId: getDocumentParagraphPermissionObjectId(segmentId, paragraphId), objectType: UnitObject.DocumentParagraph },
            name: accessor.get(LocaleService).t('docs-ui.objectPermission.paragraph'),
            commandId: SetDocumentPermissionCommand.id,
            exists,
        });
    },
};
