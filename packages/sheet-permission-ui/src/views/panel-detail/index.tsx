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
import { Avatar, FormLayout, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IRange, Workbook } from '@univerjs/core';
import { createInternalEditorID, IAuthzIoService, isValidRange, IUniverInstanceService, LocaleService, RANGE_TYPE, Rectangle, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { IDialogService, ISidebarService, RangeSelector, useObservable } from '@univerjs/ui';
import { RangeProtectionRuleModel, SelectionManagerService, setEndForRange, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { serializeRange } from '@univerjs/engine-formula';
import type { ICollaborator, IUser } from '@univerjs/protocol';
import { UnitObject, UnitRole } from '@univerjs/protocol';
import clsx from 'clsx';
import { SheetPermissionUserManagerService } from '../../service';
import { UNIVER_SHEET_PERMISSION_USER_DIALOG, UNIVER_SHEET_PERMISSION_USER_DIALOG_ID } from '../../const';

import { SheetPermissionPanelModel, viewState } from '../../service/sheet-permission-panel.model';
import { UserEmptyBase64 } from '../user-dialog/constant';
import Spin from '../spin';
import styles from './index.module.less';

export const SheetPermissionPanelDetail = ({ fromSheetBar }: { fromSheetBar: boolean }) => {
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SelectionManagerService);
    const sheetPermissionPanelModel = useDependency(SheetPermissionPanelModel);
    const activeRule = useObservable(sheetPermissionPanelModel.rule$, sheetPermissionPanelModel.rule);
    const userManagerService = useDependency(UserManagerService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const authzIoService = useDependency(IAuthzIoService);
    const sidebarService = useDependency(ISidebarService);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const worksheetRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeErrorMsg = useObservable(sheetPermissionPanelModel.rangeErrorMsg$);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet()!;
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();

    const selectUserList = useObservable(sheetPermissionUserManagerService.selectUserList$, sheetPermissionUserManagerService.selectUserList);

    const [editorGroupValue, setEditorGroupValue] = React.useState(selectUserList.length ? 'designedUserCanEdit' : 'onlyMe');
    const [viewGroupValue, setViewGroupValue] = React.useState(viewState.othersCanView);
    const [loading, setLoading] = useState(false);

    const handleAddPerson = async () => {
        const userList = await authzIoService.listCollaborators({
            objectID: unitId,
            unitID: unitId,
        });
        userList.forEach((user) => {
            if (user?.subject) {
                userManagerService.addUser(user.subject as IUser);
            }
        });

        sheetPermissionUserManagerService.setUserList(userList);

        dialogService.open({
            id: UNIVER_SHEET_PERMISSION_USER_DIALOG_ID,
            title: { title: '' },
            children: { label: UNIVER_SHEET_PERMISSION_USER_DIALOG },
            width: 280,
            destroyOnClose: true,
            onClose: () => dialogService.close(UNIVER_SHEET_PERMISSION_USER_DIALOG_ID),
            className: 'sheet-permission-user-dialog',
        });
    };

    const checkRangeValid = (permissionRanges: IRange[]) => {
        let rangeErrorString = '';
        if (permissionRanges.length === 0) {
            rangeErrorString = localeService.t('permission.panel.emptyRangeError');
        } else if (permissionRanges.length > 1) {
            let hasLap = false;
            for (let i = 0; i < permissionRanges.length; i++) {
                for (let j = i + 1; j < permissionRanges.length; j++) {
                    if (Rectangle.intersects(permissionRanges[i], permissionRanges[j])) {
                        hasLap = true;
                        break;
                    }
                }
                if (hasLap) {
                    break;
                }
            }
            if (hasLap) {
                rangeErrorString = localeService.t('permission.panel.rangeOverlapError');
            }
        }
        if (!rangeErrorString) {
            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
            if (worksheetRule && !activeRule?.permissionId) {
                rangeErrorString = localeService.t('permission.panel.rangeOverlapOverPermissionError');
                return rangeErrorString;
            }
            const lapRule = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                return rule.permissionId !== activeRule?.permissionId;
            }).find((rule) => {
                return rule.ranges.some((ruleRange) => {
                    return permissionRanges.some((r) => Rectangle.intersects(ruleRange, r));
                });
            });
            const lapRange = lapRule?.ranges.find((range) => {
                return permissionRanges.some((r) => Rectangle.intersects(range, r));
            });
            if (lapRange) {
                rangeErrorString = localeService.t('permission.panel.rangeOverlapOverPermissionError');
            }
        }
        return rangeErrorString;
    };

    useEffect(() => {
        const isEdit = activeRule?.permissionId;
        if (isEdit) {
            if (activeRule.unitType === UnitObject.Worksheet) {
                sheetPermissionPanelModel.setRule({
                    ranges: [{
                        startRow: 0,
                        startColumn: 0,
                        endRow: worksheet.getRowCount() - 1,
                        endColumn: worksheet.getColumnCount() - 1,
                        rangeType: RANGE_TYPE.ALL,
                    }],
                });
            }
            return;
        }
        if (fromSheetBar) {
            selectionManagerService.clear();
            selectionManagerService.add([
                {
                    primary: null,
                    style: null,
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: worksheet.getRowCount() - 1,
                        endColumn: worksheet.getColumnCount() - 1,
                        rangeType: RANGE_TYPE.ALL,
                    },
                },
            ]);
        }
        const ranges = selectionManagerService.getSelectionRanges() ?? [];
        const rangeErrorString = checkRangeValid(ranges);
        sheetPermissionPanelModel.setRangeErrorMsg(rangeErrorString);
        const rangeStr = ranges?.length
            ? ranges.map((range) => {
                const v = serializeRange(range);
                return v === 'NaN' ? '' : v;
            }).filter((r) => !!r).join(',')
            : '';
        const sheetName = worksheet.getName();
        sheetPermissionPanelModel.setRule({
            ranges,
            name: fromSheetBar ? `${sheetName}` : `${sheetName}(${rangeStr})`,
            unitId,
            subUnitId,
            unitType: fromSheetBar ? UnitObject.Worksheet : UnitObject.SelectRange,

        });
    }, [activeRule?.permissionId, fromSheetBar, selectionManagerService, sheetPermissionPanelModel, subUnitId, unitId, worksheet]);

    useEffect(() => {
        const getSelectUserList = async () => {
            const permissionId = activeRule?.permissionId;
            setLoading(true);
            const collaborators = await authzIoService.listCollaborators({
                objectID: permissionId!,
                unitID: unitId,
            });
            const selectUserList: ICollaborator[] = collaborators.filter((user) => {
                return user.role === UnitRole.Editor;
            });
            sheetPermissionUserManagerService.setSelectUserList(selectUserList);
            setLoading(false);
            if (selectUserList?.length > 0) {
                setEditorGroupValue('designedUserCanEdit');
            }
            const readerList = collaborators.filter((user) => {
                return user.role === UnitRole.Reader;
            });

            if (readerList.length === 0) {
                setViewGroupValue(viewState.noOneElseCanView);
            }

            sheetPermissionUserManagerService.setOldCollaboratorList(selectUserList.concat(readerList));
        };
        if (activeRule?.permissionId) {
            getSelectUserList();
        } else {
            sheetPermissionUserManagerService.setSelectUserList([]);
            setEditorGroupValue('onlyMe');
        }
    }, [activeRule?.permissionId]);

    useEffect(() => {
        const getListCollaborators = async () => {
            const userList = await authzIoService.listCollaborators({
                objectID: unitId,
                unitID: unitId,
            });
            userList.forEach((user) => {
                if (user?.subject) {
                    userManagerService.addUser(user.subject as IUser);
                }
            });

            sheetPermissionUserManagerService.setUserList(userList.filter((user) => user.role === UnitRole.Editor));
            sheetPermissionUserManagerService.setAllUserList(userList.filter((user) => user.role === UnitRole.Editor || user.role === UnitRole.Reader));
        };
        getListCollaborators();
    }, []);

    useEffect(() => {
        sheetPermissionPanelModel.setRule({
            viewStatus: viewGroupValue,
        });
    }, [sheetPermissionPanelModel, viewGroupValue]);

    useEffect(() => {
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return;
        const activeSheetSubscribe = workbook.activeSheet$.subscribe((sheet) => {
            if (sheet?.getSheetId() !== subUnitId) {
                sidebarService.close();
            }
        });
        return () => {
            activeSheetSubscribe.unsubscribe();
        };
    }, [sidebarService, subUnitId, univerInstanceService]);

    const tmp = activeRule?.ranges?.map((i) => serializeRange(i)).join(',');

    return (
        <div className={styles.permissionPanelDetailWrapper}>
            {/* <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.name')}>
                <Input
                    value={activeRule?.name ?? ''}
                    onChange={(v) => sheetPermissionPanelModel.setRule({ name: v.replace(/\s+/g, '') })}
                    className={clsx({ [styles.sheetPermissionPanelNameInputError]: !activeRule?.name })}
                />
                {!activeRule?.name && <span className={styles.sheetPermissionPanelNameInputErrorText}>{localeService.t('permission.panel.nameError')}</span>}
            </FormLayout> */}
            <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.protectedRange')}>
                <RangeSelector
                    className={clsx(styles.permissionRangeSelector)}
                    textEditorClassName={clsx({ [styles.permissionRangeSelectorError]: rangeErrorMsg })}
                    value={activeRule?.ranges?.map((i) => serializeRange(i)).join(',')}
                    id={createInternalEditorID('sheet-permission-panel')}
                    openForSheetUnitId={unitId}
                    openForSheetSubUnitId={subUnitId}
                    onChange={(newRange) => {
                        if (newRange.some((i) => !isValidRange(i.range) || i.range.endColumn < i.range.startColumn || i.range.endRow < i.range.startRow)) {
                            return;
                        }

                        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                        const worksheet = workbook.getActiveSheet()!;
                        const unitId = workbook.getUnitId();
                        const subUnitId = worksheet.getSheetId();
                        const transformedRange = newRange.map((i) => {
                            const range = { ...i.range };
                            const rowCount = worksheet.getRowCount();
                            const colCount = worksheet.getColumnCount();
                            setEndForRange(range, rowCount, colCount);
                            return range;
                        });
                        const rangeErrorString = checkRangeValid(transformedRange);
                        sheetPermissionPanelModel.setRangeErrorMsg(rangeErrorString);
                        if (rangeErrorString) return;

                        const sheetName = worksheet.getName();
                        const rangeStr = transformedRange.map((range) => {
                            const v = serializeRange(range);
                            return v === 'NaN' ? '' : v;
                        }).filter((r) => !!r).join(',');

                        const rule = {
                            ranges: transformedRange,
                            unitId,
                            subUnitId,
                            unitType: UnitObject.SelectRange,
                            name: `${sheetName}(${rangeStr})`,
                        };
                        if (rule.ranges.length === 1) {
                            const { startRow, endRow, startColumn, endColumn } = rule.ranges[0];
                            if (startRow === 0 && endRow === worksheet.getRowCount() - 1 && startColumn === 0 && worksheet.getColumnCount() - 1 === endColumn) {
                                rule.unitType = UnitObject.Worksheet;
                                rule.name = `${sheetName}`;
                            }
                        }

                        sheetPermissionPanelModel.setRule(rule);
                    }}
                />
                {rangeErrorMsg && <span className={styles.sheetPermissionPanelNameInputErrorText}>{rangeErrorMsg}</span>}
            </FormLayout>
            <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.permissionDirection')}>
                <Input
                    value={activeRule?.description ?? ''}
                    onChange={(v) => sheetPermissionPanelModel.setRule({ description: v })}
                    placeholder={localeService.t('permission.panel.permissionDirectionPlaceholder')}
                />
            </FormLayout>
            <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.editPermission')}>
                <RadioGroup
                    value={editorGroupValue}
                    onChange={(v) => {
                        setEditorGroupValue(v as string);
                        if (v === 'onlyMe') {
                            sheetPermissionUserManagerService.setSelectUserList([]);
                        }
                    }}
                    className={styles.radioGroupVertical}
                >
                    <Radio value="onlyMe">
                        <span className={styles.text}>{localeService.t('permission.panel.onlyICanEdit')}</span>
                    </Radio>
                    <Radio value="designedUserCanEdit">
                        <span className={styles.text}>{localeService.t('permission.panel.designedUserCanEdit')}</span>
                    </Radio>
                </RadioGroup>
            </FormLayout>
            {editorGroupValue === 'designedUserCanEdit' && (
                <div className={styles.sheetPermissionDesignPersonPanel}>
                    <Spin loading={loading}>

                        <div className={styles.sheetPermissionDesignPersonPanelHeader}>
                            <span>{localeService.t('permission.panel.designedPerson')}</span>
                            <span className={styles.sheetPermissionDesignPersonPanelHeaderAdd} onClick={handleAddPerson}>{localeService.t('permission.panel.addPerson')}</span>
                        </div>
                        <div className={styles.sheetPermissionDesignPersonPanelSplit}></div>
                        <div className={styles.sheetPermissionDesignPersonPanelContent}>
                            {selectUserList?.length > 0
                                ? selectUserList.map((item) => {
                                    return (
                                        <div key={item.subject?.userID} className={styles.sheetPermissionDesignPersonPanelContentItem}>
                                            <Avatar size={24} src={item.subject?.avatar} />
                                            <span className={styles.sheetPermissionDesignPersonPanelContentItemName}>{item.subject?.name}</span>
                                            <Select
                                                className={styles.sheetPermissionDesignPersonPanelContentItemSelect}
                                                value="edit"
                                                onChange={(v) => {
                                                    if (v === 'delete') {
                                                        sheetPermissionUserManagerService.setSelectUserList(selectUserList.filter((i) => i.subject?.userID !== item.subject?.userID));
                                                    }
                                                }}
                                                options={[
                                                    { label: `${localeService.t('permission.panel.canEdit')}`, value: 'edit' },
                                                    { label: `${localeService.t('permission.panel.delete')}`, value: 'delete' },
                                                ]}
                                            />
                                        </div>
                                    );
                                })
                                : (
                                    <div className={styles.sheetPermissionUserListEmpty}>
                                        <img width={240} height={120} src={UserEmptyBase64} alt="" />
                                        <p className={styles.sheetPermissionUserListEmptyText}>{localeService.t('permission.dialog.userEmpty')}</p>
                                    </div>
                                )}
                        </div>

                    </Spin>
                </div>
            )}
            <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.viewPermission')}>
                <RadioGroup
                    value={viewGroupValue}
                    onChange={(v) => setViewGroupValue(v as viewState)}
                    className={styles.radioGroupVertical}
                >
                    <Radio value={viewState.othersCanView}>
                        <span className={styles.text}>{localeService.t('permission.panel.othersCanView')}</span>
                    </Radio>
                    <Radio value={viewState.noOneElseCanView}>
                        <span className={styles.text}>{localeService.t('permission.panel.noOneElseCanView')}</span>
                    </Radio>
                </RadioGroup>
            </FormLayout>
        </div>
    );
};
