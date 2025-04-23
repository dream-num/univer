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

import type { IValueOption } from '../../../services/menu/menu';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { convertObservableToBehaviorSubject, LocaleService } from '@univerjs/core';
import { TinyMenuGroup as DesignTinyMenuGroup } from '@univerjs/design';
import { useEffect, useState } from 'react';
import { combineLatest, of } from 'rxjs';
import { ComponentManager } from '../../../common';
import { useDependency } from '../../../utils/di';

interface IUITinyMenuGroupProps {
    item: IMenuSchema;
    onOptionSelect?: (option: IValueOption) => void;
}

export function UITinyMenuGroup(props: IUITinyMenuGroupProps) {
    const { item, onOptionSelect } = props;
    const [activeItems, setActiveItems] = useState<string[]>([]);
    const componentManager = useDependency(ComponentManager);
    const localeService = useDependency(LocaleService);

    useEffect(() => {
        if (!item.children) return;
        const observables = item.children.map((child) => convertObservableToBehaviorSubject(child.item?.activated$ ?? of(false), false));
        const subscription = combineLatest(observables).subscribe((activedArr) => {
            const actived = activedArr.map((actived, index) => ({ actived, item: item.children![index].item!.id })).filter((actived) => actived.actived);
            if (actived.length === 0) {
                setActiveItems([]);
            } else {
                setActiveItems(actived.map((actived) => actived.item));
            }
        });

        return () => {
            subscription.unsubscribe();
            observables.forEach((observable) => {
                observable.complete();
            });
        };
    }, [item]);

    if (!item.children) return null;

    return (
        <DesignTinyMenuGroup
            items={item.children.map((child) => ({
                key: child.key,
                onClick: () => {
                    onOptionSelect?.({
                        value: '',
                        label: child.key,
                        commandId: child.item?.commandId,
                        id: child.item?.id,
                        tooltip: child.item?.tooltip && localeService.t(child.item?.tooltip),
                    });
                },
                className: '',
                Icon: componentManager.get(child.item!.icon as string)!,
                active: activeItems.includes(child.item?.id ?? ''),
            }))}
        />
    );
}
