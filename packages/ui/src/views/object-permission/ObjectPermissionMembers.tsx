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
import type { LocaleKey } from '../../locale/types';
import { LocaleService } from '@univerjs/core';
import { Avatar, borderClassName, Button, Checkbox, clsx, Dialog, Input, Select, Separator } from '@univerjs/design';
import { UnitRole } from '@univerjs/protocol';
import { useState } from 'react';
import { useDependency } from '../../utils/di';

interface IObjectPermissionMembersProps {
    candidates: ICollaborator[];
    value: ICollaborator[];
    disabled: boolean;
    onEditStart: () => void;
    onChange: (value: ICollaborator[]) => void;
}

export function ObjectPermissionMembers({ candidates, value, disabled, onEditStart, onChange }: IObjectPermissionMembersProps) {
    const locale = useDependency(LocaleService);
    const [draft, setDraft] = useState<ICollaborator[] | null>(null);
    const [query, setQuery] = useState('');
    const search = query.trim().toLocaleLowerCase();
    const users = candidates.filter((user) => (
        (user.role === UnitRole.Owner || user.role === UnitRole.Editor) &&
        [user.subject?.name, user.subject?.userID, user.id].some((text) => text?.toLocaleLowerCase().includes(search))
    ));
    return (
        <div className={clsx('univer-flex univer-h-[270px] univer-flex-col univer-rounded-lg univer-p-3', borderClassName)}>
            <div className="univer-flex univer-items-center univer-justify-between univer-text-sm">
                <span>{locale.t<LocaleKey>('ui.objectPermission.members')}</span>
                <Button
                    variant="link"
                    disabled={disabled}
                    onClick={() => {
                        setQuery('');
                        setDraft([...value]);
                        onEditStart();
                    }}
                >
                    {locale.t<LocaleKey>('ui.objectPermission.addPeople')}
                </Button>
            </div>
            <Separator className="univer-my-2" />
            <div className="univer-flex-1 univer-overflow-auto">
                {value.length === 0 && <p className="univer-text-sm univer-text-gray-500">{locale.t<LocaleKey>('ui.objectPermission.noPeople')}</p>}
                {value.map((user) => (
                    <div
                        key={user.id}
                        role="group"
                        aria-label={user.subject?.name || user.id}
                        className="univer-mb-2 univer-flex univer-items-center univer-gap-2"
                    >
                        <Avatar size={24} src={user.subject?.avatar} />
                        <span className="univer-min-w-0 univer-flex-1 univer-truncate" title={user.subject?.name || user.id}>{user.subject?.name || user.id}</span>
                        <Select
                            className="!univer-w-28 univer-min-w-0 univer-shrink-0"
                            borderless
                            disabled={disabled}
                            value="edit"
                            options={[
                                { label: locale.t<LocaleKey>('ui.objectPermission.canEdit'), value: 'edit' },
                                { label: locale.t<LocaleKey>('ui.objectPermission.removePerson'), value: 'remove' },
                            ]}
                            onChange={(action) => {
                                if (action === 'remove') {
                                    onChange(value.filter((member) => member.id !== user.id));
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
            {draft != null && (
                <Dialog
                    open
                    width={400}
                    title={locale.t<LocaleKey>('ui.objectPermission.addPeople')}
                    onClose={() => setDraft(null)}
                    footer={(
                        <div className="univer-flex univer-justify-end univer-gap-2">
                            <Button onClick={() => setDraft(null)}>{locale.t<LocaleKey>('ui.objectPermission.cancel')}</Button>
                            <Button
                                variant="primary"
                                disabled={disabled}
                                onClick={() => {
                                    onChange(draft.map((user) => ({ ...user, role: UnitRole.Editor })));
                                    setDraft(null);
                                }}
                            >
                                {locale.t<LocaleKey>('ui.objectPermission.confirmPeople')}
                            </Button>
                        </div>
                    )}
                >
                    <Input
                        className="univer-w-full"
                        value={query}
                        onChange={setQuery}
                        placeholder={locale.t<LocaleKey>('ui.objectPermission.searchPeople')}
                        aria-label={locale.t<LocaleKey>('ui.objectPermission.searchPeople')}
                    />
                    <div
                        className="
                          univer-mt-3 univer-flex univer-h-60 univer-flex-col univer-gap-3 univer-overflow-auto
                        "
                    >
                        {users.length === 0 && <p role="status" className="univer-text-sm univer-text-gray-500">{locale.t<LocaleKey>('ui.objectPermission.noMatchingPeople')}</p>}
                        {users.map((user) => (
                            <Checkbox
                                key={user.id}
                                disabled={disabled}
                                checked={draft.some((member) => member.id === user.id)}
                                onChange={(checked) => setDraft(checked
                                    ? [...draft.filter((member) => member.id !== user.id), user]
                                    : draft.filter((member) => member.id !== user.id))}
                            >
                                <span className="univer-flex univer-items-center univer-gap-2">
                                    <Avatar size={24} src={user.subject?.avatar} />
                                    <span>{user.subject?.name || user.id}</span>
                                </span>
                            </Checkbox>
                        ))}
                    </div>
                </Dialog>
            )}
        </div>
    );
}
