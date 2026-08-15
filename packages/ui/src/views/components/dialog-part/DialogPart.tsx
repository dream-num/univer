/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { IDialogPartMethodOptions } from './interface';
import { Dialog } from '@univerjs/design';
import { useMemo } from 'react';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/CustomLabel';

export function DialogPart() {
    const dialogService = useDependency(IDialogService);

    const dialogOptions = useObservable(dialogService.getDialogs$(), []);

    const attrs = useMemo(() => dialogOptions.map((options) => {
        const { children, title, footer, ...restProps } = options;

        const dialogProps = restProps as IDialogProps & { id: string };
        for (const key of ['children', 'title', 'footer']) {
            const k = key as keyof IDialogPartMethodOptions;
            const props = options[k] as any;

            if (props) {
                const { key: itemKey, ...customLabelProps } = props;

                (dialogProps as any)[k] = <CustomLabel key={itemKey} {...customLabelProps} />;
            }
        }

        return dialogProps;
    }), [dialogOptions]);

    return attrs?.map((options) => (
        <Dialog key={options.id} {...options} />
    ));
}
