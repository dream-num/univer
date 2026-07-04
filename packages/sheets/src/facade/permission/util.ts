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

import type { Injector } from '@univerjs/core';
import type { FRange } from '../f-range';
import type { FWorksheet } from '../f-worksheet';
import type { IRangeProtectionOptions } from './permission-types';
import { IAuthzIoService, IPermissionService, Rectangle } from '@univerjs/core';
import { ObjectScope } from '@univerjs/protocol';
import { EditStateEnum, getAllWorksheetPermissionPointByPointPanel, RangeProtectionRuleModel, ViewStateEnum, WorksheetProtectionPointModel } from '@univerjs/sheets';
import { FRangeProtectionRule } from './f-range-protection-rule';

export function determineViewState(allowViewByOthers?: boolean): ViewStateEnum {
    if (allowViewByOthers === false) {
        return ViewStateEnum.NoOneElseCanView;
    }
    return ViewStateEnum.OthersCanView;
}

export function determineEditState(allowedUsers?: string[]): EditStateEnum {
    if (allowedUsers?.length) {
        return EditStateEnum.DesignedUserCanEdit;
    }
    return EditStateEnum.OnlyMe;
}

export function determineScope(editState: EditStateEnum, viewState: ViewStateEnum): {
    edit: ObjectScope;
    read: ObjectScope;
} {
    return {
        edit: editState === EditStateEnum.DesignedUserCanEdit ? ObjectScope.SomeCollaborator : ObjectScope.OneSelf,
        read: viewState === ViewStateEnum.OthersCanView ? ObjectScope.AllCollaborator : ObjectScope.SomeCollaborator,
    };
}

/**
 * Check if there are no range protection rules for the given unit and subunit when removing a range protection rule.
 * If there are no rules left, also remove the associated worksheet protection and update the permission points accordingly.
 * @param {Injector} injector The injector used to resolve permission services.
 * @param {string} unitId The workbook unit id.
 * @param {string} subUnitId The worksheet subunit id.
 */
export function handleWorksheetRangePermissionIsEmpty(injector: Injector, unitId: string, subUnitId: string): void {
    const rangeProtectionRuleModel = injector.get(RangeProtectionRuleModel);
    const worksheetProtectionPointModel = injector.get(WorksheetProtectionPointModel);
    const permissionService = injector.get(IPermissionService);

    const rules = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
    if (rules.length > 0) {
        return;
    }

    // Because this rule is attached to other protection, if other protection is deleted, this rule should be deleted.
    worksheetProtectionPointModel.deleteRule(unitId, subUnitId);

    [...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
        const instance = new F(unitId, subUnitId);
        permissionService.updatePermissionPoint(instance.id, instance.value);
    });
}

/**
 * Get the list of range protection rules for a specific worksheet or range, and convert them to FRangeProtectionRule instances.
 * @param {Injector} injector The injector used to resolve permission services.
 * @param {string} unitId The workbook unit id.
 * @param {string} subUnitId The worksheet subunit id.
 * @param {object} options Options for listing range protection rules.
 * @param {FWorksheet} options.worksheet The worksheet facade used to convert ranges.
 * @param {FRange} [options.specificRange] Optional range used to filter rules.
 * @param {boolean} [options.ignoreCollaborators] Whether to skip fetching collaborators for performance.
 * @returns {Promise<FRangeProtectionRule[]>} The range protection rules.
 */
export async function getListRangeProtectionRules(
    injector: Injector,
    unitId: string,
    subUnitId: string,
    options: {
        worksheet: FWorksheet; // Pass the worksheet to convert IRange to FRange
        specificRange?: FRange; // Option to specify a particular range to filter rules
        ignoreCollaborators?: boolean; // Option to ignore fetching collaborators for performance
    }
): Promise<FRangeProtectionRule[]> {
    const rangeProtectionRuleModel = injector.get(RangeProtectionRuleModel);
    const authzIoService = injector.get(IAuthzIoService);

    const { worksheet, specificRange, ignoreCollaborators = false } = options;

    let rules = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
    if (specificRange) {
        rules = rules.filter((rule) =>
            rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, specificRange.getRange()))
        );
    }

    const rulesWithOptions = await Promise.all(
        rules.map(async (rule) => {
            const ranges = rule.ranges.map((range) => worksheet.getRange(range));
            const options: IRangeProtectionOptions = {
                name: rule.description || '',
                allowViewByOthers: rule.viewState !== ViewStateEnum.NoOneElseCanView,
            };

            if (rule.editState === EditStateEnum.DesignedUserCanEdit) {
                options.allowedUsers = [];

                if (!ignoreCollaborators) {
                    try {
                        // Fetch collaborators for this rule
                        const collaborators = await authzIoService.listCollaborators({
                            objectID: rule.permissionId,
                            unitID: unitId,
                        });
                        options.allowedUsers = collaborators.map((c) => c.subject?.userID || c.id);
                    } catch (error) {
                        console.warn(`Failed to fetch collaborators for rule ${rule.id}:`, error);
                    }
                }
            }

            return {
                id: rule.id,
                permissionId: rule.permissionId,
                ranges,
                options,
            };
        })
    );

    return rulesWithOptions.map(({ id, permissionId, ranges, options }) =>
        injector.createInstance(
            FRangeProtectionRule,
            unitId,
            subUnitId,
            id,
            permissionId,
            ranges,
            options
        )
    );
}
