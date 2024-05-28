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
import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';
import { ISidebarService, useObservable } from '@univerjs/ui';
import { IAuthzIoService, ICommandService, LocaleService } from '@univerjs/core';
import { UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { AddRangeProtectionCommand } from '@univerjs/sheets';
import { SheetPermissionUserManagerService } from '../../service';
import { UNIVER_SHEET_PERMISSION_PANEL, UNIVER_SHEET_PERMISSION_PANEL_FOOTER } from '../../const';
import { AddWorksheetProtectionCommand } from '../../command/worksheet-protection.command';
import { SheetPermissionPanelModel, viewState } from '../../service/sheet-permission-panel.model';
import { SetProtectionCommand } from '../../command/range-protection.command';
import { getUserListEqual } from '../../utils';
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
                    const collaborators = sheetPermissionUserManagerService.selectUserList;
                    if (activeRule.viewStatus === viewState.othersCanView) {
                        sheetPermissionUserManagerService.allUserList.forEach((user) => {
                            const hasInCollaborators = collaborators.some((collaborator) => collaborator.id === user.id);
                            if (!hasInCollaborators) {
                                const userCanRead = {
                                    ...user,
                                    role: UnitRole.Reader,
                                };
                                collaborators.push(userCanRead);
                            }
                        });
                    }
                    // edit rule

                    const isSameCollaborators = getUserListEqual(collaborators, sheetPermissionUserManagerService.oldCollaboratorList);
                    if (activeRule.permissionId) {
                        const oldRule = sheetPermissionPanelModel.oldRule;
                        if (activeRule.unitType === oldRule?.unitType && activeRule.name === oldRule.name && activeRule.description === oldRule.description && activeRule.ranges === oldRule.ranges && !isSameCollaborators) {
                            await authzIoService.putCollaborators({
                                objectID: activeRule.permissionId,
                                unitID: activeRule.unitId,
                                collaborators,
                            });
                        } else {
                            let newPermissionId = activeRule.permissionId;
                            if (!isSameCollaborators) {
                                if (activeRule.unitType === UnitObject.Worksheet) {
                                    newPermissionId = await authzIoService.create({
                                        worksheetObject: {
                                            collaborators,
                                            unitID: activeRule.unitId,
                                            name: activeRule.name,
                                            strategies: [{ role: UnitRole.Editor, action: UnitAction.Edit }, { role: UnitRole.Reader, action: UnitAction.View }],
                                        },
                                        objectType: UnitObject.Worksheet,
                                    });
                                } else {
                                    newPermissionId = await authzIoService.create({
                                        selectRangeObject: {
                                            collaborators,
                                            unitID: activeRule.unitId,
                                            name: activeRule.name,
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
                        //  create rule
                        if (activeRule.unitType === UnitObject.Worksheet) {
                            const permissionId = await authzIoService.create({
                                worksheetObject: {
                                    collaborators,
                                    unitID: activeRule.unitId,
                                    name: activeRule.name,
                                    strategies: [{ role: UnitRole.Editor, action: UnitAction.Edit }, { role: UnitRole.Reader, action: UnitAction.View }],
                                },
                                objectType: UnitObject.Worksheet,
                            });
                            const { ranges = [], ...sheetRule } = activeRule;
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
                        header: { title: '保护行列' },
                        children: {
                            label: UNIVER_SHEET_PERMISSION_PANEL,
                            showDetail: false,
                        },
                        width: 320,
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
