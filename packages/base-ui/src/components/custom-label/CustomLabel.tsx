import { LocaleService } from '@univerjs/core';
import { CheckMarkSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';

import { ComponentManager } from '../../Common';
import { IMenuSelectorItem } from '../../services/menu/menu';
import styles from './index.module.less';

export type ICustomLabelProps = {
    value?: string | number | undefined;

    selected?: boolean;

    onChange?(v: string | number): void;
} & Pick<IMenuSelectorItem<unknown>, 'label' | 'icon' | 'title'>;

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 * @returns
 */
export function CustomLabel(props: ICustomLabelProps): JSX.Element | null {
    const { title, icon, label, selected } = props;
    const localeService = useDependency(LocaleService);
    const componentManager = useDependency(ComponentManager);

    const nodes = [];
    let index = 0;
    if (selected) {
        nodes.push(
            <span key={index++}>
                <CheckMarkSingle style={{ color: 'rgb(var(--success-color))' }} />
            </span>
        );
    }
    if (icon) {
        const Icon = componentManager.get(icon);
        Icon && nodes.push(<Icon key={index++} extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />);
    }
    if (label) {
        const isStringLabel = typeof label === 'string';

        const customProps = isStringLabel ? { ...props } : { ...label?.props, ...props };
        const labelName = isStringLabel ? label : label?.name;

        const CustomComponent = componentManager.get(labelName);
        CustomComponent && nodes.push(<CustomComponent key={index++} {...customProps} />);
    }
    if (title) {
        nodes.push(<span key={index++}>{localeService.t(title)}</span>);
    }

    return <span className={styles.customLabel}>{nodes}</span>;
}
