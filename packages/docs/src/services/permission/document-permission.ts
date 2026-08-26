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

import type { IPermissionService } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { DocumentCommentPermission } from './permission-point/document/comment';
import { DocumentCopyPermission } from './permission-point/document/copy';
import { DocumentEditablePermission } from './permission-point/document/editable';
import { DocumentExportPermission } from './permission-point/document/export';
import { DocumentPrintPermission } from './permission-point/document/print';
import { DocumentEntityEditPermission } from './permission-point/entity/edit';
import { DocumentParagraphEditPermission } from './permission-point/paragraph/edit';
import { DocumentSectionEditPermission } from './permission-point/section/edit';

export const DOCUMENT_UNIT_PERMISSION_ACTIONS = [
    UnitAction.Edit,
    UnitAction.Copy,
    UnitAction.Print,
    UnitAction.Export,
    UnitAction.Comment,
] as const;

export type DocumentUnitPermissionAction = typeof DOCUMENT_UNIT_PERMISSION_ACTIONS[number];

const DOCUMENT_PERMISSION_OBJECT_TYPES = new Set([
    UnitObject.Document,
    UnitObject.DocumentSection,
    UnitObject.DocumentParagraph,
    UnitObject.DocumentEntity,
]);

export function getDocumentSectionPermissionObjectId(segmentId: string, sectionId: string): string {
    return `section/${encodeURIComponent(segmentId)}/${encodeURIComponent(sectionId)}`;
}

export function getDocumentParagraphPermissionObjectId(segmentId: string, paragraphId: string): string {
    return `paragraph/${encodeURIComponent(segmentId)}/${encodeURIComponent(paragraphId)}`;
}

export function getDocumentEntityPermissionObjectId(
    segmentId: string,
    entityType: string,
    entityId: string
): string {
    return `entity/${encodeURIComponent(segmentId)}/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`;
}

export function createDocumentPermissionPoint(
    unitId: string,
    objectId: string,
    action: UnitAction
) {
    if (objectId === unitId) {
        switch (action) {
            case UnitAction.Edit:
                return new DocumentEditablePermission(unitId);
            case UnitAction.Copy:
                return new DocumentCopyPermission(unitId);
            case UnitAction.Print:
                return new DocumentPrintPermission(unitId);
            case UnitAction.Export:
                return new DocumentExportPermission(unitId);
            case UnitAction.Comment:
                return new DocumentCommentPermission(unitId);
            default:
                throw new Error(`Unsupported Document permission action: ${action}`);
        }
    }

    if (action !== UnitAction.Edit) {
        throw new Error(`Document object permissions only support Edit: ${objectId}`);
    }
    if (objectId.startsWith('section/')) {
        return new DocumentSectionEditPermission(unitId, objectId);
    }
    if (objectId.startsWith('paragraph/')) {
        return new DocumentParagraphEditPermission(unitId, objectId);
    }
    if (objectId.startsWith('entity/')) {
        return new DocumentEntityEditPermission(unitId, objectId);
    }
    throw new Error(`Unsupported Document permission object: ${objectId}`);
}

export function getDocumentPermissionValue(
    permissionService: IPermissionService,
    unitId: string,
    objectId: string,
    action: UnitAction
): boolean {
    return permissionService.getPermissionPoint(createDocumentPermissionPoint(unitId, objectId, action).id)?.value ?? true;
}

export function setDocumentPermissionValue(
    permissionService: IPermissionService,
    unitId: string,
    objectId: string,
    action: UnitAction,
    value: boolean
): void {
    const point = createDocumentPermissionPoint(unitId, objectId, action);
    if (!permissionService.getPermissionPoint(point.id)) {
        permissionService.addPermissionPoint(point);
    }
    permissionService.updatePermissionPoint(point.id, value);
}

export function clearDocumentPermissionValuesForUnit(
    permissionService: IPermissionService,
    unitId: string
): void {
    permissionService.getAllPermissionPoint().forEach((point$, id) => {
        const subscription = point$.subscribe((point) => {
            if (DOCUMENT_PERMISSION_OBJECT_TYPES.has(point.type) && 'unitId' in point && point.unitId === unitId) {
                permissionService.deletePermissionPoint(id);
            }
        });
        subscription.unsubscribe();
    });
}

export function canEditDocumentTargets(
    permissionService: IPermissionService,
    unitId: string,
    objectIds: Iterable<string>
): boolean {
    if (!getDocumentPermissionValue(permissionService, unitId, unitId, UnitAction.Edit)) {
        return false;
    }
    for (const objectId of objectIds) {
        if (!getDocumentPermissionValue(permissionService, unitId, objectId, UnitAction.Edit)) {
            return false;
        }
    }
    return true;
}
