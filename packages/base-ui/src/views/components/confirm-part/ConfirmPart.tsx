import { Confirm, IConfirmProps } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IConfirmService } from '../../../services/confirm/confirm.service';
import { IConfirmPartMethodOptions } from './interface';

export function ConfirmPart() {
    const confirmService = useDependency(IConfirmService);

    const [options, setOptions] = useState<IConfirmPartMethodOptions>({
        visible: false,
    });

    useEffect(() => {
        const confirm$ = confirmService.getObservableConfirm();
        const subscribtion = confirm$.subscribe((options: IConfirmPartMethodOptions) => {
            setOptions(options);
        });

        return () => {
            subscribtion.unsubscribe();
        };
    }, []);

    const { children, title, ...restProps } = options;

    const confirmProps = restProps as IConfirmProps;
    for (const key of ['children', 'title']) {
        const k = key as keyof IConfirmPartMethodOptions;
        const props = options[k] as any;

        if (props) {
            (confirmProps as any)[k] = <CustomLabel {...props} />;
        }
    }

    return <Confirm {...confirmProps} />;
}
