import { Dialog, IDialogProps } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { IDialogPartMethodOptions } from './interface';

export function DialogPart() {
    const dialogService = useDependency(IDialogService);

    const [options, setOptions] = useState<IDialogPartMethodOptions>({
        visible: false,
    });

    useEffect(() => {
        const dialog$ = dialogService.getObservableDialog();
        const subscribtion = dialog$.subscribe((options: IDialogPartMethodOptions) => {
            setOptions(options);
        });

        return () => {
            subscribtion.unsubscribe();
        };
    }, []);

    const { children, title, closeIcon, footer, ...restProps } = options;

    const dialogProps = restProps as IDialogProps;
    for (const key of ['children', 'title', 'closeIcon', 'footer']) {
        const k = key as keyof IDialogPartMethodOptions;
        const props = options[k] as any;

        if (props) {
            (dialogProps as any)[k] = <CustomLabel {...props} />;
        }
    }

    return <Dialog {...dialogProps} />;
}
