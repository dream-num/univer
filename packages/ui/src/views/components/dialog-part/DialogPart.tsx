/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDialogProps } from '@univerjs/design';
import { Dialog } from '@univerjs/design';
import { useDependency } from '@univerjs/core';
import React, { useEffect, useState } from 'react';

import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IDialogService } from '../../../services/dialog/dialog.service';
import type { IDialogPartMethodOptions } from './interface';

export function DialogPart() {
    const dialogService = useDependency(IDialogService);

    const [dialogOptions, setDialogOptions] = useState<IDialogPartMethodOptions[]>([]);

    useEffect(() => {
        const dialog$ = dialogService.getDialogs$();
        const subscription = dialog$.subscribe((options: IDialogPartMethodOptions[]) => {
            setDialogOptions(options);
        });

        return () => subscription.unsubscribe();
    }, [dialogService]);

    const attrs = dialogOptions.map((options) => {
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

    return <>{attrs?.map((options) => <Dialog key={options.id} {...options} />)}</>;
}
