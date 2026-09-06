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
import { IAuthzIoService, LocaleService, UserManagerService } from '@univerjs/core';
import { Avatar, borderClassName, Button, Checkbox, clsx, Input } from '@univerjs/design';
import { UnitRole } from '@univerjs/protocol';
import { useEffect, useState } from 'react';
import { useDependency } from '../../utils/di';

interface IObjectPermissionMembersProps {
    unitId: string;
    value: ICollaborator[];
    disabled: boolean;
    onChange: (value: ICollaborator[]) => void;
}

export function ObjectPermissionMembers({ unitId, value, disabled, onChange }: IObjectPermissionMembersProps) {
    const locale = useDependency(LocaleService);
    const authz = useDependency(IAuthzIoService);
    const userManager = useDependency(UserManagerService);
    const [query, setQuery] = useState('');
    const [candidates, setCandidates] = useState<ICollaborator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const inheritOwner = authz.getCfgEnableObjInherit?.() ?? false;
    useEffect(() => {
        let cancelled = false;
        authz.listCollaborators({ unitID: unitId, objectID: unitId }).then((users) => {
            if (!cancelled) {
                setCandidates(users.filter((user) => user.subject?.userID !== userManager.getCurrentUser().userID));
                setLoading(false);
            }
        }).catch(() => {
            if (!cancelled) {
                setError(true);
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [authz, userManager, unitId, attempt]);

    // Keep existing members visible even when they are absent from the candidate response.
    // Unit collaborators supply the display role; object collaborators carry the saved grant.
    const people = new Map<string, ICollaborator>();
    for (const user of candidates) {
        people.set(user.subject?.userID || user.id, user);
    }
    for (const user of value) {
        const userId = user.subject?.userID || user.id;
        if (!people.has(userId)) {
            people.set(userId, user);
        }
    }
    const selected = new Set(value.map((user) => user.subject?.userID || user.id));
    const search = query.trim().toLocaleLowerCase();
    const users = Array.from(people.values()).filter((user) => (
        (selected.has(user.subject?.userID || user.id) || user.role === UnitRole.Owner || user.role === UnitRole.Editor) &&
        [user.subject?.name, user.subject?.userID, user.id].some((text) => text?.toLocaleLowerCase().includes(search))
    ));

    return (
        <div className={clsx('univer-flex univer-flex-col univer-gap-3 univer-rounded-lg univer-p-3', borderClassName)}>
            <Input
                className="univer-w-full"
                value={query}
                onChange={setQuery}
                placeholder={locale.t<LocaleKey>('ui.objectPermission.searchPeople')}
                aria-label={locale.t<LocaleKey>('ui.objectPermission.searchPeople')}
            />
            <span className="univer-text-xs univer-text-gray-500" aria-live="polite">
                {locale.t<LocaleKey>('ui.objectPermission.selectedCount', String(selected.size))}
            </span>
            <div className="univer-flex univer-max-h-60 univer-flex-col univer-gap-3 univer-overflow-y-auto">
                {loading && <p role="status">{locale.t<LocaleKey>('ui.objectPermission.loading')}</p>}
                {error && (
                    <div role="alert">
                        {locale.t<LocaleKey>('ui.objectPermission.peopleError')}
                        <Button
                            onClick={() => {
                                setLoading(true);
                                setError(false);
                                setAttempt((value) => value + 1);
                            }}
                        >
                            {locale.t<LocaleKey>('ui.objectPermission.reload')}
                        </Button>
                    </div>
                )}
                {!loading && !error && users.length === 0 && (
                    <p role="status" className="univer-text-sm univer-text-gray-500">
                        {locale.t<LocaleKey>('ui.objectPermission.noMatchingPeople')}
                    </p>
                )}
                {users.map((user) => {
                    const userId = user.subject?.userID || user.id;
                    const name = user.subject?.name || userId;
                    const inherited = inheritOwner && user.role === UnitRole.Owner;
                    let roleLabel: LocaleKey = 'ui.objectPermission.roleEditor';
                    if (user.role === UnitRole.Owner) {
                        roleLabel = 'ui.objectPermission.roleOwner';
                    }
                    if (inherited) {
                        roleLabel = 'ui.objectPermission.ownerInherit';
                    }
                    return (
                        <Checkbox
                            key={userId}
                            disabled={disabled || loading || inherited}
                            checked={selected.has(userId)}
                            onChange={(checked) => onChange(checked
                                ? [...value, { ...user, role: UnitRole.Editor }]
                                : value.filter((member) => (member.subject?.userID || member.id) !== userId))}
                        >
                            <span className="univer-flex univer-min-w-0 univer-items-center univer-gap-2">
                                <span aria-hidden="true"><Avatar size={24} src={user.subject?.avatar}>{Array.from(name)[0]}</Avatar></span>
                                <span className="univer-min-w-0 univer-break-words" title={name}>{name}</span>
                                <span
                                    className="
                                      univer-rounded univer-bg-gray-100 univer-px-1.5 univer-py-0.5 univer-text-xs
                                      univer-text-gray-500
                                    "
                                >
                                    {locale.t<LocaleKey>(roleLabel)}
                                </span>
                            </span>
                        </Checkbox>
                    );
                })}
            </div>
        </div>
    );
}
