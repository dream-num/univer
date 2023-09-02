import { Component, isValidElement, JSX } from 'preact';
import { useContext } from 'preact/hooks';

import { AppContext, ICustomComponent } from '../../Common';
import { IBaseCustomLabelProps } from '../../Interfaces';
import { DisplayTypes } from '../Select';

import styles from './CustomLabel.module.less';

export function CustomLabel(props: IBaseCustomLabelProps): JSX.Element | null {
    const context = useContext(AppContext);
    const { label, display } = props;

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
            return <Label {...props} />;
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