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
import { createDocumentPermissionPoint, DOCUMENT_UNIT_PERMISSION_ACTIONS, getDocumentEditTargetObjectIds, SetDocumentPermissionCommand } from '@univerjs/docs';
import { UnitAction, UnitObject } from '@univerjs/protocol';
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
            const seen = new Set<string>();
            for (const segmentId of segments) {
                const body = segmentId ? snapshot.headers?.[segmentId]?.body ?? snapshot.footers?.[segmentId]?.body : snapshot.body;
                for (const objectId of getDocumentEditTargetObjectIds(model, segmentId, { startOffset: 0, endOffset: body?.dataStream.length ?? 0 })) {
                    if (seen.has(objectId)) {
                        continue;
                    }
                    seen.add(objectId);
                    const point = createDocumentPermissionPoint(unitId, objectId, UnitAction.Edit);
                    const id = decodeURIComponent(objectId.split('/').pop() ?? '');
                    const paragraph = body?.paragraphs?.find((item) => item.paragraphId === id);
                    const name = paragraph ? body!.dataStream.slice(Math.max(0, paragraph.startIndex - 50), paragraph.startIndex).replace(/[\r\n]/g, ' ').trim() : '';
                    yield { target: { unitId, objectId, objectType: point.type }, name, commandId, exists: () => getDocumentEditTargetObjectIds(model, segmentId, { startOffset: 0, endOffset: Number.MAX_SAFE_INTEGER }).includes(objectId) };
                }
            }
        }
        return openObjectPermissionPanel(accessor, { unitId, target: { unitId, objectId: unitId, objectType: UnitObject.Document }, getTargets });
    },
};
