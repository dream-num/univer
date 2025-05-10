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

export type IToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ visibleToasts, ...props }: IToasterProps) => {
    return (
        <Sonner
            className={`
              [&_[data-description]]:univer-text-sm [&_[data-description]]:univer-text-gray-600
              [&_[data-icon]]:univer-self-baseline
              [&_[data-icon]>svg]:univer-relative [&_[data-icon]>svg]:univer-top-1
              [&_[data-sonner-toast]]:univer-shadow-md
              [&_[data-title]]:univer-text-sm [&_[data-title]]:univer-text-gray-900
              dark:[&_[data-description]]:univer-text-gray-200
            `}
            toastOptions={{
                classNames: {
                    content: 'univer-leading-normal',
                    success: '[&_[data-icon]]:univer-text-green-500',
                    info: '[&_[data-icon]]:univer-text-primary-600',
                    error: '[&_[data-icon]]:univer-text-red-500',
                    warning: '[&_[data-icon]]:univer-text-yellow-500',
                },
            }}
            visibleToasts={visibleToasts ?? 5}
            {...props}
        />
    );
};

export { toast, Toaster };
