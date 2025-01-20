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

import type { ReactElement } from 'react';
import { cloneElement, isValidElement } from 'react';
import { useDropdown } from './DropdownContext';

interface IDropdownTriggerProps {
    children: ReactElement;
}

export function DropdownTrigger({ children }: IDropdownTriggerProps) {
    const { show, updateShow, triggerRef } = useDropdown();

    if (!isValidElement(children)) {
        throw new Error('DropdownTrigger children must be a valid React element');
    }

    // eslint-disable-next-line react/no-clone-element
    return cloneElement(children, {
        ref: triggerRef,
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            updateShow(!show);
            // eslint-disable-next-line ts/no-explicit-any
            (children.props as React.HTMLProps<HTMLElement>)?.onClick?.(e as any);
        },
    // eslint-disable-next-line ts/no-explicit-any
    } as any);
}
