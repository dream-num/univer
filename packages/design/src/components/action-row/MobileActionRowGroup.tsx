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

import type { IActionRowProps } from './ActionRow';
import { clsx } from '../../helper/clsx';

export type IMobileActionRowGroupProps = IActionRowProps;

export function MobileActionRowGroup({ className, ...props }: IMobileActionRowGroupProps) {
    return (
        <div
            className={clsx(className, `
              univer-flex univer-w-full univer-justify-stretch univer-gap-3
              [&>button]:!univer-m-0 [&>button]:!univer-h-12 [&>button]:!univer-min-w-0 [&>button]:!univer-flex-1
              [&>button]:!univer-rounded-xl
            `)}
            {...props}
        />
    );
}
