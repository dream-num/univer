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

import type { Univer } from '../../univer';
import type { IPermissionPoint } from '../permission/type';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionService } from '../permission/permission.service';
import { PermissionStatus } from '../permission/type';
import { createTestBed } from './create-test-bed';

class TestPermissionPoint implements IPermissionPoint {
    type: UnitObject.Workbook;
    id;
    status: PermissionStatus.INIT;
    subType: UnitAction.Copy;
    value: boolean = false;

    constructor(id: string) {
        this.id = `${UnitObject.Workbook}.${UnitAction.CreateSheet}.${id}` as string;
    }
}

describe('Test permission service', () => {
    let univer: Univer;
    let permissionService: PermissionService;

    beforeEach(() => {
        univer?.dispose();
        const instance = createTestBed([[PermissionService]]);
        univer = instance.univer;
        permissionService = instance.get(PermissionService);
    });

    it('test get permission from permissionService', () => {
        const point = new TestPermissionPoint('test');
        permissionService.addPermissionPoint(point);
        const result = permissionService.getPermissionPoint(point.id);
        expect(result).toBe(point);
    });

    it('test get permission$ from permissionService', async () => {
        const point = new TestPermissionPoint('test');
        const initValue = point.value;
        permissionService.addPermissionPoint(point);
        const result$ = permissionService.getPermissionPoint$(point.id)!;
        permissionService.updatePermissionPoint(point.id, !initValue);
        const v = await firstValueFrom(result$);
        expect(v.value).toBe(!initValue);
    });

    it('test compose permission', () => {
        const point1 = new TestPermissionPoint('test1');
        const point2 = new TestPermissionPoint('test2');
        permissionService.addPermissionPoint(point1);
        permissionService.addPermissionPoint(point2);
        const result = permissionService.composePermission([point1.id, point2.id]);
        expect(result).toEqual([point1, point2]);
    });

    it('test compose permission$', async () => {
        const point1 = new TestPermissionPoint('test1');
        const point2 = new TestPermissionPoint('test2');
        permissionService.addPermissionPoint(point1);
        permissionService.addPermissionPoint(point2);
        const result$ = permissionService.composePermission$([point1.id, point2.id]);
        permissionService.updatePermissionPoint(point2.id, !point2.value);
        const v = await firstValueFrom(result$);
        expect(v).toEqual([point1, point2]);
    });

    it('should manage permission updates, duplicates and visibility flags', () => {
        const point = new TestPermissionPoint('subject');
        const pointSubject = new BehaviorSubject<IPermissionPoint<boolean>>(point);
        const updates: string[] = [];
        const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const subscription = permissionService.permissionPointUpdate$.subscribe((permission) => {
            updates.push(`${permission.id}:${String(permission.value)}`);
        });

        expect(permissionService.getShowComponents()).toBe(true);
        permissionService.setShowComponents(false);
        expect(permissionService.getShowComponents()).toBe(false);

        expect(permissionService.addPermissionPoint(pointSubject)).toBe(true);
        expect(permissionService.addPermissionPoint(point)).toBe(false);

        permissionService.updatePermissionPoint(point.id, true);

        expect(permissionService.getPermissionPoint(point.id)).toMatchObject({
            value: true,
            status: PermissionStatus.DONE,
        });
        expect(updates).toEqual([
            `${point.id}:false`,
            `${point.id}:true`,
        ]);

        const snapshot = permissionService.getAllPermissionPoint();
        snapshot.clear();
        expect(permissionService.getAllPermissionPoint().size).toBe(1);

        permissionService.deletePermissionPoint(point.id);
        expect(permissionService.getPermissionPoint(point.id)).toBeUndefined();

        permissionService.clearPermissionMap();
        expect(permissionService.getAllPermissionPoint().size).toBe(0);

        subscription.unsubscribe();
        warningSpy.mockRestore();
    });

    it('should throw clear errors when composing missing permission points', () => {
        expect(() => permissionService.composePermission(['missing.permission'])).toThrow('[PermissionService]: missing.permission permissionPoint does not exist!');
        expect(() => permissionService.composePermission$(['missing.permission'])).toThrow('[PermissionService]: missing.permission permissionPoint does not exist!');
    });
});
