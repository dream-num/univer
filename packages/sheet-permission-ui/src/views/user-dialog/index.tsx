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

import React, { useState } from 'react';
import { Avatar, Button, Input } from '@univerjs/design';
import clsx from 'clsx';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import { IDialogService } from '@univerjs/ui';
import { type ICollaborator, UnitRole } from '@univerjs/protocol';
import { CheckMarkSingle } from '@univerjs/icons';
import { SheetPermissionUserManagerService } from '../../service';
import { UNIVER_SHEET_PERMISSION_USER_DIALOG_ID } from '../../const';
import styles from './index.module.less';
import { UserEmptyBase64 } from './constant';

export const SheetPermissionUserDialog = () => {
    const [inputValue, setInputValue] = React.useState('');
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const userList = sheetPermissionUserManagerService.userList;
    const searchUserList = userList.filter((item) => {
        return item.subject?.name.toLocaleLowerCase().includes(inputValue.toLocaleLowerCase()) && item.role !== UnitRole.Owner;
    });
    const [selectUserInfo, setSelectUserInfo] = useState<ICollaborator[]>(sheetPermissionUserManagerService.selectUserList);

    const handleChangeUser = (item: ICollaborator) => {
        const index = selectUserInfo?.findIndex((v) => v.subject?.userID === item.subject?.userID);
        if (index === -1) {
            const select: ICollaborator = { ...item };
            setSelectUserInfo([...selectUserInfo, select]);
        } else {
            const newSelectUserInfo = selectUserInfo.filter((v) => v.subject?.userID !== item.subject?.userID);
            setSelectUserInfo(newSelectUserInfo);
        }
    };

    return (
        <div className={styles.sheetPermissionUserDialogWrapper}>
            <div className={styles.sheetPermissionUserDialogSearch}>
                <Input
                    placeholder="search"
                    className={styles.sheetPermissionUserDialogSearchInput}
                    value={inputValue}
                    onChange={(v) => setInputValue(v)}
                />
            </div>
            <div className={styles.sheetPermissionUserList}>
                {searchUserList?.length > 0
                    ? (
                        <>
                            {searchUserList?.map((item) => {
                                return (
                                    <div key={item.subject?.userID} className={styles.sheetPermissionUserItem} onClick={() => handleChangeUser(item)}>
                                        <Avatar src={item.subject?.avatar} size={24} />
                                        <div className={styles.sheetPermissionUserItemName}>{item.subject?.name}</div>
                                        {selectUserInfo?.findIndex((v) => v.subject?.userID === item.subject?.userID) !== -1 && (<div><CheckMarkSingle /></div>)}
                                    </div>
                                );
                            })}
                        </>
                    )
                    : (
                        <div className={styles.sheetPermissionUserListEmpty}>
                            <img width={240} height={120} src={UserEmptyBase64} alt="" />
                            <p className={styles.sheetPermissionUserListEmptyText}>no designated person , Share link to invite specific people</p>
                        </div>
                    )}
            </div>
            <div className={styles.sheetPermissionSplit}></div>
            <div className={styles.sheetPermissionUserDialogFooter}>

                <Button className={styles.sheetPermissionUserDialogButton} onClick={() => dialogService.close(UNIVER_SHEET_PERMISSION_USER_DIALOG_ID)}>

                    {localeService.t('permission.button.cancel')}
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        sheetPermissionUserManagerService.setSelectUserList(selectUserInfo);
                        dialogService.close(UNIVER_SHEET_PERMISSION_USER_DIALOG_ID);
                    }}
                    className={clsx(styles.sheetPermissionUserDialogFooterConfirm, styles.sheetPermissionUserDialogButton)}
                >
                    {localeService.t('permission.button.confirm')}
                </Button>
            </div>
        </div>
    );
};
