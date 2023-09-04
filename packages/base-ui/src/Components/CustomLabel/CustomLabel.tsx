import { Component, isValidElement, JSX } from 'preact';
import { useContext } from 'preact/hooks';

import { AppContext, AppContextValues, ICustomComponent } from '../../Common';
import { IBaseCustomLabelProps } from '../../Interfaces';
import { DisplayTypes } from '../Select';

import styles from './CustomLabel.module.less';
import { IMenuSelectorItem } from '../../services/menu/menu';
import { Item } from '../Item/Item';
import { Input } from '../Input/input';

function getLocale(context: Partial<AppContextValues>, name: string) {
    return context.localeService?.t(name);
}

export interface INeoCustomLabelProps {
    value: string | number;
    onChange?(v: string | number): void;
}

export function NeoCustomLabel(props: Pick<IMenuSelectorItem<unknown>, 'label' | 'icon' | 'display' | 'title'> & INeoCustomLabelProps): JSX.Element | null {
    const context = useContext(AppContext);
    const { display, value, title, icon, label, onChange } = props;

    if (display === DisplayTypes.COLOR) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ColorSelect value={value as any} title={title} icon={icon} />;
    }

    if (display === DisplayTypes.FONT) {
        return (
            <div className={styles.fontSelect} style={{ fontFamily: value as string }}>
                {getLocale(context, value as string)}
            </div>
        );
    }

    if (display === DisplayTypes.INPUT) {
        return <Input onValueChange={(v) => onChange?.(v as unknown as string)} type="number" value={`${value}`} />;
    }

    // if the render type is icon, then render value to icon
    if (display === DisplayTypes.ICON && icon) {
        const LabelComponent = context.componentManager?.get(icon) as any;
        if (LabelComponent) {
            return <LabelComponent {...props} />;
        }
    }

    if (display === DisplayTypes.CUSTOM && label) {
        const LabelComponent = context.componentManager?.get(label) as any;
        if (LabelComponent) {
            return <LabelComponent {...props} />;
        }
    }

    const LabelComponent = icon ? (context.componentManager?.get(icon) as any) : null;
    return <Item selected={false} label={title} suffix={LabelComponent ? <LabelComponent /> : null} disabled={false}></Item>;
}

/** @deprecated */
export function CustomLabel(props: IBaseCustomLabelProps): JSX.Element | null {
    const context = useContext(AppContext);
    const { label, display, onChange } = props;

    function getLocale(name: string) {
        return context.localeService?.t(name);
    }

    // the new way to render toolbar item type to replace Label prop
    if (display === DisplayTypes.COLOR) {
        return <ColorSelect value={props.label} title={props.label} />;
    }

    if (typeof label === 'string') {
        return <>{getLocale(label)}</>;
    }

    if (isValidElement(label)) {
        return label;
    }

    // other types of components and icon
    if (label) {
        const Label = context.componentManager?.get((label as ICustomComponent).name) as any;
        if (Label) {
            const props = (label as ICustomComponent).props ?? {};
            return <Label onChange={onChange} {...props} />;
        }
    }

    return null;
}

export interface IColorSelectProps {
    icon?: string;
    title: string;
    /** color */
    value: string;
}

export class ColorSelect extends Component<IColorSelectProps> {
    render() {
        const { value, icon, title } = this.props;
        return (
            <div className={styles.colorSelect}>
                <div>{icon ? <CustomLabel label={{ name: icon }} /> : title}</div>
                <div className={styles.colorSelectLine} style={{ background: value }}></div>
            </div>
        );
    }
}
