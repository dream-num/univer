import type { IConfirmProps } from '@univerjs/design';
import { Confirm } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IConfirmService } from '../../../services/confirm/confirm.service';
import type { IConfirmPartMethodOptions } from './interface';

export function ConfirmPart() {
    const confirmService = useDependency(IConfirmService);

    const [confirmOptions, setConfirmOptions] = useState<IConfirmPartMethodOptions[]>([]);

    useEffect(() => {
        const confirm$ = confirmService.getObservableConfirm();
        const subscribtion = confirm$.subscribe((options: IConfirmPartMethodOptions[]) => {
            setConfirmOptions(options);
        });

        return () => {
            subscribtion.unsubscribe();
        };
    }, []);

    const props = confirmOptions.map((options) => {
        const { children, title, ...restProps } = options;

        const confirmProps = restProps as IConfirmProps & { id: string };
        for (const key of ['children', 'title']) {
            const k = key as keyof IConfirmPartMethodOptions;
            const props = options[k] as any;

            if (props) {
                (confirmProps as any)[k] = <CustomLabel {...props} />;
            }
        }

        return confirmProps;
    });

    return props?.map((options, index) => <Confirm key={index} {...options} />);
}
