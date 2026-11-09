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

import type { ComponentProps } from 'react';
import { Toaster as Sonner, toast } from 'sonner';
import { notificationClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

export type IToasterProps = ComponentProps<typeof Sonner>;

function Toaster({ visibleToasts, ...props }: IToasterProps) {
    return (
        <Sonner
            className={clsx(notificationClassName, `
              [&_[data-icon]>svg]:univer-relative [&_[data-icon]>svg]:univer-top-1
              [&_[data-icon]]:univer-self-baseline
            `)}
            toastOptions={{
                classNames: {
                    content: 'univer-leading-normal',
                    success: '[&_[data-icon]]:univer-text-green-600 dark:[&_[data-icon]]:!univer-text-green-400',
                    info: '[&_[data-icon]]:univer-text-primary-600 dark:[&_[data-icon]]:!univer-text-primary-300',
                    error: '[&_[data-icon]]:univer-text-red-600 dark:[&_[data-icon]]:!univer-text-red-400',
                    warning: '[&_[data-icon]]:univer-text-yellow-600 dark:[&_[data-icon]]:!univer-text-yellow-400',
                },
            }}
            visibleToasts={visibleToasts ?? 5}
            {...props}
        />
    );
};

export { toast, Toaster };
