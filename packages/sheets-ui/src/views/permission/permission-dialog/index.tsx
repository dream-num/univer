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

import React, { useEffect, useState } from 'react';

import { Button, Switch } from '@univerjs/design';
import clsx from 'clsx';
import { IAuthzIoService, ICommandService, IPermissionService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import type { Workbook } from '@univerjs/core';
import { IDialogService } from '@univerjs/ui';
import { getAllWorksheetPermissionPoint, SetWorksheetPermissionPointsCommand, WorksheetProtectionPointModel } from '@univerjs/sheets';
import type { ICollaborator, UnitAction } from '@univerjs/protocol';
import { ObjectScope, UnitObject, UnitRole } from '@univerjs/protocol';
import Spin from '../spin';
import { defaultWorksheetUnitActionList, subUnitPermissionTypeMap, UNIVER_SHEET_PERMISSION_DIALOG_ID } from '../../../consts/permission';
import styles from './index.module.less';

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
            <div className={styles.sheetPermissionDialogWrapper}>
                <div className={styles.sheetPermissionDialogSplit} />
                {Object.keys(permissionMap).map((action) => {
                    const actionItem = permissionMap[action];
                    const { text, allowed } = actionItem;
                    return (
                        <div key={text} className={styles.sheetPermissionDialogItem}>
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
                <div className={styles.sheetPermissionDialogSplit}></div>
                <div className={styles.sheetPermissionUserDialogFooter}>

                    <Button
                        className={styles.sheetPermissionUserDialogButton}
                        onClick={() => {
                            dialogService.close(UNIVER_SHEET_PERMISSION_DIALOG_ID);
                        }}
                    >
                        {localeService.t('permission.button.cancel')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            handleChangeActionPermission();
                            dialogService.close(UNIVER_SHEET_PERMISSION_DIALOG_ID);
                        }}
                        className={clsx(styles.sheetPermissionUserDialogFooterConfirm, styles.sheetPermissionUserDialogButton)}
                    >
                        {localeService.t('permission.button.confirm')}
                    </Button>
                </div>
            </div>
        </Spin>
    );
};
