import { isValidElement } from 'preact';
import { useContext } from 'preact/hooks';
import { AppContext, ICustomComponent } from '../../Common';
import { IBaseCustomLabelProps } from '../../Interfaces';

export function CustomLabel(props: IBaseCustomLabelProps): JSX.Element | null {
    const context = useContext(AppContext);
    const { label } = props;

    function getLocale(name: string) {
        return context.localeService?.t(name);
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
