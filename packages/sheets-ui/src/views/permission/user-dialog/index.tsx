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

import type { ICollaborator } from '@univerjs/protocol';
import { LocaleService } from '@univerjs/core';
import { Avatar, Button, Input } from '@univerjs/design';
import { CheckMarkSingle } from '@univerjs/icons';
import { UnitRole } from '@univerjs/protocol';
import { IDialogService, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { UNIVER_SHEET_PERMISSION_USER_DIALOG_ID } from '../../../consts/permission';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { UserEmptyBase64 } from './constant';

export const SheetPermissionUserDialog = () => {
    const [inputValue, setInputValue] = useState('');
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const userList = useObservable(sheetPermissionUserManagerService.userList$, sheetPermissionUserManagerService.userList);
    const searchUserList = userList?.filter((item) => {
        return item.subject?.name.toLocaleLowerCase().includes(inputValue.toLocaleLowerCase()) && item.role === UnitRole.Editor;
    }) ?? [];
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
        <div>
            <div>
                <Input
                    className="univer-w-full"
                    placeholder={localeService.t('permission.dialog.search')}
                    value={inputValue}
                    onChange={(v) => setInputValue(v)}
                />
            </div>
            <div className="univer-h-60 univer-overflow-y-auto">
                {searchUserList?.length > 0
                    ? (
                        <>
                            {searchUserList?.map((item) => {
                                return (
                                    <div
                                        key={item.subject?.userID}
                                        className={`
                                          univer-my-2 univer-flex univer-items-center univer-rounded-md
                                          hover:univer-bg-gray-50
                                        `}
                                        onClick={() => handleChangeUser(item)}
                                    >
                                        <Avatar src={item.subject?.avatar} size={24} />
                                        <div className="univer-ml-1.5 univer-flex-1">{item.subject?.name}</div>
                                        {selectUserInfo?.findIndex((v) => v.subject?.userID === item.subject?.userID) !== -1 && (<div><CheckMarkSingle /></div>)}
                                    </div>
                                );
                            })}
                        </>
                    )
                    : (
                        <div className="univer-flex univer-h-full univer-flex-col univer-items-center">
                            <img
                                className="univer-w-full"
                                src={UserEmptyBase64}
                                alt="empty list"
                                draggable={false}
                            />
                            <p className="univer-text-sm univer-text-gray-400">
                                {localeService.t('permission.dialog.userEmpty')}
                            </p>
                        </div>
                    )}
            </div>
            <div className="univer-h-px univer-w-full univer-bg-gray-200" />
            <div className="univer-flex univer-items-center univer-justify-end univer-gap-1 univer-py-2">
                <Button
                    onClick={() => dialogService.close(UNIVER_SHEET_PERMISSION_USER_DIALOG_ID)}
                >
                    {localeService.t('permission.button.cancel')}
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        sheetPermissionUserManagerService.setSelectUserList(selectUserInfo);
                        dialogService.close(UNIVER_SHEET_PERMISSION_USER_DIALOG_ID);
                    }}
                >
                    {localeService.t('permission.button.confirm')}
                </Button>
            </div>
        </div>
    );
};
