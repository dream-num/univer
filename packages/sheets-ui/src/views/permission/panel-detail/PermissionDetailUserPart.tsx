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

import type { Workbook } from '@univerjs/core';
import type { ICollaborator } from '@univerjs/protocol';
import { IAuthzIoService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency, useObservable, UserManagerService } from '@univerjs/core';
import { Avatar, FormLayout, Radio, RadioGroup, Select } from '@univerjs/design';
import { UnitRole } from '@univerjs/protocol';
import { EditStateEnum, ViewStateEnum } from '@univerjs/sheets';
import { IDialogService } from '@univerjs/ui';
import React, { useEffect } from 'react';
import { UNIVER_SHEET_PERMISSION_USER_DIALOG, UNIVER_SHEET_PERMISSION_USER_DIALOG_ID } from '../../../consts/permission';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { UserEmptyBase64 } from '../user-dialog/constant';
import styles from './index.module.less';

interface IPermissionDetailUserPartProps {
    editState: EditStateEnum;
    onEditStateChange: (v: EditStateEnum) => void;
    viewState: ViewStateEnum;
    onViewStateChange: (v: ViewStateEnum) => void;
    permissionId: string;
}

export const PermissionDetailUserPart = (props: IPermissionDetailUserPartProps) => {
    const { editState, onEditStateChange, viewState, onViewStateChange, permissionId } = props;
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const authzIoService = useDependency(IAuthzIoService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const userManagerService = useDependency(UserManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectUserList = useObservable(sheetPermissionUserManagerService.selectUserList$, sheetPermissionUserManagerService.selectUserList);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const worksheet = workbook?.getActiveSheet();
    if (!workbook || !worksheet) {
        return null;
    }
    const unitId = workbook.getUnitId();

    const handleAddPerson = async () => {
        const userList = await authzIoService.listCollaborators({
            objectID: unitId,
            unitID: unitId,
        });

        const currentUser = userManagerService.getCurrentUser();
        sheetPermissionUserManagerService.setCanEditUserList(userList.filter((user) => user.subject?.userID !== currentUser.userID));
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

    useEffect(() => {
        const getSelectUserList = async () => {
            const collaborators = await authzIoService.listCollaborators({
                objectID: permissionId!,
                unitID: unitId,
            });
            const selectUserList: ICollaborator[] = collaborators.filter((user) => {
                return user.role === UnitRole.Editor;
            });
            if (selectUserList.length > 0) {
                onEditStateChange(EditStateEnum.DesignedUserCanEdit);
            }
            sheetPermissionUserManagerService.setSelectUserList(selectUserList);
            sheetPermissionUserManagerService.setOldCollaboratorList(selectUserList);
        };
        if (permissionId) {
            getSelectUserList();
        } else {
            sheetPermissionUserManagerService.setSelectUserList([]);
            sheetPermissionUserManagerService.setOldCollaboratorList([]);
        }
    }, []);

    return (
        <>
            <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.editPermission')}>
                <RadioGroup
                    value={editState}
                    onChange={(v) => onEditStateChange(v as EditStateEnum)}
                    className={styles.radioGroupVertical}
                >
                    <Radio value={EditStateEnum.OnlyMe}>
                        <span className={styles.text}>{localeService.t('permission.panel.onlyICanEdit')}</span>
                    </Radio>
                    <Radio value={EditStateEnum.DesignedUserCanEdit}>
                        <span className={styles.text}>{localeService.t('permission.panel.designedUserCanEdit')}</span>
                    </Radio>
                </RadioGroup>
            </FormLayout>
            {editState === EditStateEnum.DesignedUserCanEdit && (
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
                    value={viewState}
                    onChange={(v) => onViewStateChange(v as ViewStateEnum)}
                    className={styles.radioGroupVertical}
                >
                    <Radio value={ViewStateEnum.OthersCanView}>
                        <span className={styles.text}>{localeService.t('permission.panel.othersCanView')}</span>
                    </Radio>
                    <Radio value={ViewStateEnum.NoOneElseCanView}>
                        <span className={styles.text}>{localeService.t('permission.panel.noOneElseCanView')}</span>
                    </Radio>
                </RadioGroup>
            </FormLayout>
        </>
    );
};
