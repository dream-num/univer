import { Dialog, IDialogProps } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { IDialogPartMethodOptions } from './interface';

export function DialogPart() {
    const dialogService = useDependency(IDialogService);

    const [dialogOptions, setDialogOptions] = useState<IDialogPartMethodOptions[]>([]);

    useEffect(() => {
        const dialog$ = dialogService.getObservableDialog();
        const subscribtion = dialog$.subscribe((options: IDialogPartMethodOptions[]) => {
            setDialogOptions(options);
        });

        return () => {
            subscribtion.unsubscribe();
        };
    }, []);

    const props = dialogOptions.map((options) => {
        const { children, title, closeIcon, footer, ...restProps } = options;

        const dialogProps = restProps as IDialogProps & { id: string };
        for (const key of ['children', 'title', 'closeIcon', 'footer']) {
            const k = key as keyof IDialogPartMethodOptions;
            const props = options[k] as any;

            if (props) {
                (dialogProps as any)[k] = <CustomLabel {...props} />;
            }
        }

        return dialogProps;
    });

    return <>{props?.map((options) => <Dialog key={options.id} {...options} />)}</>;
}
