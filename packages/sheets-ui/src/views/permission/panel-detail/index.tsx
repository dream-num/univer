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

import type { IRange, Workbook } from '@univerjs/core';
import type { ICollaborator, IUser } from '@univerjs/protocol';
import { IAuthzIoService, isValidRange, IUniverInstanceService, LocaleService, RANGE_TYPE, Rectangle, UniverInstanceType, useDependency, UserManagerService } from '@univerjs/core';
import { Avatar, FormLayout, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';

import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { RangeProtectionRuleModel, setEndForRange, SheetsSelectionsService, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { ComponentManager, IDialogService, ISidebarService, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RANGE_SELECTOR_COMPONENT_KEY } from '../../../common/keys';
import { UNIVER_SHEET_PERMISSION_USER_DIALOG, UNIVER_SHEET_PERMISSION_USER_DIALOG_ID } from '../../../consts/permission';
import { editState, SheetPermissionPanelModel, viewState } from '../../../services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import Spin from '../spin';
import { UserEmptyBase64 } from '../user-dialog/constant';
import styles from './index.module.less';

export const SheetPermissionPanelDetail = ({ fromSheetBar }: { fromSheetBar: boolean }) => {
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManagerService = useDependency(SheetsSelectionsService);
    const sheetPermissionPanelModel = useDependency(SheetPermissionPanelModel);
    const activeRule = useObservable(sheetPermissionPanelModel.rule$, sheetPermissionPanelModel.rule);
    const userManagerService = useDependency(UserManagerService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const authzIoService = useDependency(IAuthzIoService);
    const sidebarService = useDependency(ISidebarService);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const worksheetRuleModel = useDependency(WorksheetProtectionRuleModel);
    const componentManager = useDependency(ComponentManager);
    const RangeSelector = useMemo(() => componentManager.get(RANGE_SELECTOR_COMPONENT_KEY), []);

    const rangeErrorMsg = useObservable(sheetPermissionPanelModel.rangeErrorMsg$);

    const rangeSelectorActionsRef = useRef<any>({});
    const [isFocusRangeSelector, isFocusRangeSelectorSet] = useState(false);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheet = workbook.getActiveSheet()!;
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();

    const selectUserList = useObservable(sheetPermissionUserManagerService.selectUserList$, sheetPermissionUserManagerService.selectUserList);

    // The status of these two collaborators is updated directly by calling the interface, and will not be written to the snapshot or undoredo, so they are pulled in real time when they need to be displayed.
    const [editorGroupValue, setEditorGroupValue] = React.useState<editState>(selectUserList.length ? editState.designedUserCanEdit : editState.onlyMe);
    const [viewGroupValue, setViewGroupValue] = React.useState(viewState.othersCanView);
    const [loading, setLoading] = useState(!!activeRule?.permissionId);

    const [rangeInitialization, setRangeInitialization] = useState(false);

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

        const currentUser = userManagerService.getCurrentUser();
        sheetPermissionUserManagerService.setUserList(userList.filter((user) => user.subject?.userID !== currentUser.userID));

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
        return rangeErrorString === '' ? undefined : rangeErrorString;
    };

    useEffect(() => {
        const isEdit = activeRule?.permissionId;
        setRangeInitialization(true);
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
            selectionManagerService.clearCurrentSelections();
            selectionManagerService.addSelections([
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
        const ranges = selectionManagerService.getCurrentSelections()?.map((s) => s.range) ?? [];
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

            const collaborators = await authzIoService.listCollaborators({
                objectID: permissionId!,
                unitID: unitId,
            });
            const selectUserList: ICollaborator[] = collaborators.filter((user) => {
                return user.role === UnitRole.Editor;
            });
            sheetPermissionUserManagerService.setSelectUserList(selectUserList);
            sheetPermissionUserManagerService.setOldCollaboratorList(selectUserList);
        };
        if (activeRule?.permissionId) {
            getSelectUserList();
        } else {
            sheetPermissionUserManagerService.setSelectUserList([]);
            sheetPermissionUserManagerService.setOldCollaboratorList([]);
        }
    }, [activeRule?.permissionId]);

    useEffect(() => {
        if (!activeRule.permissionId) {
            sheetPermissionPanelModel.setRule({
                viewStatus: viewState.othersCanView,
            });
            return;
        }
        const getCollaboratorInit = async () => {
            try {
                const res = await authzIoService.list({
                    unitID: unitId,
                    objectIDs: [activeRule?.permissionId],
                    actions: [UnitAction.View, UnitAction.Edit],
                });
                if (!res.length) {
                    setViewGroupValue(viewState.othersCanView);
                    setEditorGroupValue(editState.onlyMe);
                    sheetPermissionPanelModel.setRule({
                        viewStatus: viewState.othersCanView,
                        editStatus: editState.onlyMe,
                    });
                } else {
                    const isAllCanView = res[0].scope?.read === ObjectScope.AllCollaborator;
                    const isSomeCanEdit = res[0].scope?.edit === ObjectScope.SomeCollaborator;
                    const viewValue = isAllCanView ? viewState.othersCanView : viewState.noOneElseCanView;
                    const editValue = isSomeCanEdit ? editState.designedUserCanEdit : editState.onlyMe;
                    setViewGroupValue(viewValue);
                    setEditorGroupValue(editValue);
                    sheetPermissionPanelModel.setRule({
                        viewStatus: viewValue,
                        editStatus: editValue,
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 100);
            }
        };
        getCollaboratorInit();
    }, [activeRule.permissionId]);

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

    const handleRangeChange = (rangeText: string) => {
        const newRange = rangeText.split(',').map(deserializeRangeWithSheet).map((item) => item.range);
        if (newRange.some((i) => !isValidRange(i) || i.endColumn < i.startColumn || i.endRow < i.startRow)) {
            return;
        }

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const transformedRange = newRange.map((range) => {
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
    };

    const handlePanelClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const handleOutClick = rangeSelectorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, isFocusRangeSelectorSet);
    };

    const rangeStr = activeRule?.ranges?.map((i) => serializeRange(i)).join(',');

    return (
        <div className={styles.permissionPanelDetailWrapper} onClick={handlePanelClick}>
            {/* <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.name')}>
                <Input
                    value={activeRule?.name ?? ''}
                    onChange={(v) => sheetPermissionPanelModel.setRule({ name: v.replace(/\s+/g, '') })}
                    className={clsx({ [styles.sheetPermissionPanelNameInputError]: !activeRule?.name })}
                />
                {!activeRule?.name && <span className={styles.sheetPermissionPanelNameInputErrorText}>{localeService.t('permission.panel.nameError')}</span>}
            </FormLayout> */}
            <Spin loading={loading}>
                <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.protectedRange')}>
                    {RangeSelector && rangeInitialization && (
                        <RangeSelector
                            unitId={unitId}
                            errorText={rangeErrorMsg}
                            subUnitId={subUnitId}
                            initValue={rangeStr}
                            onChange={handleRangeChange}
                            onFocus={() => isFocusRangeSelectorSet(true)}
                            // onVerify={handleVerify}
                            isFocus={isFocusRangeSelector}
                            actions={rangeSelectorActionsRef.current}
                        />
                    )}
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
                            setEditorGroupValue(v as editState);
                            sheetPermissionPanelModel.setRule({
                                editStatus: v as editState,
                            });
                        }}
                        className={styles.radioGroupVertical}
                    >
                        <Radio value={editState.onlyMe}>
                            <span className={styles.text}>{localeService.t('permission.panel.onlyICanEdit')}</span>
                        </Radio>
                        <Radio value={editState.designedUserCanEdit}>
                            <span className={styles.text}>{localeService.t('permission.panel.designedUserCanEdit')}</span>
                        </Radio>
                    </RadioGroup>
                </FormLayout>
                {editorGroupValue === 'designedUserCanEdit' && (
                    <div className={styles.sheetPermissionDesignPersonPanel}>

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

                    </div>
                )}
                <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.viewPermission')}>
                    <RadioGroup
                        value={viewGroupValue}
                        onChange={(v) => {
                            setViewGroupValue(v as viewState);
                            sheetPermissionPanelModel.setRule({
                                viewStatus: v as viewState,
                            });
                        }}
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
            </Spin>
        </div>
    );
};
