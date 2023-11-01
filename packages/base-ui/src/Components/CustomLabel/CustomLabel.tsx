import { LocaleService } from '@univerjs/core';
import { CheckMarkSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';

import { ComponentManager, ICustomComponent } from '../../Common';
import { IMenuSelectorItem } from '../../services/menu/menu';

export interface IBaseCustomLabelProps {
    icon?: string;
    value?: string;
    label: string | ICustomComponent | React.ReactNode;
    onChange?: (e: Event) => void;
    selected?: boolean;
    title?: string;
}

export interface INeoCustomLabelProps {
    value?: string | number | undefined;
    selected?: boolean;
    /**
     * Triggered after value change
     */
    onChange?(v: string | number): void;
    /**
     * Triggered after input Enter or Blur
     */
    onValueChange?(v: string | number): void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
}

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 * @returns
 * @deprecated
 */
export function NeoCustomLabel(
    props: Pick<IMenuSelectorItem<unknown>, 'label' | 'icon' | 'title'> & INeoCustomLabelProps
): JSX.Element | null {
    const { title, icon, label, selected } = props;
    const localeService = useDependency(LocaleService);
    const componentManager = useDependency(ComponentManager);

    function getLocale(name: string) {
        return localeService.t(name) ?? name;
    }

    const nodes = [];
    let index = 0;
    if (icon) {
        const LabelComponent = componentManager.get(icon) as any;
        nodes.push(<LabelComponent key={index++} extend={{ colorChannel1: 'rgb(var(--primary-color))' }} />);
    }
    if (label) {
        const labelName = typeof label === 'string' ? label : (label as ICustomComponent).name;

        const customProps = (label as ICustomComponent).props ?? {};

        const LabelComponent = componentManager.get(labelName) as any;
        LabelComponent && nodes.push(<LabelComponent key={index++} {...customProps} {...props} />);
    }
    if (title) {
        nodes.push(<span key={index++}>{getLocale(title)}</span>);
    }

    // Process Font Family drop-down list font
    return (
        <div>
            {selected && (
                <span>
                    <CheckMarkSingle style={{ color: 'rgb(var(--success-color))' }} />
                </span>
            )}
            {nodes}
        </div>
    );
}
