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

import type { IAccessor, IObjectPermissionPolicy, IObjectPermissionTarget } from '@univerjs/core';
import type { ICollaborator } from '@univerjs/protocol';
import type { LocaleKey } from '../../locale/types';
import { IAuthzIoService, ICommandService, IUniverInstanceService, LocaleService, ObjectPermissionService } from '@univerjs/core';
import { Button, Checkbox, Dialog, FormLayout, Radio, RadioGroup, StateIconButton } from '@univerjs/design';
import { ProtectIcon } from '@univerjs/icons';
import { UnitAction, UnitRole } from '@univerjs/protocol';
import { useEffect, useState } from 'react';
import { IDialogService } from '../../services/dialog/dialog.service';
import { useDependency, useObservable } from '../../utils/di';

export interface IObjectPermissionButtonProps {
    target: IObjectPermissionTarget;
    name: string;
    commandId: string;
    actions?: readonly UnitAction[];
    /** Confirm the original object still exists before saving. */
    exists?: () => boolean;
}

export const OBJECT_PERMISSION_DIALOG = 'ui.object-permission-dialog';

/** Mount outside transient toolbars and context menus, retaining the original target until close. */
export function openObjectPermissionDialog(accessor: IAccessor, props: IObjectPermissionButtonProps): boolean {
    if (!accessor.get(ObjectPermissionService).supports(props.target) || (props.exists && !props.exists())) {
        return false;
    }
    const dialogs = accessor.get(IDialogService);
    dialogs.open({
        id: OBJECT_PERMISSION_DIALOG,
        width: 400,
        title: { label: accessor.get(LocaleService).t<LocaleKey>('ui.objectPermission.title') },
        closable: false,
        maskClosable: false,
        keyboard: false,
        children: { label: { name: OBJECT_PERMISSION_DIALOG, props: { ...props, hosted: true, onClose: () => dialogs.close(OBJECT_PERMISSION_DIALOG) } } },
    });
    return true;
}

/** Available only for explicitly capable Authz providers. The target remains fixed while the dialog is open. */
export function ObjectPermissionButton(props: IObjectPermissionButtonProps) {
    const permissions = useDependency(ObjectPermissionService);
    const localeService = useDependency(LocaleService);
    useObservable(permissions.changed$, 0);
    const [open, setOpen] = useState(false);
    if (!permissions.supports(props.target)) {
        return null;
    }
    return (
        <>
            <StateIconButton
                active={permissions.hasPolicy(props.target)}
                title={localeService.t<LocaleKey>('ui.objectPermission.title')}
                aria-label={localeService.t<LocaleKey>('ui.objectPermission.title')}
                onClick={(event) => {
                    event.stopPropagation();
                    setOpen(true);
                }}
            >
                <ProtectIcon />
            </StateIconButton>
            {open && <ObjectPermissionDialog {...props} onClose={() => setOpen(false)} />}
        </>
    );
}

const DEFAULT_ACTIONS = [UnitAction.Edit] as const;

export function ObjectPermissionDialog({ target, name, commandId, actions = DEFAULT_ACTIONS, exists, onClose, hosted = false }: IObjectPermissionButtonProps & { onClose: () => void; hosted?: boolean }) {
    const localeService = useDependency(LocaleService);
    const permissions = useDependency(ObjectPermissionService);
    const authz = useDependency(IAuthzIoService);
    const commandService = useDependency(ICommandService);
    const instances = useDependency(IUniverInstanceService);
    const [policy, setPolicy] = useState<IObjectPermissionPolicy | null>(null);
    const [candidates, setCandidates] = useState<ICollaborator[]>([]);
    const [canManage, setCanManage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [dirty, setDirty] = useState(false);
    const [conflict, setConflict] = useState(false);
    const [loading, setLoading] = useState(true);
    const { unitId, objectId, objectType } = target;
    const editOptions: IObjectPermissionPolicy['edit'][] = objectId === unitId ? ['all', 'owner'] : ['all', 'owner', 'members'];
    useEffect(() => {
        const subscription = instances.unitDisposed$.subscribe((unit) => {
            if (unit.getUnitId() === unitId) {
                onClose();
            }
        });
        return () => subscription.unsubscribe();
    }, [instances, unitId, onClose]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([
            permissions.read({ unitId, objectId, objectType }),
            permissions.canManage({ unitId, objectId, objectType }),
            authz.listCollaborators({ unitID: unitId, objectID: unitId }),
        ]).then(([loaded, allowed, users]) => {
            if (!cancelled) {
                setPolicy(loaded);
                setCanManage(allowed);
                setCandidates(users);
                setDirty(false);
                setConflict(false);
                setError(false);
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
    }, [permissions, authz, unitId, objectId, objectType, attempt]);

    useEffect(() => {
        const subscription = permissions.unitChanges$.subscribe((changedUnitId) => {
            if (changedUnitId !== unitId) {
                return;
            }
            if (!saving) {
                if (dirty) {
                    setConflict(true);
                } else {
                    setAttempt((value) => value + 1);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [permissions, unitId, dirty, saving]);

    const save = async () => {
        if (!policy || loading || saving || !canManage || conflict) {
            return;
        }
        setSaving(true);
        setError(false);
        try {
            if (!instances.getUnit(unitId) || (exists && !exists())) {
                throw new Error('Object no longer exists.');
            }
            const result = await commandService.executeCommand(commandId, {
                unitId,
                objectId,
                action: UnitAction.Edit,
                value: policy.edit === 'all',
                policy,
            });
            if (!result) {
                throw new Error('Permission command rejected.');
            }
            onClose();
        } catch {
            setError(true);
        } finally {
            setSaving(false);
        }
    };
    const actionLabels: Partial<Record<UnitAction, LocaleKey>> = {
        [UnitAction.Copy]: 'ui.objectPermission.copy',
        [UnitAction.Print]: 'ui.objectPermission.print',
        [UnitAction.Export]: 'ui.objectPermission.export',
        [UnitAction.Comment]: 'ui.objectPermission.comment',
    };
    const footer = (
        <div className="univer-flex univer-justify-end univer-gap-2">
            <Button disabled={saving} onClick={onClose}>{localeService.t<LocaleKey>('ui.objectPermission.cancel')}</Button>
            <Button variant="primary" disabled={!policy || !canManage || loading || saving || conflict || (policy.edit === 'members' && !policy.collaborators.length)} onClick={save}>
                {localeService.t<LocaleKey>(saving ? 'ui.objectPermission.saving' : 'ui.objectPermission.save')}
            </Button>
        </div>
    );
    const content = (
        <div className="univer-flex univer-flex-col univer-gap-4" onClick={(event) => event.stopPropagation()}>
            <div className="univer-break-words univer-font-medium">{name}</div>
            {!policy && !error && <p role="status">{localeService.t<LocaleKey>('ui.objectPermission.loading')}</p>}
            {(error || conflict) && (
                <div role="alert">
                    {localeService.t<LocaleKey>(conflict ? 'ui.objectPermission.conflict' : 'ui.objectPermission.error')}
                    <Button disabled={saving} onClick={() => setAttempt((value) => value + 1)}>{localeService.t<LocaleKey>('ui.objectPermission.reload')}</Button>
                </div>
            )}
            {policy && (
                <>
                    {!canManage && <p>{localeService.t<LocaleKey>('ui.objectPermission.denied')}</p>}
                    <FormLayout label={localeService.t<LocaleKey>('ui.objectPermission.edit')}>
                        <RadioGroup
                            value={policy.edit}
                            onChange={(value) => {
                                setPolicy({ ...policy, edit: value as IObjectPermissionPolicy['edit'] });
                                setDirty(true);
                            }}
                            className="univer-flex univer-flex-col univer-gap-2"
                        >
                            {editOptions.map((value) => (
                                <Radio key={value} value={value} disabled={!canManage || saving}>
                                    {localeService.t<LocaleKey>(`ui.objectPermission.${value}`)}
                                </Radio>
                            ))}
                        </RadioGroup>
                    </FormLayout>
                    {objectId !== unitId && policy.edit === 'members' && (
                        <div
                            className="univer-flex univer-max-h-60 univer-flex-col univer-gap-2 univer-overflow-auto"
                        >
                            {candidates.map((user) => (
                                <Checkbox
                                    key={user.id}
                                    disabled={!canManage || saving}
                                    checked={policy.collaborators.some((member) => member.id === user.id)}
                                    onChange={(checked) => {
                                        const collaborators = policy.collaborators.filter((member) => member.id !== user.id);
                                        if (checked) {
                                            collaborators.push({ ...user, role: UnitRole.Editor });
                                        }
                                        setPolicy({ ...policy, collaborators });
                                        setDirty(true);
                                    }}
                                >
                                    {user.subject?.name ?? user.id}
                                </Checkbox>
                            ))}
                        </div>
                    )}
                    {actions.filter((action) => action !== UnitAction.Edit && actionLabels[action]).map((action) => (
                        <Checkbox
                            key={action}
                            disabled={!canManage || saving}
                            checked={!policy.strategies.some((strategy) => strategy.action === action && strategy.role === UnitRole.Owner)}
                            onChange={(checked) => {
                                setPolicy({ ...policy, strategies: [...policy.strategies.filter((strategy) => strategy.action !== action), { action, role: checked ? UnitRole.Editor : UnitRole.Owner }] });
                                setDirty(true);
                            }}
                        >
                            {localeService.t<LocaleKey>(actionLabels[action]!)}
                        </Checkbox>
                    ))}
                    <p className="univer-text-sm univer-text-gray-500">{localeService.t<LocaleKey>('ui.objectPermission.parentHint')}</p>
                </>
            )}
        </div>
    );
    if (hosted) {
        return (
            <>
                {content}
                <div className="univer-mt-4">{footer}</div>
            </>
        );
    }
    return (
        <Dialog
            open
            width={400}
            title={localeService.t<LocaleKey>('ui.objectPermission.title')}
            closable={!saving}
            onClose={() => {
                if (!saving) {
                    onClose();
                }
            }}
            footer={footer}
        >
            {content}
        </Dialog>
    );
}
