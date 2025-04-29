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

import type { IRange, Workbook } from '@univerjs/core';
import type { IRangeProtectionRule } from '@univerjs/sheets';
import type { IPermissionPanelRule } from '../../../services/permission/sheet-permission-panel.model';
import { IAuthzIoService, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { ObjectScope, UnitAction, UnitRole } from '@univerjs/protocol';
import { AddRangeProtectionCommand, AddWorksheetProtectionCommand, EditStateEnum, SetProtectionCommand, UnitObject, ViewStateEnum } from '@univerjs/sheets';
import { ISidebarService, useDependency } from '@univerjs/ui';
import { getUserListEqual } from '../../../common/utils';
import { UNIVER_SHEET_PERMISSION_PANEL } from '../../../consts/permission';
import { SheetPermissionPanelModel } from '../../../services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { checkRangesIsWholeSheet } from '../util';

interface IPermissionDetailFooterPartProps {
    permissionId: string;
    id: string;
    ranges: IRange[];
    rangesErrMsg?: string;
    desc?: string;
    editState: EditStateEnum;
    viewState: ViewStateEnum;
    oldRule?: IPermissionPanelRule;
}

export const PermissionDetailFooterPart = (props: IPermissionDetailFooterPartProps) => {
    const { viewState, editState, permissionId, ranges, rangesErrMsg, desc, oldRule, id } = props;
    const sheetPermissionPanelModel = useDependency(SheetPermissionPanelModel);
    const sidebarService = useDependency(ISidebarService);
    const authzIoService = useDependency(IAuthzIoService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const worksheet = workbook?.getActiveSheet();
    if (!workbook || !worksheet) {
        return null;
    }
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();

    return (
        <div className="univer-mt-auto univer-flex univer-flex-row-reverse univer-py-5 univer-gap-2">
            <Button
                variant="primary"
                onClick={async () => {
                    if (rangesErrMsg) return;

                    const activeRule: IPermissionPanelRule = {
                        unitId,
                        subUnitId,
                        permissionId,
                        id,
                        viewState,
                        editState,
                        unitType: UnitObject.SelectRange,
                        ranges,
                        description: desc,
                    };

                    const isSelectWholeSheet = checkRangesIsWholeSheet(ranges, worksheet);
                    if (isSelectWholeSheet) {
                        activeRule.unitType = UnitObject.Worksheet;
                        activeRule.ranges = [];
                    }

                    let collaborators = sheetPermissionUserManagerService.selectUserList;
                    if (activeRule.editState === EditStateEnum.OnlyMe) {
                        collaborators = [];
                        sheetPermissionUserManagerService.setSelectUserList([]);
                    }
                    const scopeObj = {
                        read: activeRule.viewState === ViewStateEnum.OthersCanView ? ObjectScope.AllCollaborator : ObjectScope.SomeCollaborator,
                        edit: activeRule.editState === EditStateEnum.DesignedUserCanEdit ? ObjectScope.SomeCollaborator : ObjectScope.OneSelf,
                    };
                    if (activeRule.editState === EditStateEnum.DesignedUserCanEdit && collaborators.length === 0) {
                        collaborators = [];
                        scopeObj.edit = ObjectScope.OneSelf;
                    }

                    // Editing existing permission rules
                    if (activeRule.permissionId) {
                        // Collaborators only need to consider people with editing permissions
                        const isSameCollaborators = getUserListEqual(collaborators.filter((user) => user.role === UnitRole.Editor), sheetPermissionUserManagerService.oldCollaboratorList.filter((user) => user.role === UnitRole.Editor));
                        const isSameReadStatus = oldRule?.viewState === activeRule.viewState;
                        const isSameEditStatus = oldRule?.editState === activeRule.editState;
                        const ruleConfigIsOrigin = activeRule.unitType === oldRule?.unitType && activeRule.description === oldRule.description && activeRule.ranges === (oldRule as IRangeProtectionRule).ranges;
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
                                collaborators: {
                                    collaborators,
                                },
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
                                            name: '',
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
                                            name: '',
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
                                oldRule,
                            });
                        }
                    } else {
                        //  Create new rule

                        if (activeRule.unitType === UnitObject.Worksheet) {
                            const permissionId = await authzIoService.create({
                                worksheetObject: {
                                    collaborators,
                                    unitID: activeRule.unitId,
                                    name: '',
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
                                    name: '',
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
                    const sidebarProps = {
                        header: { title: `${localeService.t('permission.panel.title')}` },
                        children: {
                            label: UNIVER_SHEET_PERMISSION_PANEL,
                            showDetail: false,
                        },
                        width: 330,
                    };
                    sidebarService.open(sidebarProps);
                }}
            >
                {localeService.t('permission.button.confirm')}
            </Button>
            <Button
                onClick={() => {
                    sheetPermissionPanelModel.reset();
                    sheetPermissionUserManagerService.reset();
                    sidebarService.close();
                }}
            >
                {localeService.t('permission.button.cancel')}
            </Button>
        </div>
    );
};
