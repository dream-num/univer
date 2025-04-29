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

import type { Workbook } from '@univerjs/core';

import type { ICollaborator, UnitAction } from '@univerjs/protocol';
import { IAuthzIoService, ICommandService, IPermissionService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { Button, Switch } from '@univerjs/design';
import { ObjectScope, UnitObject, UnitRole } from '@univerjs/protocol';
import { getAllWorksheetPermissionPoint, SetWorksheetPermissionPointsCommand, WorksheetProtectionPointModel } from '@univerjs/sheets';
import { IDialogService, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { defaultWorksheetUnitActionList, subUnitPermissionTypeMap, UNIVER_SHEET_PERMISSION_DIALOG_ID } from '../../../consts/permission';
import Spin from '../spin';

interface IPermissionMap {
    [key: string]: {
        text: string;
        allowed: boolean;
    };
}

export const SheetPermissionDialog = () => {
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const authzIoService = useDependency(IAuthzIoService);
    const worksheetProtectionPointRuleModel = useDependency(WorksheetProtectionPointModel);
    const dialogService = useDependency(IDialogService);
    const permissionService = useDependency(IPermissionService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet();
    if (!worksheet) {
        throw new Error('No active sheet found');
    }

    const [collaborators, setCollaborators] = useState<ICollaborator[]>([]);
    const commandService = useDependency(ICommandService);
    const [loading, setLoading] = useState(() => {
        const pointRule = worksheetProtectionPointRuleModel.getRule(workbook.getUnitId(), worksheet.getSheetId());
        return !!pointRule;
    });

    const [permissionMap, setPermissionMap] = useState(() => {
        return Object.keys(subUnitPermissionTypeMap).reduce((acc, action) => {
            acc[action] = {
                text: localeService.t(`permission.panel.${subUnitPermissionTypeMap[Number(action) as UnitAction]}`),
                allowed: true,
            };
            return acc;
        }, {} as IPermissionMap);
    });

    useEffect(() => {
        const getUserList = async () => {
            const unitId = workbook.getUnitId();
            const collaborators = await authzIoService.listCollaborators({
                objectID: unitId,
                unitID: unitId,
            });
            setCollaborators(collaborators);
        };
        getUserList();
    }, []);

    useEffect(() => {
        const getPermissionPoints = async () => {
            const unitId = workbook.getUnitId();
            const worksheetPointRule = worksheetProtectionPointRuleModel.getRule(unitId, worksheet.getSheetId());
            if (!worksheetPointRule) {
                return;
            };
            setLoading(true);
            const result = await authzIoService.list({
                unitID: workbook.getUnitId(),
                objectIDs: [worksheetPointRule.permissionId],
                actions: defaultWorksheetUnitActionList,
            });
            const actions = result[0].strategies.reduce((p, c) => {
                if (subUnitPermissionTypeMap[c.action]) {
                    p[c.action] = {
                        text: localeService.t(`permission.panel.${subUnitPermissionTypeMap[c.action]}`),
                        allowed: c.role !== UnitRole.Owner,
                    };
                }
                return p;
            }, {} as IPermissionMap);
            setPermissionMap(actions);
            setTimeout(() => {
                setLoading(false);
            }, 100);
        };

        getPermissionPoints();
    }, []);

    const handleChangeActionPermission = async () => {
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet found');
        }
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const pointRule = worksheetProtectionPointRuleModel.getRule(unitId, subUnitId);

        const actions = Object.keys(permissionMap).map((action) => {
            return {
                action: Number(action) as UnitAction,
                role: permissionMap[action].allowed ? UnitRole.Editor : UnitRole.Owner,
            };
        });

        let permissionId = pointRule?.permissionId;

        if (!permissionId) {
            permissionId = await authzIoService.create({
                objectType: UnitObject.Worksheet,
                worksheetObject: {
                    unitID: unitId,
                    collaborators,
                    name: '',
                    strategies: actions,
                    scope: {
                        read: ObjectScope.AllCollaborator,
                        edit: ObjectScope.AllCollaborator,
                    },
                },
            });

            commandService.executeCommand(SetWorksheetPermissionPointsCommand.id, {
                rule: {
                    permissionId,
                    unitId,
                    subUnitId,
                },
            });
        } else {
            authzIoService.update({
                objectType: UnitObject.Worksheet,
                objectID: permissionId,
                unitID: unitId,
                strategies: actions,
                share: undefined,
                name: '',
                scope: {
                    read: ObjectScope.AllCollaborator,
                    edit: ObjectScope.AllCollaborator,
                },
                collaborators: undefined,
            }).then(() => {
                getAllWorksheetPermissionPoint().forEach((F) => {
                    const instance = new F(unitId, subUnitId);
                    const unitActionName = instance.subType;
                    const action = actions.find((item) => item.action === unitActionName);
                    if (action) {
                        permissionService.updatePermissionPoint(instance.id, action.role === UnitRole.Editor);
                    }
                });
            });
        }
    };

    return (
        <Spin loading={loading}>
            <div className="univer-flex univer-flex-col univer-p-2">
                <div className="univer-h-px univer-bg-gray-200" />
                {Object.keys(permissionMap).map((action) => {
                    const actionItem = permissionMap[action];
                    const { text, allowed } = actionItem;
                    return (
                        <div
                            key={text}
                            className={`
                              univer-my-1.5 univer-flex univer-h-5 univer-items-center univer-justify-between
                              univer-leading-5
                            `}
                        >
                            <div>{text}</div>
                            <Switch
                                defaultChecked={allowed}
                                onChange={() => {
                                    setPermissionMap({
                                        ...permissionMap,
                                        [action]: {
                                            ...actionItem,
                                            allowed: !allowed,
                                        },
                                    });
                                }}
                            />
                        </div>
                    );
                })}
                <div className="univer-h-px univer-bg-gray-200" />
                <div className="univer-mt-2 univer-flex univer-h-9 univer-items-center univer-justify-end univer-gap-2">

                    <Button
                        onClick={() => {
                            dialogService.close(UNIVER_SHEET_PERMISSION_DIALOG_ID);
                        }}
                    >
                        {localeService.t('permission.button.cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleChangeActionPermission();
                            dialogService.close(UNIVER_SHEET_PERMISSION_DIALOG_ID);
                        }}
                    >
                        {localeService.t('permission.button.confirm')}
                    </Button>
                </div>
            </div>
        </Spin>
    );
};
