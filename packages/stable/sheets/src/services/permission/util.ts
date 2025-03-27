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

import type { IAccessor, IRange } from '@univerjs/core';
import { IPermissionService, Rectangle } from '@univerjs/core';
import { RangeProtectionRuleModel } from '../../model/range-protection-rule.model';
import { WorkbookEditablePermission, WorksheetEditPermission } from '../../services/permission/permission-point';
import { RangeProtectionPermissionEditPoint } from '../../services/permission/permission-point/range/edit';

export const checkRangesEditablePermission = (accessor: IAccessor, unitId: string, subUnitId: string, ranges: IRange[]) => {
    const permissionService = accessor.get(IPermissionService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    const workbookEditablePermission = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id);
    if (!workbookEditablePermission?.value) {
        return false;
    }
    const worksheetEditPermission = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id);
    if (!worksheetEditPermission?.value) {
        return false;
    }

    const allProtectionRule = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);

    const ruleList = allProtectionRule.filter((rule) => {
        return rule.ranges.some((ruleRange) => ranges.some((range) => Rectangle.intersects(ruleRange, range)));
    });
    if (!ruleList.length) {
        return true;
    }
    return ruleList.every((rule) => {
        const permissionId = rule.permissionId;
        const permissionPoint = permissionService.getPermissionPoint(new RangeProtectionPermissionEditPoint(unitId, subUnitId, permissionId).id);
        return !!permissionPoint?.value;
    });
};
