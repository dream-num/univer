import { isValidElement, JSX, useContext } from 'react';

import { AppContext, AppContextValues, ICustomComponent } from '../../Common';
import { IMenuSelectorItem } from '../../services/menu/menu';
import { Input } from '../Input';
import { Item } from '../Item/Item';
import { DisplayTypes } from '../Select';
import styles from './CustomLabel.module.less';

export interface IBaseCustomLabelProps {
    icon?: string;
    value?: string;
    label: string | ICustomComponent | React.ReactNode;
    display?: DisplayTypes;
    onChange?: (e: Event) => void;
    selected?: boolean;
    title?: string;
}

function getLocale(context: Partial<AppContextValues>, name: string) {
    return context.localeService?.t(name);
}

export interface INeoCustomLabelProps {
    value?: string | number | undefined;
    selected?: boolean;
    onChange?(v: string | number): void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
}

/**
 * The component to render toolbar item label and menu item label.
 * @param props
 * @returns
 */
export function NeoCustomLabel(
    props: Pick<IMenuSelectorItem<unknown>, 'label' | 'icon' | 'display' | 'title'> & INeoCustomLabelProps
): JSX.Element | null {
    const context = useContext(AppContext);
    const { display, value, title, icon, label, onChange, selected, onFocus } = props;

    if (display === DisplayTypes.COLOR) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ColorSelect value={value as any} title={getLocale(context, title) as string} icon={icon} />;
    }

    if (display === DisplayTypes.FONT) {
        return (
            <div className={styles.fontSelect} style={{ fontFamily: value as string }}>
                {getLocale(context, value as string)}
            </div>
        );
    }

    if (display === DisplayTypes.INPUT) {
        return (
            <Input
                onValueChange={(v) => onChange?.(v as unknown as string)}
                onFocus={onFocus}
                type="number"
                value={`${value}`}
                bordered={false}
                style={{
                    width: '32px',
                    height: '24px',
                    padding: '2px',
                    textAlign: 'center',
                    background: 'transparent',
                }}
            />
        );
    }

    if (display === DisplayTypes.ICON && icon) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LabelComponent = context.componentManager?.get(icon) as any;
        if (LabelComponent) {
            return <LabelComponent {...props} />;
        }
    }

    if (display === DisplayTypes.CUSTOM && label) {
        const labelName = typeof label === 'string' ? label : (label as ICustomComponent).name;
        const customProps = (label as ICustomComponent).props ?? {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LabelComponent = context.componentManager?.get(labelName) as any;
        if (LabelComponent) {
            return <LabelComponent {...customProps} {...props} />;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LabelComponent = icon ? (context.componentManager?.get(icon) as any) : null;
    return (
        <Item
            selected={selected}
            label={title}
            value={value}
            suffix={LabelComponent ? <LabelComponent /> : null}
            disabled={false}
        ></Item>
    );
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
        return <ColorSelect value={props.label as string} title={props.label as string} />;
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

// export class ColorSelect extends Component<IColorSelectProps> {
//     render() {
//         const { value, icon, title } = this.props;
//         return (
//             <div className={styles.colorSelect}>
//                 <div>{icon ? <CustomLabel label={{ name: icon }} /> : title}</div>
//                 <div className={styles.colorSelectLine} style={{ background: value }}></div>
//             </div>
//         );
//     }
// }
export function ColorSelect({ value, icon, title }: IColorSelectProps) {
    return (
        <div className={styles.colorSelect}>
            <div>{icon ? <CustomLabel label={{ name: icon }} /> : title}</div>
            <div className={styles.colorSelectLine} style={{ background: value }}></div>
        </div>
    );
}
