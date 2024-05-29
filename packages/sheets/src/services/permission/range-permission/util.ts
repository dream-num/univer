/**
 * Copyright 2023-present DreamNum Inc.
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

import type { UnitAction } from '@univerjs/protocol';
import { RangeProtectionPermissionEditPoint } from '../permission-point/range/edit';
import { RangeProtectionPermissionViewPoint } from '../permission-point/range/view';

export type IRangePermissionPoint = RangeProtectionPermissionEditPoint | RangeProtectionPermissionViewPoint;

export const getAllRangePermissionPoint = () => [RangeProtectionPermissionViewPoint, RangeProtectionPermissionEditPoint];

export const getDefaultRangePermission = (unitId = 'unitId', subUnitId = 'subUnitId', permissionId = 'permissionId') => getAllRangePermissionPoint().reduce((r, F) => {
    const i = new F(unitId, subUnitId, permissionId);
    r[i.subType] = i.value;
    return r;
}, {} as Record<UnitAction, boolean>);
