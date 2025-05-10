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
import type { IPermissionPoint } from '@univerjs/protocol';
import type { IRangeProtectionRule, IWorksheetProtectionRule } from '@univerjs/sheets';
import type { IPermissionPanelRule } from '../../../services/permission/sheet-permission-panel.model';
import { IAuthzIoService, ICommandService, IPermissionService, IUniverInstanceService, LocaleService, Tools, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { Avatar, borderClassName, Button, clsx, Tooltip } from '@univerjs/design';
import { serializeRange } from '@univerjs/engine-formula';
import { DeleteSingle, WriteSingle } from '@univerjs/icons';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { baseProtectionActions, DeleteRangeProtectionCommand, DeleteWorksheetProtectionCommand, RangeProtectionRuleModel, SetWorksheetActiveOperation, WorkbookCreateProtectPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { ISidebarService, useDependency, useObservable } from '@univerjs/ui';
import { useCallback, useEffect, useState } from 'react';
import { distinctUntilChanged, merge } from 'rxjs';
import { UNIVER_SHEET_PERMISSION_PANEL } from '../../../consts/permission';
import { useHighlightRange } from '../../../hooks/use-highlight-range';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { panelListEmptyBase64 } from './constant';

type IRuleItem = IRangeProtectionRule | IWorksheetProtectionRule;
export const SheetPermissionPanelList = () => {
    const [isCurrentSheet, setIsCurrentSheet] = useState(true);
    const [forceUpdateFlag, setForceUpdateFlag] = useState(false);
    const localeService = useDependency(LocaleService);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const worksheetProtectionModel = useDependency(WorksheetProtectionRuleModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sidebarService = useDependency(ISidebarService);
    const authzIoService = useDependency(IAuthzIoService);
    const permissionService = useDependency(IPermissionService);
    const usesManagerService = useDependency(UserManagerService);
    const currentUser = usesManagerService.getCurrentUser();
    const [currentRuleRanges, currentRuleRangesSet] = useState<IRange[]>([]);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);

    const _sheetRuleRefresh = useObservable(worksheetProtectionModel.ruleRefresh$, '');
    const _rangeRuleRefresh = useObservable(rangeProtectionRuleModel.ruleRefresh$, '');

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

    if (!workbook) {
        return null;
    }

    const unitId = workbook?.getUnitId();

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
                if (rule.permissionId) {
                    allRangePermissionId.push(rule.permissionId);
                }
            });
            const worksheetPermissionRule = worksheetProtectionModel.getRule(unitId, sheetId);
            if (worksheetPermissionRule?.permissionId) {
                allSheetPermissionId.push(worksheetPermissionRule.permissionId);
            }
        });

        const allPermissionId = [...allRangePermissionId, ...allSheetPermissionId];

        const allPermissionRule = await authzIoService.list({
            objectIDs: allPermissionId,
            unitID: unitId,
            actions: baseProtectionActions,
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
        const subscribe = workbook.activeSheet$.pipe(
            distinctUntilChanged((prevSheet, currSheet) => prevSheet?.getSheetId() === currSheet?.getSheetId())
        ).subscribe(async () => {
            const ruleList = await getRuleList(isCurrentSheet);
            setRuleList(ruleList);
        });
        return () => {
            subscribe.unsubscribe();
        };
    }, [isCurrentSheet]);

    useEffect(() => {
        const getRuleListByRefresh = async () => {
            if (_sheetRuleRefresh || _rangeRuleRefresh) {
                const ruleList = await getRuleList(true);
                setRuleList(ruleList);
            };
        };
        getRuleListByRefresh();
    }, [_sheetRuleRefresh, _rangeRuleRefresh]);

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

    useEffect(() => {
        sheetPermissionUserManagerService.reset();
    }, []);

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
        if (rule.subUnitId !== workbook.getActiveSheet().getSheetId()) {
            commandService.executeCommand(SetWorksheetActiveOperation.id, {
                unitId: rule.unitId,
                subUnitId: rule.subUnitId,
            });
        }

        const sidebarProps = {
            header: { title: 'permission.panel.title' },
            children: {
                label: UNIVER_SHEET_PERMISSION_PANEL,
                showDetail: true,
                rule: Tools.deepClone(rule),
                oldRule: Tools.deepClone(rule),
            },
            width: 330,
        };

        sidebarService.open(sidebarProps);
    };

    const handleChangeHeaderType = (isCurrentSheet: boolean) => {
        setIsCurrentSheet(isCurrentSheet);
    };

    const hasSetProtectPermission = permissionService.getPermissionPoint(new WorkbookCreateProtectPermission(unitId).id)?.value;

    return (
        <div className="univer-mt-2 univer-flex univer-h-[calc(100%-8px)] univer-flex-col">
            <div className="univer-flex univer-h-[30px] univer-py-2">
                <div className="univer-mr-5 univer-flex univer-cursor-pointer univer-flex-col univer-items-center" onClick={() => handleChangeHeaderType(true)}>
                    <div className={clsx('univer-h-6 univer-text-base univer-font-medium univer-leading-6', { 'univer-text-blue-500': isCurrentSheet })}>
                        {' '}
                        {localeService.t('permission.panel.currentSheet')}
                    </div>
                    <div className={clsx('univer-mt-1 univer-h-0.5 univer-w-6', { 'univer-bg-blue-500': isCurrentSheet })} />
                </div>
                <div className="univer-mr-5 univer-flex univer-cursor-pointer univer-flex-col univer-items-center" onClick={() => handleChangeHeaderType(false)}>
                    <div className={clsx('univer-h-6 univer-text-base univer-font-medium univer-leading-6', { 'univer-text-blue-500': !isCurrentSheet })}>{localeService.t('permission.panel.allSheet')}</div>
                    <div className={clsx('univer-mt-1 univer-h-0.5 univer-w-6', { 'univer-bg-blue-500': !isCurrentSheet })} />
                </div>
            </div>

            {ruleList?.length > 0
                ? (
                    <div>
                        {ruleList?.map((item) => {
                            const rule = allRuleMap.get(item.objectID);

                            if (!rule) {
                                return null;
                            }

                            const editAction = item.actions.find((action) => action.action === UnitAction.Edit);
                            const editPermission = editAction?.allowed;

                            const viewAction = item.actions.find((action) => action.action === UnitAction.View);
                            const viewPermission = viewAction?.allowed;

                            const manageCollaboratorAction = item.actions.find((action) => action.action === UnitAction.ManageCollaborator);
                            const deleteAction = item.actions.find((action) => action.action === UnitAction.Delete);

                            const hasManagerPermission = manageCollaboratorAction?.allowed || currentUser.userID === item.creator?.userID;
                            const hasDeletePermission = deleteAction?.allowed || currentUser.userID === item.creator?.userID;

                            let ruleName = '';

                            const targetSheet = workbook.getSheetBySheetId(rule.subUnitId);
                            const targetName = targetSheet?.getName();
                            if (rule.unitType === UnitObject.SelectRange) {
                                const ranges = (rule as IRangeProtectionRule).ranges;
                                const rangeStr = ranges?.length
                                    ? ranges.map((range) => {
                                        const v = serializeRange(range);
                                        return v === 'NaN' ? '' : v;
                                    }).filter((r) => !!r).join(',')
                                    : '';
                                ruleName = `${targetName}(${rangeStr})`;
                            } else if (rule.unitType === UnitObject.Worksheet) {
                                ruleName = targetName || '';
                            }

                            return (
                                <div
                                    key={item.objectID}
                                    className={clsx(`
                                      univer-mt-3 univer-rounded-lg univer-p-3
                                      hover:univer-bg-gray-50
                                    `, borderClassName)}
                                    onMouseMove={() => {
                                        const { subUnitId, unitType } = rule;
                                        const activeSheet = workbook.getActiveSheet();
                                        if (!activeSheet) {
                                            return false;
                                        }
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
                                    <div className="univer-flex univer-h-5 univer-justify-between univer-leading-5">
                                        <Tooltip title={ruleName}>
                                            <div
                                                className={`
                                                  univer-max-w-[200px] univer-text-ellipsis univer-font-medium
                                                `}
                                            >
                                                {ruleName}
                                            </div>
                                        </Tooltip>

                                        {(hasManagerPermission || hasDeletePermission) && (
                                            <div className="univer-flex univer-items-center">
                                                {hasManagerPermission && (
                                                    <Tooltip title={localeService.t('permission.panel.edit')}>
                                                        <div
                                                            className={`
                                                              univer-box-border univer-h-6 univer-rounded-sm univer-p-1
                                                              hover:univer-bg-gray-200
                                                            `}
                                                            onClick={() => handleEdit(rule as IPermissionPanelRule)}
                                                        >
                                                            <WriteSingle />
                                                        </div>
                                                    </Tooltip>
                                                )}
                                                {hasDeletePermission && (
                                                    <Tooltip title={localeService.t('permission.panel.delete')}>
                                                        <div
                                                            className={`
                                                              univer-box-border univer-h-6 univer-rounded-sm univer-p-1
                                                              hover:univer-bg-gray-200
                                                            `}
                                                            onClick={() => handleDelete(rule)}
                                                        >
                                                            <DeleteSingle />
                                                        </div>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="univer-my-2 univer-h-px univer-bg-gray-200" />
                                    <div>
                                        <div className="univer-flex univer-items-center">

                                            <Tooltip title={item.creator?.name ?? ''}>
                                                <div>
                                                    <Avatar src={item.creator?.avatar} className="univer-mr-1.5" size={24} />
                                                </div>
                                            </Tooltip>
                                            <span
                                                className={`
                                                  univer-h-4 univer-flex-grow univer-text-xs univer-text-gray-900
                                                  dark:univer-text-white
                                                `}
                                            >
                                                {localeService.t('permission.panel.created')}
                                            </span>
                                            <span
                                                className={`
                                                  univer-h-4 univer-text-xs univer-text-gray-900
                                                  dark:univer-text-white
                                                `}
                                            >
                                                {editPermission ? `${localeService.t('permission.panel.iCanEdit')}` : `${localeService.t('permission.panel.iCanNotEdit')}`}
                                            </span>

                                        </div>
                                        <div className="univer-mt-2 univer-flex univer-items-center">
                                            <span
                                                className={`
                                                  univer-h-4 univer-flex-grow univer-text-xs univer-text-gray-900
                                                  dark:univer-text-white
                                                `}
                                            >
                                                {localeService.t('permission.panel.viewPermission')}
                                            </span>
                                            <span
                                                className={`
                                                  univer-h-4 univer-text-xs univer-text-gray-900
                                                  dark:univer-text-white
                                                `}
                                            >
                                                {viewPermission ? `${localeService.t('permission.panel.iCanView')}` : `${localeService.t('permission.panel.iCanNotView')}`}
                                            </span>
                                        </div>
                                        {rule.description && (
                                            <Tooltip title={rule.description}>
                                                <div
                                                    className={`
                                                      univer-text-3 univer-max-w-64 univer-overflow-hidden
                                                      univer-text-ellipsis univer-whitespace-nowrap univer-text-gray-400
                                                      univer-mt-2]
                                                    `}
                                                >
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
                    <div
                        className="univer-flex univer-flex-1 univer-flex-col univer-items-center univer-justify-center"
                    >
                        <img width={240} height={120} src={panelListEmptyBase64} alt="" />
                        <p className="univer-w-60 univer-break-words univer-text-sm univer-text-gray-400">{localeService.t('permission.dialog.listEmpty')}</p>
                    </div>
                )}

            {hasSetProtectPermission && (
                <div className="univer-mt-auto univer-py-5">
                    <Button
                        className="univer-w-full"
                        variant="primary"
                        onClick={() => {
                            const sidebarProps = {
                                header: { title: `${localeService.t('permission.panel.title')}` },
                                children: {
                                    label: UNIVER_SHEET_PERMISSION_PANEL,
                                    showDetail: true,
                                },
                                width: 330,
                            };
                            sidebarService.open(sidebarProps);
                        }}
                    >
                        <div>+ </div>
                        {localeService.t('permission.button.addNewPermission')}
                    </Button>
                </div>
            )}
        </div>
    );
};
