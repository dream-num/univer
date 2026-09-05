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
import type { IObjectPermissionButtonProps } from '@univerjs/ui';
import { CommandType, isInternalEditorID, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DOCUMENT_UNIT_PERMISSION_ACTIONS, getDocumentSectionPermissionObjectId, SetDocumentPermissionCommand } from '@univerjs/docs';
import { UnitObject } from '@univerjs/protocol';
import { openObjectPermissionPanel } from '@univerjs/ui';

export const OpenDocPermissionPanelOperation: ICommand = {
    id: 'doc.operation.open-permission-panel',
    type: CommandType.OPERATION,
    handler(accessor) {
        const currentModel = accessor.get(IUniverInstanceService).getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!currentModel || isInternalEditorID(currentModel.getUnitId())) {
            return false;
        }
        const model = currentModel;
        const unitId = model.getUnitId();
        function* getTargets(): Iterable<IObjectPermissionButtonProps> {
            const snapshot = model.getSnapshot();
            const commandId = SetDocumentPermissionCommand.id;
            yield { target: { unitId, objectId: unitId, objectType: UnitObject.Document }, name: snapshot.title ?? '', commandId, actions: DOCUMENT_UNIT_PERMISSION_ACTIONS };
            const segments = new Set(['', ...Object.keys(snapshot.headers ?? {}), ...Object.keys(snapshot.footers ?? {})]);
            for (const segmentId of segments) {
                const body = segmentId ? snapshot.headers?.[segmentId]?.body ?? snapshot.footers?.[segmentId]?.body : snapshot.body;
                for (const section of body?.sectionBreaks ?? []) {
                    if (!section.sectionId) {
                        continue;
                    }
                    const objectId = getDocumentSectionPermissionObjectId(segmentId, section.sectionId);
                    yield {
                        target: { unitId, objectId, objectType: UnitObject.DocumentSection },
                        name: '',
                        commandId,
                        exists: () => model.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.sectionBreaks?.some((item) => item.sectionId === section.sectionId) === true,
                    };
                }
            }
        }
        return openObjectPermissionPanel(accessor, { unitId, target: { unitId, objectId: unitId, objectType: UnitObject.Document }, getTargets, expandable: UnitObject.DocumentSection });
    },
};
