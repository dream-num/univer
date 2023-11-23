import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';

import { ComponentManager } from '../../Common';
import { IMenuSelectorItem } from '../../services/menu/menu';

export type ICustomLabelProps = {
    value?: string | number | undefined;

    onChange?(v: string | number): void;
} & Pick<IMenuSelectorItem<unknown>, 'label' | 'icon' | 'title'>;

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 * @returns
 */
export function CustomLabel(props: ICustomLabelProps): JSX.Element | null {
    const { title, icon, label } = props;
    const localeService = useDependency(LocaleService);
    const componentManager = useDependency(ComponentManager);

    const nodes = [];
    let index = 0;

    if (icon) {
        const Icon = componentManager.get(icon);
        Icon && nodes.push(<Icon key={index++} extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />);
    }
    if (label) {
        const isStringLabel = typeof label === 'string';

        const customProps = isStringLabel ? { ...props } : { ...label?.props, ...props };
        const labelName = isStringLabel ? label : label?.name;

        const CustomComponent = componentManager.get(labelName);

        if (CustomComponent) {
            nodes.push(<CustomComponent key={index++} {...customProps} />);
        } else {
            nodes.push(<span key={index++}>{localeService.t(labelName)}</span>);
        }
    }
    if (title) {
        nodes.push(<span key={index++}>{localeService.t(title)}</span>);
    }

    return <>{nodes}</>;
}
