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

import type { IAccessor, UniverInstanceType } from '@univerjs/core';
import type { UnitObject } from '@univerjs/protocol';
import type { IMenuButtonItem } from '../services/menu/menu';
import { isInternalEditorID, IUniverInstanceService, ObjectPermissionService } from '@univerjs/core';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { MenuItemType } from '../services/menu/menu';
import { IWorkbenchService } from '../services/workbench/workbench.service';

export function objectPermissionMenuItemFactory(
    accessor: IAccessor,
    id: string,
    unitType: UniverInstanceType,
    objectType: UnitObject
): IMenuButtonItem {
    const instances = accessor.get(IUniverInstanceService);
    const state$ = combineLatest([
        accessor.get(IWorkbenchService).rootUnitType$,
        instances.getCurrentTypeOfUnit$(unitType),
    ]).pipe(switchMap(([rootType, model]) => {
        if (rootType !== unitType || !model || isInternalEditorID(model.getUnitId())) {
            return of({ hidden: true, activated: false });
        }
        // Resolve only after a product unit exists so late Authz overrides can register first.
        const permissions = accessor.get(ObjectPermissionService);
        const unitId = model.getUnitId();
        return permissions.changed$.pipe(map(() => ({
            hidden: !permissions.supports({ unitId, objectId: unitId, objectType }),
            activated: permissions.getPolicies(unitId).some((policy) => permissions.hasPolicy({ unitId, objectId: policy.objectID, objectType: policy.objectType })),
        })));
    }));
    return {
        id,
        type: MenuItemType.BUTTON,
        icon: 'ProtectIcon',
        title: 'ui.objectPermission.title',
        tooltip: 'ui.objectPermission.title',
        hidden$: state$.pipe(map((state) => state.hidden)),
        activated$: state$.pipe(map((state) => state.activated)),
    };
}
