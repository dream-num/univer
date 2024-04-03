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

import { ColorKit, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';
import type { Observable } from 'rxjs';
import { isObservable } from 'rxjs';

import { ComponentManager } from '../../common/component-manager';
import type { IMenuSelectorItem } from '../../services/menu/menu';
import { useObservable } from '../hooks/observable';

export type ICustomLabelProps<T = undefined> = {
    value?: string | number | undefined;

    value$?: Observable<T>;

    onChange?(v: string | number): void;

    title?: React.ReactNode;
} & Pick<IMenuSelectorItem<unknown>, 'label' | 'icon'>;

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 * @returns
 */
export function CustomLabel(props: ICustomLabelProps): JSX.Element | null {
    const { title, icon, label, value, value$ } = props;
    const localeService = useDependency(LocaleService);
    const componentManager = useDependency(ComponentManager);

    const nodes = [];
    let index = 0;

    let realValue = value;
    if (value$) {
        realValue = useObservable(value$, undefined, true);
    }

    let realIcon;
    if (isObservable(icon)) {
        realIcon = useObservable(icon, undefined, true);
    } else {
        realIcon = icon;
    }

    // if value is not valid, use primary color
    let isValid = false;
    if (realValue && typeof realValue === 'string') {
        isValid = new ColorKit(realValue).isValid;
    }

    if (icon) {
        const Icon = componentManager.get(realIcon ?? '');

        if (Icon) {
            nodes.push(
                <Icon
                    key={index++}
                    extend={{ colorChannel1: isValid ? realValue : 'rgb(var(--primary-color))' }}
                />
            );
        }
    }
    if (label) {
        const isStringLabel = typeof label === 'string';

        const customProps = isStringLabel ? { ...props } : { ...label?.props, ...props };
        const labelName = isStringLabel ? label : label?.name;

        const CustomComponent = componentManager.get(labelName);

        if (CustomComponent) {
            nodes.push(<CustomComponent key={index++} {...customProps} value={realValue} />);
        } else {
            nodes.push(<span key={index++}>{localeService.t(labelName)}</span>);
        }
    }
    if (title) {
        nodes.push(<span key={index++}>{typeof title === 'string' ? localeService.t(title) : title}</span>);
    }

    return <>{nodes}</>;
}
