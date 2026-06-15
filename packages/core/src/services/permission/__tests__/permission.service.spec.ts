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

import type { IPermissionPoint } from '../type';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { PermissionService } from '../permission.service';
import { PermissionStatus } from '../type';

describe('PermissionService', () => {
    let service: PermissionService;

    const permissionPoint = (id: string, value: boolean, status: PermissionStatus): IPermissionPoint => ({
        id,
        value,
        status,
        type: UnitObject.Workbook,
        subType: UnitAction.Edit,
    });

    beforeEach(() => {
        const injector = new Injector();
        injector.add([PermissionService]);
        service = injector.get(PermissionService);
    });

    it('updates a permission point and composes the latest decision set', () => {
        const updates: string[] = [];
        service.permissionPointUpdate$.subscribe((point) => updates.push(`${point.id}:${String(point.value)}`));

        expect(service.addPermissionPoint(permissionPoint('sheet-edit', false, PermissionStatus.INIT))).toBe(true);
        expect(service.addPermissionPoint(permissionPoint('sheet-view', true, PermissionStatus.DONE))).toBe(true);

        service.updatePermissionPoint('sheet-edit', true);

        expect(service.composePermission(['sheet-edit', 'sheet-view']).map((point) => point.value)).toEqual([true, true]);
        expect(service.getPermissionPoint('sheet-edit')?.status).toBe(PermissionStatus.DONE);
        expect(updates).toEqual(['sheet-edit:false', 'sheet-view:true', 'sheet-edit:true']);
    });

    it('removes permission decisions that no longer apply to the current document', () => {
        service.addPermissionPoint(permissionPoint('range-lock', true, PermissionStatus.DONE));
        service.deletePermissionPoint('range-lock');

        expect(service.getPermissionPoint('range-lock')).toBeUndefined();
        expect(() => service.composePermission(['range-lock'])).toThrow('[PermissionService]: range-lock permissionPoint does not exist!');
    });
});
