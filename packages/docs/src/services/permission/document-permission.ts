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

import type { IPermissionPoint, IPermissionService } from '@univerjs/core';
import { PermissionStatus } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';

export const DOCUMENT_UNIT_PERMISSION_ACTIONS = [
    UnitAction.Edit,
    UnitAction.Copy,
    UnitAction.Print,
    UnitAction.Export,
    UnitAction.Comment,
] as const;

export type DocumentUnitPermissionAction = typeof DOCUMENT_UNIT_PERMISSION_ACTIONS[number];

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

export class DocumentPermission implements IPermissionPoint {
    readonly type = UnitObject.Document;
    status = PermissionStatus.INIT;
    readonly id: string;
    value = true;

    constructor(
        readonly unitId: string,
        readonly objectId: string,
        readonly subType: UnitAction
    ) {
        this.id = objectId === unitId
            ? `${this.type}.${this.subType}_${unitId}`
            : `${this.type}.${this.subType}_${unitId}_${objectId}`;
    }
}

export function getDocumentPermissionValue(
    permissionService: IPermissionService,
    unitId: string,
    objectId: string,
    action: UnitAction
): boolean {
    return permissionService.getPermissionPoint(new DocumentPermission(unitId, objectId, action).id)?.value ?? true;
}

export function setDocumentPermissionValue(
    permissionService: IPermissionService,
    unitId: string,
    objectId: string,
    action: UnitAction,
    value: boolean
): void {
    const point = new DocumentPermission(unitId, objectId, action);
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
            if (point.type === UnitObject.Document && 'unitId' in point && point.unitId === unitId) {
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
