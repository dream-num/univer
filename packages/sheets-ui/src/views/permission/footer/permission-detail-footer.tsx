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

import { Button } from '@univerjs/design';
import { IAuthzIoService, ICommandService, LocaleService, useDependency } from '@univerjs/core';
import React from 'react';
import { ISidebarService, useObservable } from '@univerjs/ui';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { AddRangeProtectionCommand } from '@univerjs/sheets';
import { editState, SheetPermissionPanelModel, viewState } from '../../../services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { getUserListEqual } from '../../../common/utils';
import { SetProtectionCommand } from '../../../commands/commands/range-protection.command';
import { AddWorksheetProtectionCommand } from '../../../commands/commands/worksheet-protection.command';
import { UNIVER_SHEET_PERMISSION_PANEL, UNIVER_SHEET_PERMISSION_PANEL_FOOTER } from '../../../basics/const/permission';
import styles from './index.module.less';

export const SheetPermissionPanelDetailFooter = () => {
    const sheetPermissionPanelModel = useDependency(SheetPermissionPanelModel);
    const activeRule = useObservable(sheetPermissionPanelModel.rule$, sheetPermissionPanelModel.rule);
    const sidebarService = useDependency(ISidebarService);
    const authzIoService = useDependency(IAuthzIoService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const rangeErrMsg = useObservable(sheetPermissionPanelModel.rangeErrorMsg$);

    return (
        <div className={styles.sheetPermissionPanelFooter}>
            <Button
                type="primary"
                onClick={async () => {
                    if (!activeRule.name || rangeErrMsg) return;
                    let collaborators = sheetPermissionUserManagerService.selectUserList;
                    if (activeRule.editStatus === editState.onlyMe) {
                        collaborators = [];
                        sheetPermissionUserManagerService.setSelectUserList([]);
                    }
                    const scopeObj = {
                        read: activeRule.viewStatus === viewState.othersCanView ? ObjectScope.AllCollaborator : ObjectScope.SomeCollaborator,
                        edit: activeRule.editStatus === editState.designedUserCanEdit ? ObjectScope.SomeCollaborator : ObjectScope.OneSelf,
                    };

                    // Editing existing permission rules
                    if (activeRule.permissionId) {
                        const oldRule = sheetPermissionPanelModel.oldRule;
                        // Collaborators only need to consider people with editing permissions
                        const isSameCollaborators = getUserListEqual(collaborators.filter((user) => user.role === UnitRole.Editor), sheetPermissionUserManagerService.oldCollaboratorList.filter((user) => user.role === UnitRole.Editor));
                        const isSameReadStatus = oldRule?.viewStatus === activeRule.viewStatus;
                        const isSameEditStatus = oldRule?.editStatus === activeRule.editStatus;
                        const ruleConfigIsOrigin = activeRule.unitType === oldRule?.unitType && activeRule.name === oldRule.name && activeRule.description === oldRule.description && activeRule.ranges === oldRule.ranges;
                        const collaboratorsIsChange = !isSameCollaborators || !isSameReadStatus || !isSameEditStatus;

                        if (ruleConfigIsOrigin && collaboratorsIsChange) {
                            // When only collaborators or read status change or edit status change, the update interface is called. Here is the agreement strategies = [];
                            await authzIoService.update({
                                objectType: activeRule.unitType,
                                objectID: activeRule.permissionId,
                                unitID: activeRule.unitId,
                                share: undefined,
                                name: '',
                                strategies: [],
                                scope: scopeObj,
                            });
                        } else {
                            // If the description of the permission is modified, it needs to be synchronized to other collaborators, so the create logic needs to be followed.
                            let newPermissionId = activeRule.permissionId;

                            // If the collaborator or reader information is modified, a new permissionId is required,
                            if (collaboratorsIsChange) {
                                if (activeRule.unitType === UnitObject.Worksheet) {
                                    newPermissionId = await authzIoService.create({
                                        worksheetObject: {
                                            collaborators,
                                            unitID: activeRule.unitId,
                                            name: activeRule.name,
                                            strategies: [{ role: UnitRole.Editor, action: UnitAction.Edit }, { role: UnitRole.Reader, action: UnitAction.View }],
                                            scope: scopeObj,
                                        },
                                        objectType: UnitObject.Worksheet,
                                    });
                                } else {
                                    newPermissionId = await authzIoService.create({
                                        selectRangeObject: {
                                            collaborators,
                                            unitID: activeRule.unitId,
                                            name: activeRule.name,
                                            scope: scopeObj,
                                        },
                                        objectType: UnitObject.SelectRange,
                                    });
                                }
                            }

                            commandService.executeCommand(SetProtectionCommand.id, {
                                rule: {
                                    ...activeRule,
                                    permissionId: newPermissionId,
                                },
                            });
                        }
                    } else {
                        //  Create new rule

                        if (activeRule.unitType === UnitObject.Worksheet) {
                            const permissionId = await authzIoService.create({
                                worksheetObject: {
                                    collaborators,
                                    unitID: activeRule.unitId,
                                    name: activeRule.name,
                                    strategies: [{ role: UnitRole.Editor, action: UnitAction.Edit }, { role: UnitRole.Reader, action: UnitAction.View }],
                                    scope: scopeObj,
                                },
                                objectType: UnitObject.Worksheet,
                            });
                            const { ranges: _range = [], ...sheetRule } = activeRule;
                            sheetRule.permissionId = permissionId;
                            commandService.executeCommand(AddWorksheetProtectionCommand.id, {
                                rule: sheetRule,
                                unitId: activeRule.unitId,
                            });
                        } else if (activeRule.unitType === UnitObject.SelectRange) {
                            const permissionId = await authzIoService.create({
                                selectRangeObject: {
                                    collaborators,
                                    unitID: activeRule.unitId,
                                    name: activeRule.name,
                                    scope: scopeObj,
                                },
                                objectType: UnitObject.SelectRange,
                            });
                            commandService.executeCommand(AddRangeProtectionCommand.id, {
                                rule: activeRule,
                                permissionId,
                            });
                        }
                    }
                    sheetPermissionPanelModel.resetRule();
                    sheetPermissionUserManagerService.setSelectUserList([]);
                    const sidebarProps = {
                        header: { title: `${localeService.t('permission.panel.title')}` },
                        children: {
                            label: UNIVER_SHEET_PERMISSION_PANEL,
                            showDetail: false,
                        },
                        width: 330,
                        footer: {
                            label: UNIVER_SHEET_PERMISSION_PANEL_FOOTER,
                            showDetail: false,
                        },
                    };
                    sidebarService.open(sidebarProps);
                }}
            >
                {localeService.t('permission.button.confirm')}
            </Button>
            <Button
                className={styles.sheetPermissionPanelFooterCancel}
                onClick={() => {
                    sheetPermissionPanelModel.resetRule();
                    sheetPermissionUserManagerService.setSelectUserList([]);
                    sidebarService.close();
                }}
            >
                {localeService.t('permission.button.cancel')}
            </Button>
        </div>
    );
};
