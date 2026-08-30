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

import type { ComponentProps, ComponentRef } from 'react';
import { forwardRef } from 'react';
import { clsx } from '../../helper/clsx';
import { DialogContent } from './DialogPrimitive';

export const MobileDialogContent = forwardRef<ComponentRef<typeof DialogContent>, ComponentProps<typeof DialogContent>>((props, ref) => {
    const { className, style, ...rest } = props;

    return (
        <DialogContent
            {...rest}
            ref={ref}
            className={clsx(`
              !univer-bottom-0 !univer-left-0 !univer-right-0 !univer-top-auto !univer-max-h-[80dvh] !univer-max-w-none
              !univer-translate-x-0 !univer-translate-y-0 !univer-gap-4 !univer-overflow-y-auto !univer-rounded-t-2xl
              !univer-p-4
              [&_[data-slot='dialog-footer']]:!univer-flex-row [&_[data-slot='dialog-footer']]:!univer-gap-3
              [&_[data-slot='dialog-footer']_button]:!univer-h-12 [&_[data-slot='dialog-footer']_button]:!univer-flex-1
              [&_button[data-slot='close']]:!univer-right-3 [&_button[data-slot='close']]:!univer-top-3
              [&_button[data-slot='close']]:!univer-size-10
            `, className)}
            style={{
                ...style,
                position: 'fixed',
                insetInline: 0,
                top: 'auto',
                bottom: 0,
                width: '100%',
                maxWidth: 'none',
                margin: 0,
                transform: 'none',
            }}
        />
    );
});
