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

import type { IMobileConfirmProps } from '@univerjs/design';
import type { ReactElement } from 'react';
import type { IConfirmChildrenProps, IConfirmPartMethodOptions, IContextConfirmProps } from './interface';
import { IConfirmService } from '@univerjs/core';
import { MobileConfirm } from '@univerjs/design';
import { cloneElement, useState } from 'react';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/CustomLabel';

function MobileContextConfirm(props: IContextConfirmProps) {
    const { children, onClose, onConfirm } = props;
    const [hooks] = useState<IConfirmChildrenProps['hooks']>({});

    // eslint-disable-next-line react/no-clone-element
    const childrenWithHooks = children ? cloneElement(children, { hooks }) : null;

    return (
        <MobileConfirm
            {...props}
            onClose={() => {
                const beforeClose = hooks.beforeClose;
                if (beforeClose) {
                    const result = beforeClose();
                    if (result.cancel) {
                        return;
                    }
                    onClose?.(result);
                    return;
                }

                onClose?.();
            }}
            onConfirm={() => {
                const beforeConfirm = hooks.beforeConfirm;
                if (beforeConfirm) {
                    const result = beforeConfirm();
                    if (result.cancel) {
                        return;
                    }
                    onConfirm?.(result);
                    return;
                }

                onConfirm?.();
            }}
        >
            {childrenWithHooks}
        </MobileConfirm>
    );
}

export function MobileConfirmPart() {
    const confirmService = useDependency(IConfirmService) as IConfirmService<IConfirmPartMethodOptions>;
    const confirmOptions = useObservable(confirmService.confirmOptions$, []);

    const props = confirmOptions.map((options) => {
        const { children, title, ...restProps } = options;
        const confirmProps = restProps as IMobileConfirmProps & { id: string };

        for (const key of ['children', 'title']) {
            const optionKey = key as keyof IConfirmPartMethodOptions;
            const customLabelProps = options[optionKey] as any;
            if (customLabelProps) {
                (confirmProps as any)[optionKey] = <CustomLabel {...customLabelProps} />;
            }
        }

        return confirmProps;
    });

    return props.map((options) => (
        <MobileContextConfirm
            key={options.id}
            {...options}
        >
            {options.children as ReactElement<IConfirmChildrenProps>}
        </MobileContextConfirm>
    ));
}
