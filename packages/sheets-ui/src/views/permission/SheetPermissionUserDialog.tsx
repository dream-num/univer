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
import { IAuthzIoService, LocaleService } from '@univerjs/core';
import { ActionRow, Avatar, Button, clsx, Input, scrollbarClassName } from '@univerjs/design';
import { CheckMarkIcon } from '@univerjs/icons';
import { UnitRole } from '@univerjs/protocol';
import { IDialogService, useDependency, useObservable } from '@univerjs/ui';
import { useRef, useState } from 'react';
import type { LocaleKey } from '../../locale/types';
import { UNIVER_SHEET_PERMISSION_USER_DIALOG_ID } from '../../consts/permission';
import { SheetPermissionUserManagerService } from '../../services/permission/sheet-permission-user-list.service';

export interface ISheetPermissionUserDialogProps {
    ActionRowComponent?: typeof ActionRow;
}

export const SheetPermissionUserDialog = ({ ActionRowComponent = ActionRow }: ISheetPermissionUserDialogProps = {}) => {
    const [inputValue, setInputValue] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const sheetPermissionUserManagerService = useDependency(SheetPermissionUserManagerService);
    const authzIoService = useDependency(IAuthzIoService);

    const userList = useObservable(sheetPermissionUserManagerService.userList$, sheetPermissionUserManagerService.userList);
    const searchQuery = inputValue.trim().toLocaleLowerCase();
    const searchUserList = userList?.filter((item) => {
        return item.subject?.name.toLocaleLowerCase().includes(searchQuery) && (item.role === UnitRole.Owner || item.role === UnitRole.Editor);
    }) ?? [];
    const [selectUserInfo, setSelectUserInfo] = useState<ICollaborator[]>(sheetPermissionUserManagerService.selectUserList);

    const cfgEnableObjInherit = authzIoService.getCfgEnableObjInherit?.() ?? false;

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
                    ref={searchInputRef}
                    aria-label={localeService.t<LocaleKey>('sheets-ui.permission.dialog.search')}
                    className="univer-w-full"
                    placeholder={localeService.t<LocaleKey>('sheets-ui.permission.dialog.search')}
                    value={inputValue}
                    onChange={(v) => setInputValue(v)}
                />
            </div>
            <div className={clsx('univer-h-60 univer-min-w-72 univer-overflow-y-auto', scrollbarClassName)}>
                {searchUserList?.length > 0
                    ? searchUserList?.map((item) => {
                        if (cfgEnableObjInherit && item.role === UnitRole.Owner) {
                            return (
                                <div
                                    key={item.subject?.userID}
                                    className={`
                                      univer-my-2 univer-flex univer-cursor-not-allowed univer-items-center
                                      univer-rounded-md
                                    `}
                                >
                                    <Avatar src={item.subject?.avatar} size={24} />
                                    <div className="univer-mx-1.5 univer-flex-1">{item.subject?.name}</div>
                                    <div className="univer-text-xs univer-text-rose-600">{localeService.t<LocaleKey>('sheets-ui.permission.dialog.ownerInherit')}</div>
                                </div>
                            );
                        }

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
                                <div className="univer-mx-1.5 univer-flex-1">{item.subject?.name}</div>
                                {item.role === UnitRole.Owner && (
                                    <div className="univer-text-xs univer-text-rose-600">{localeService.t<LocaleKey>('sheets-ui.permission.dialog.ownerWithoutInherit')}</div>
                                )}
                                {selectUserInfo?.findIndex((v) => v.subject?.userID === item.subject?.userID) !== -1 && (
                                    <div>
                                        <CheckMarkIcon
                                            className="univer-ml-1.5"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })
                    : (
                        <div
                            className={`
                              univer-flex univer-h-full univer-flex-col univer-items-center univer-justify-center
                              univer-gap-2 univer-px-6 univer-text-center
                            `}
                        >
                            <div role="status" className="univer-flex univer-flex-col univer-gap-2">
                                <p
                                    className={`
                                      univer-m-0 univer-text-sm univer-font-medium univer-text-gray-900
                                      dark:!univer-text-gray-0
                                    `}
                                >
                                    {localeService.t<LocaleKey>(searchQuery
                                        ? 'sheets-ui.permission.dialog.searchEmpty'
                                        : 'sheets-ui.permission.dialog.candidatesEmpty')}
                                </p>
                                {searchQuery && (
                                    <p
                                        className={`
                                          univer-m-0 univer-text-sm univer-leading-relaxed univer-text-gray-500
                                          dark:!univer-text-gray-200
                                        `}
                                    >
                                        {localeService.t<LocaleKey>('sheets-ui.permission.dialog.searchEmptyDescription')}
                                    </p>
                                )}
                            </div>
                            {searchQuery && (
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setInputValue('');
                                        searchInputRef.current?.focus();
                                    }}
                                >
                                    {localeService.t<LocaleKey>('sheets-ui.permission.button.clearSearch')}
                                </Button>
                            )}
                        </div>
                    )}
            </div>
            <div className="univer-h-px univer-w-full univer-bg-gray-200" />
            <ActionRowComponent
                className="univer-flex univer-items-center univer-justify-end univer-gap-1 univer-py-2"
            >
                <Button
                    onClick={() => dialogService.close(UNIVER_SHEET_PERMISSION_USER_DIALOG_ID)}
                >
                    {localeService.t<LocaleKey>('sheets-ui.permission.button.cancel')}
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        sheetPermissionUserManagerService.setSelectUserList(selectUserInfo);
                        dialogService.close(UNIVER_SHEET_PERMISSION_USER_DIALOG_ID);
                    }}
                >
                    {localeService.t<LocaleKey>('sheets-ui.permission.button.confirm')}
                </Button>
            </ActionRowComponent>
        </div>
    );
};
