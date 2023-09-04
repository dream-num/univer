import { Component, isValidElement, JSX } from 'preact';
import { useContext } from 'preact/hooks';

import { AppContext, AppContextValues, ICustomComponent } from '../../Common';
import { IBaseCustomLabelProps } from '../../Interfaces';
import { DisplayTypes } from '../Select';

import styles from './CustomLabel.module.less';
import { IMenuSelectorItem } from '../../services/menu/menu';

function getLocale(context: Partial<AppContextValues>, name: string) {
    return context.localeService?.t(name);
}

export interface INeoCustomLabelProps<T> {
    value: T;
    onChange?(v: T): void;
}

export function NeoCustomLabel<T>(props: Pick<IMenuSelectorItem<unknown>, 'icon' | 'display' | 'title'> & INeoCustomLabelProps<T>): JSX.Element | null {
    const context = useContext(AppContext);
    const { display, value, title, icon } = props;

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
        // TODO: implement display input
    }

    // if the render type is icon, then render value to icon
    if (display === DisplayTypes.ICON) {
        return <>{value}</>;
    }

    return <>{value}</>;
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
        const { value, icon } = this.props;

        return (
            <div className={styles.colorSelect}>
                <div>
                    <CustomLabel label={{ name: icon }} />
                </div>
                <div className={styles.colorSelectLine} style={{ background: value }}></div>
            </div>
        );
    }
}
