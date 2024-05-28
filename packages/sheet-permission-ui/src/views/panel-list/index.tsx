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

import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Avatar, Tooltip } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IRange, Workbook } from '@univerjs/core';
import { IAuthzIoService, ICommandService, IPermissionService, IUniverInstanceService, LocaleService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import type { IRangeProtectionRule, IWorksheetProtectionRule } from '@univerjs/sheets';
import { DeleteRangeProtectionCommand, RangeProtectionRuleModel, SetWorksheetActiveOperation, WorkbookManageCollaboratorPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { ISidebarService, useObservable } from '@univerjs/ui';
import { merge } from 'rxjs';
import type { IPermissionPoint } from '@univerjs/protocol';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { DeleteSingle, WriteSingle } from '@univerjs/icons';
import { useHighlightRange } from '@univerjs/sheets-ui';
import { serializeRange } from '@univerjs/engine-formula';
import { UNIVER_SHEET_PERMISSION_PANEL, UNIVER_SHEET_PERMISSION_PANEL_FOOTER } from '../../const';
import type { IPermissionPanelRule } from '../../service/sheet-permission-panel.model';
import { SheetPermissionPanelModel } from '../../service/sheet-permission-panel.model';
import { DeleteWorksheetProtectionCommand } from '../../command/worksheet-protection.command';
import styles from './index.module.less';
import { panelListEmptyBase64 } from './constant';

type IRuleItem = IRangeProtectionRule | IWorksheetProtectionRule;
export const SheetPermissionPanelList = () => {
    const [isCurrentSheet, setIsCurrentSheet] = useState(true);
    const [forceUpdateFlag, setForceUpdateFlag] = useState(false);
    const sheetPermissionPanelModel = useDependency(SheetPermissionPanelModel);
    const localeService = useDependency(LocaleService);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const worksheetProtectionModel = useDependency(WorksheetProtectionRuleModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

    const unitId = workbook.getUnitId();
    const commandService = useDependency(ICommandService);
    const sidebarService = useDependency(ISidebarService);
    const authzIoService = useDependency(IAuthzIoService);
    const permissionService = useDependency(IPermissionService);
    const usesManagerService = useDependency(UserManagerService);
    const currentUser = usesManagerService.currentUser;
    const [currentRuleRanges, currentRuleRangesSet] = useState<IRange[]>([]);

    useObservable(worksheetProtectionModel.ruleRefresh$);
    useObservable(rangeProtectionRuleModel.ruleRefresh$);

    const getRuleList = useCallback(async (isCurrentSheet: boolean) => {
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        const allRangePermissionId: string[] = [];
        const allSheetPermissionId: string[] = [];

        workbook.getSheets().forEach((sheet) => {
            const sheetId = sheet.getSheetId();
            const rules = rangeProtectionRuleModel.getSubunitRuleList(unitId, sheetId);
            rules.forEach((rule) => {
                if (rule.permissionId && rule.name) {
                    allRangePermissionId.push(rule.permissionId);
                }
            });
            const worksheetPermissionRule = worksheetProtectionModel.getRule(unitId, sheetId);
            if (worksheetPermissionRule?.permissionId && worksheetPermissionRule.name) {
                allSheetPermissionId.push(worksheetPermissionRule.permissionId);
            }
        });

        const allPermissionId = [...allRangePermissionId, ...allSheetPermissionId];

        const allPermissionRule = await authzIoService.list({
            objectIDs: allPermissionId,
            unitID: unitId,
            actions: [UnitAction.View, UnitAction.Edit],
        });

        const subUnitPermissionIds = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).map((item) => item.permissionId);
        const sheetPermissionId = worksheetProtectionModel.getRule(unitId, subUnitId)?.permissionId;
        if (sheetPermissionId) {
            subUnitPermissionIds.push(sheetPermissionId);
        }
        const subUnitRuleList = allPermissionRule.filter((item) => {
            return subUnitPermissionIds.includes(item.objectID) || item.objectID === worksheetProtectionModel.getRule(unitId, subUnitId)?.permissionId;
        });

        return isCurrentSheet ? subUnitRuleList : allPermissionRule;
    }, []);

    const [ruleList, setRuleList] = useState<IPermissionPoint[]>([]);

    useEffect(() => {
        const subscription = merge(
            rangeProtectionRuleModel.ruleChange$,
            worksheetProtectionModel.ruleChange$
        ).subscribe(async () => {
            const ruleList = await getRuleList(isCurrentSheet);
            setRuleList(ruleList);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [isCurrentSheet]);

    useEffect(() => {
        const subscribe = workbook.activeSheet$.subscribe(async () => {
            const ruleList = await getRuleList(true);
            setRuleList(ruleList);
        });
        return () => {
            subscribe.unsubscribe();
        };
    }, []);

    const handleDelete = (rule: IRuleItem) => {
        const { unitId, subUnitId, unitType } = rule;
        let res;
        if (unitType === UnitObject.Worksheet) {
            res = commandService.executeCommand(DeleteWorksheetProtectionCommand.id, { unitId, subUnitId, rule });
        } else if (unitType === UnitObject.SelectRange) {
            res = commandService.executeCommand(DeleteRangeProtectionCommand.id, { unitId, subUnitId, rule });
        }

        if (res) {
            setForceUpdateFlag(!forceUpdateFlag);
            if ((rule as IRangeProtectionRule).ranges === currentRuleRanges) {
                currentRuleRangesSet([]);
            }
        }
    };

    useHighlightRange(currentRuleRanges);

    const allRuleMap = new Map<string, IRangeProtectionRule | IWorksheetProtectionRule>();
    workbook.getSheets().forEach((sheet) => {
        const sheetId = sheet.getSheetId();
        const rangeRules = rangeProtectionRuleModel.getSubunitRuleList(unitId, sheetId);
        rangeRules.forEach((rule) => {
            allRuleMap.set(rule.permissionId, rule);
        });

        const sheetRule = worksheetProtectionModel.getRule(unitId, sheetId);
        if (sheetRule) {
            allRuleMap.set(sheetRule?.permissionId, sheetRule);
        }
    });

    const handleEdit = (rule: IPermissionPanelRule) => {
        sheetPermissionPanelModel.setRule(rule);
        sheetPermissionPanelModel.setOldRule(rule);

        commandService.executeCommand(SetWorksheetActiveOperation.id, {
            unitId: rule.unitId,
            subUnitId: rule.subUnitId,
        });

        const sidebarProps = {
            header: { title: 'permission.panel.title' },
            children: {
                label: UNIVER_SHEET_PERMISSION_PANEL,
                showDetail: true,
            },
            width: 320,
            footer: {
                label: UNIVER_SHEET_PERMISSION_PANEL_FOOTER,
                showDetail: true,
            },
        };

        sidebarService.open(sidebarProps);
    };

    const handleChangeHeaderType = async (isCurrentSheet: boolean) => {
        setIsCurrentSheet(isCurrentSheet);
        const ruleList = await getRuleList(isCurrentSheet);
        setRuleList(ruleList);
    };

    return (
        <div className={styles.sheetPermissionListPanelWrapper}>
            <div className={styles.sheetPermissionListPanelHeader}>
                <div className={styles.sheetPermissionListPanelHeaderType} onClick={() => handleChangeHeaderType(true)}>
                    <div className={clsx({ [styles.sheetPermissionListPanelHeaderSelect]: isCurrentSheet })}>{localeService.t('permission.panel.currentSheet')}</div>
                    {isCurrentSheet && <div className={styles.sheetPermissionListPanelHeaderTypeBottom} />}
                </div>
                <div className={styles.sheetPermissionListPanelHeaderType} onClick={() => handleChangeHeaderType(false)}>
                    <div className={clsx({ [styles.sheetPermissionListPanelHeaderSelect]: !isCurrentSheet })}>{localeService.t('permission.panel.allSheet')}</div>
                    {!isCurrentSheet && <div className={styles.sheetPermissionListPanelHeaderTypeBottom} />}
                </div>
            </div>

            {ruleList?.length > 0
                ? (
                    <div className={styles.sheetPermissionListPanelContent}>
                        {ruleList?.map((item) => {
                            const rule = allRuleMap.get(item.objectID);

                            if (!rule) {
                                return null;
                            }

                            const editAction = item.actions.find((action) => action.action === UnitAction.Edit);
                            const editPermission = editAction?.allowed;

                            const viewAction = item.actions.find((action) => action.action === UnitAction.View);
                            const viewPermission = viewAction?.allowed;

                            const manageCollaboratorAction = permissionService.getPermissionPoint(new WorkbookManageCollaboratorPermission(unitId).id)?.value ?? false;

                            const hasManagerPermission = manageCollaboratorAction || currentUser.userID === item.creator?.userID;

                            const worksheet = workbook.getActiveSheet();

                            let ruleName = '';

                            if (rule.unitType === UnitObject.SelectRange) {
                                const ranges = (rule as IRangeProtectionRule).ranges;
                                const rangeStr = ranges?.length
                                    ? ranges.map((range) => {
                                        const v = serializeRange(range);
                                        return v === 'NaN' ? '' : v;
                                    }).filter((r) => !!r).join(',')
                                    : '';
                                ruleName = `${worksheet.getName()}(${rangeStr})`;
                            } else if (rule.unitType === UnitObject.Worksheet) {
                                ruleName = worksheet.getName();
                            }

                            return (
                                <div
                                    key={item.objectID}
                                    className={styles.sheetPermissionListItem}
                                    onMouseMove={() => {
                                        const { subUnitId, unitType } = rule;
                                        const activeSheet = workbook.getActiveSheet();
                                        const activeSubUnitId = activeSheet.getSheetId();
                                        if (subUnitId !== activeSubUnitId) {
                                            return false;
                                        }
                                        if (unitType === UnitObject.SelectRange) {
                                            const ranges = (rule as IRangeProtectionRule).ranges || [];
                                            ranges !== currentRuleRanges && currentRuleRangesSet(ranges);
                                        } else if (unitType === UnitObject.Worksheet) {
                                            const ranges = [{ startRow: 0, endRow: activeSheet.getRowCount() - 1, startColumn: 0, endColumn: activeSheet.getColumnCount() - 1 }];
                                            ranges !== currentRuleRanges && currentRuleRangesSet(ranges);
                                        }
                                    }}
                                    onMouseLeave={() => currentRuleRangesSet([])}
                                >
                                    <div className={styles.sheetPermissionListItemHeader}>
                                        <Tooltip title={ruleName}>
                                            <div className={styles.sheetPermissionListItemHeaderName}>{ruleName}</div>
                                        </Tooltip>

                                        {hasManagerPermission && (
                                            <div className={styles.sheetPermissionListItemHeaderOperator}>
                                                <Tooltip title={localeService.t('permission.panel.edit')}>
                                                    <div className={styles.sheetPermissionListItemHeaderIcon} onClick={() => handleEdit(rule as IPermissionPanelRule)}><WriteSingle /></div>
                                                </Tooltip>
                                                <Tooltip title={localeService.t('permission.panel.delete')}>
                                                    <div className={styles.sheetPermissionListItemHeaderIcon} onClick={() => handleDelete(rule)}><DeleteSingle /></div>
                                                </Tooltip>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.sheetPermissionListItemSplit} />
                                    <div className={styles.sheetPermissionListItemContent}>
                                        <div className={styles.sheetPermissionListItemContentEdit}>

                                            <Tooltip title={item.creator?.userID}>
                                                <div>
                                                    <Avatar src={item.creator?.avatar} style={{ marginRight: 6 }} size={24} />
                                                </div>
                                            </Tooltip>
                                            <span className={styles.sheetPermissionListItemContentTitle}>{localeService.t('permission.panel.created')}</span>
                                            <span className={styles.sheetPermissionListItemContentSub}>{editPermission ? `${localeService.t('permission.panel.iCanEdit')}` : `${localeService.t('permission.panel.iCanNotEdit')}`}</span>

                                        </div>
                                        <div className={styles.sheetPermissionListItemContentView}>
                                            <span className={styles.sheetPermissionListItemContentTitle}>{localeService.t('permission.panel.viewPermission')}</span>
                                            <span className={styles.sheetPermissionListItemContentSub}>{viewPermission ? `${localeService.t('permission.panel.iCanView')}` : `${localeService.t('permission.panel.iCanNotView')}`}</span>
                                        </div>
                                        {rule.description && (
                                            <Tooltip title={rule.description}>
                                                <div className={styles.sheetPermissionListItemContentDesc}>
                                                    {rule.description}
                                                </div>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
                : (
                    <div className={styles.sheetPermissionListEmpty}>
                        <img width={240} height={120} src={panelListEmptyBase64} alt="" />
                        <p className={styles.sheetPermissionListEmptyText}>{localeService.t('permission.dialog.listEmpty')}</p>
                    </div>
                )}
        </div>
    );
};
