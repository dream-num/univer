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

import { UnitObject } from '@univerjs/protocol';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { DesktopLogService, ILogService } from '../../log/log.service';
import { ResourceManagerService } from '../../resource-manager/resource-manager.service';
import { IResourceManagerService } from '../../resource-manager/type';
import { UserManagerService } from '../../user-manager/user-manager.service';
import { AuthzIoLocalService } from '../authz-io-local.service';

describe('AuthzIoLocalService', () => {
    let service: AuthzIoLocalService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IResourceManagerService, { useClass: ResourceManagerService }]);
        injector.add([UserManagerService]);
        injector.add([AuthzIoLocalService]);
        service = injector.get(AuthzIoLocalService);
    });

    it('creates range permission objects and evaluates default owner actions', async () => {
        const objectID = await service.create({
            objectType: UnitObject.SelectRange,
            selectRangeObject: { unitID: 'book-1', name: 'Protected range' },
        } as never);

        await expect(service.allowed({ unitID: 'book-1', objectID, actions: [6, 16] } as never)).resolves.toEqual([
            { action: 6, allowed: true },
            { action: 16, allowed: true },
        ]);
    });

    it('lists created permission objects with their range metadata', async () => {
        const objectID = await service.create({
            objectType: UnitObject.SelectRange,
            selectRangeObject: { unitID: 'book-1', name: 'Protected range' },
        } as never);

        const [permissionPoint] = await service.list({ unitID: 'book-1', objectIDs: [objectID], actions: [6] } as never);

        expect(permissionPoint.objectID).toBe(objectID);
        expect(permissionPoint.name).toBe('Protected range');
        expect(permissionPoint.unitID).toBe('book-1');
    });
});
