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

import type { IConfirmProps } from '@univerjs/design';
import type { IConfirmPartMethodOptions } from './interface';
import { useDependency } from '@univerjs/core';
import { Confirm } from '@univerjs/design';

import React, { useEffect, useState } from 'react';
import { CustomLabel } from '../../../components/custom-label/CustomLabel';
import { IConfirmService } from '../../../services/confirm/confirm.service';

export function ConfirmPart() {
    const confirmService = useDependency(IConfirmService);

    const [confirmOptions, setConfirmOptions] = useState<IConfirmPartMethodOptions[]>([]);

    useEffect(() => {
        const subscription = confirmService.confirmOptions$.subscribe((options: IConfirmPartMethodOptions[]) => {
            setConfirmOptions(options);
        });

        return () => {
            subscription.unsubscribe();
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
