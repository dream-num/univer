import { isValidElement } from 'preact';
import { useContext } from 'preact/hooks';
import { AppContext, CustomComponent } from '../../Common';
import { BaseCustomLabelProps } from '../../Interfaces';

export function CustomLabel(props: BaseCustomLabelProps): JSX.Element | null {
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
        const Label = context.componentManager?.get((label as CustomComponent).name) as any;
        if (Label) {
            const props = (label as CustomComponent).props ?? {};
            return <Label {...props} />;
        }
    }
    return null;
}
