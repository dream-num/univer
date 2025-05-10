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
import { Root } from '@radix-ui/react-separator';
import { clsx } from '../../helper/clsx';

function Separator({
    className,
    orientation = 'horizontal',
    decorative = true,
    ...props
}: ComponentProps<typeof Root>) {
    return (
        <Root
            data-slot="separator-root"
            decorative={decorative}
            orientation={orientation}
            className={clsx(
                `
                  univer-shrink-0 univer-bg-gray-200
                  dark:univer-bg-gray-600
                  data-[orientation=horizontal]:univer-h-px data-[orientation=horizontal]:univer-w-full
                  data-[orientation=vertical]:univer-h-full data-[orientation=vertical]:univer-w-px
                `,
                className
            )}
            {...props}
        />
    );
}

export { Separator };
