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

import type { IAccessor, IObjectPermissionTarget } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import type { IObjectPermissionButtonProps } from './ObjectPermissionButton';
import { Injector, IUniverInstanceService, LocaleService, ObjectPermissionService } from '@univerjs/core';
import { Button, Input, StateIconButton } from '@univerjs/design';
import { ProtectIcon } from '@univerjs/icons';
import { UnitObject } from '@univerjs/protocol';
import { useEffect, useState } from 'react';
import { ISidebarService } from '../../services/sidebar/sidebar.service';
import { useDependency, useObservable } from '../../utils/di';
import { ObjectPermissionButton } from './ObjectPermissionButton';

export const OBJECT_PERMISSION_PANEL = 'ui.object-permission-panel';

export interface IObjectPermissionPanelProps {
    unitId: string;
    expandable?: UnitObject;
    /** A lazy iterator avoids materializing all records in large Bases. */
    getTargets: () => Iterable<IObjectPermissionButtonProps>;
}

export function openObjectPermissionPanel(
    accessor: IAccessor,
    props: IObjectPermissionPanelProps & { target: IObjectPermissionTarget }
): boolean {
    if (!accessor.get(ObjectPermissionService).supports(props.target)) {
        return false;
    }
    accessor.get(ISidebarService).open({
        id: OBJECT_PERMISSION_PANEL,
        width: 330,
        header: { title: accessor.get(LocaleService).t<LocaleKey>('ui.objectPermission.title') },
        children: { label: { name: OBJECT_PERMISSION_PANEL, props: { unitId: props.unitId, getTargets: props.getTargets, expandable: props.expandable } } },
    });
    return true;
}

export function ObjectPermissionPanelButton(props: IObjectPermissionPanelProps & { target: IObjectPermissionTarget }) {
    const permissions = useDependency(ObjectPermissionService);
    const accessor = useDependency(Injector);
    const localeService = useDependency(LocaleService);
    useObservable(permissions.changed$, 0);
    if (!permissions.supports(props.target)) {
        return null;
    }
    return (
        <StateIconButton
            active={permissions.getPolicies(props.unitId).some((policy) => permissions.hasPolicy({ unitId: props.unitId, objectId: policy.objectID, objectType: policy.objectType }))}
            title={localeService.t<LocaleKey>('ui.objectPermission.title')}
            aria-label={localeService.t<LocaleKey>('ui.objectPermission.title')}
            onClick={() => openObjectPermissionPanel(accessor, props)}
        >
            <ProtectIcon />
        </StateIconButton>
    );
}

export function ObjectPermissionPanel({ unitId, getTargets, expandable }: IObjectPermissionPanelProps) {
    const localeService = useDependency(LocaleService);
    const permissions = useDependency(ObjectPermissionService);
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [limit, setLimit] = useState(50);
    useObservable(permissions.changed$, 0);
    const instances = useDependency(IUniverInstanceService);
    const sidebar = useDependency(ISidebarService);
    useEffect(() => {
        const subscription = instances.unitDisposed$.subscribe((unit) => {
            if (unit.getUnitId() === unitId) {
                sidebar.close(OBJECT_PERMISSION_PANEL);
            }
        });
        return () => subscription.unsubscribe();
    }, [instances, sidebar, unitId]);
    const kinds: Partial<Record<UnitObject, LocaleKey>> = {
        [UnitObject.Document]: 'ui.objectPermission.document',
        [UnitObject.DocumentSection]: 'ui.objectPermission.section',
        [UnitObject.DocumentParagraph]: 'ui.objectPermission.paragraph',
        [UnitObject.DocumentEntity]: 'ui.objectPermission.entity',
        [UnitObject.Slide]: 'ui.objectPermission.presentation',
        [UnitObject.SlidePage]: 'ui.objectPermission.page',
        [UnitObject.SlideMaster]: 'ui.objectPermission.master',
        [UnitObject.SlideElement]: 'ui.objectPermission.entity',
        [UnitObject.Base]: 'ui.objectPermission.base',
        [UnitObject.BaseTable]: 'ui.objectPermission.table',
        [UnitObject.BaseField]: 'ui.objectPermission.field',
        [UnitObject.BaseRecord]: 'ui.objectPermission.record',
        [UnitObject.BaseView]: 'ui.objectPermission.view',
        [UnitObject.Board]: 'ui.objectPermission.board',
        [UnitObject.BoardElement]: 'ui.objectPermission.entity',
    };
    const items: IObjectPermissionButtonProps[] = [];
    let more = false;
    let ordinal = 0;
    const iterator = getTargets()[Symbol.iterator]();
    while (true) {
        if (expandable && !expanded && ordinal === 1) {
            break;
        }
        const next = iterator.next();
        if (next.done) {
            break;
        }
        const item = next.value;
        ordinal++;
        const name = localeService.t<LocaleKey>('ui.objectPermission.objectName', localeService.t<LocaleKey>(kinds[item.target.objectType] ?? 'ui.objectPermission.entity'), item.name || String(ordinal));
        if (!permissions.supports(item.target) || ((!expandable || expanded) && !name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))) {
            continue;
        }
        if (items.length === limit) {
            more = true;
            break;
        }
        items.push({ ...item, name });
    }
    return (
        <div className="univer-flex univer-h-full univer-flex-col univer-gap-3 univer-p-4">
            {expandable && <Button aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{localeService.t<LocaleKey>(kinds[expandable] ?? 'ui.objectPermission.entity')}</Button>}
            {(!expandable || expanded) && (
                <Input
                    value={query}
                    onChange={(value) => {
                        setQuery(value);
                        setLimit(50);
                    }}
                    placeholder={localeService.t<LocaleKey>('ui.objectPermission.search')}
                    aria-label={localeService.t<LocaleKey>('ui.objectPermission.search')}
                />
            )}
            <div className="univer-flex-1 univer-overflow-auto">
                {items.map((item) => (
                    <div
                        key={`${unitId}/${item.target.objectType}/${item.target.objectId}`}
                        className="univer-flex univer-items-center univer-gap-2 univer-py-2"
                    >
                        <span className="univer-min-w-0 univer-flex-1 univer-truncate" title={item.name}>{item.name}</span>
                        <ObjectPermissionButton {...item} />
                    </div>
                ))}
                {!items.length && <p>{localeService.t<LocaleKey>('ui.objectPermission.empty')}</p>}
                {more && <Button onClick={() => setLimit((value) => value + 50)}>{localeService.t<LocaleKey>('ui.objectPermission.loadMore')}</Button>}
            </div>
        </div>
    );
}
