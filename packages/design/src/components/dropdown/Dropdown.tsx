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

import type { ComponentProps, ReactNode } from 'react';
import { useContext, useState } from 'react';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { MobileDropdownSurface } from './MobileDropdownSurface';
import { PopoverContent, PopoverPrimitive, PopoverTrigger } from './PopoverPrimitive';

export interface IDropdownProps extends ComponentProps<typeof PopoverContent> {
    children: ReactNode;
    overlay: ReactNode;
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Dropdown(props: IDropdownProps) {
    const {
        children,
        overlay,
        disabled,
        open: controlledOpen,
        onOpenChange: controlledOnOpenChange,
        forceMount,
        ...restProps
    } = props;

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const { mobile } = useContext(ConfigContext);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    function handleChangeOpen(newOpen: boolean) {
        if (disabled) return;

        if (!isControlled) {
            setUncontrolledOpen(newOpen);
        }

        controlledOnOpenChange?.(newOpen);
    }

    if (mobile) {
        return (
            <MobileDropdownSurface
                open={open}
                disabled={disabled}
                onOpenChange={handleChangeOpen}
                content={overlay}
            >
                {children}
            </MobileDropdownSurface>
        );
    }

    return (
        <PopoverPrimitive open={open} onOpenChange={handleChangeOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            {(open || forceMount) && (
                <PopoverContent forceMount={forceMount} {...restProps}>
                    {overlay}
                </PopoverContent>
            )}
        </PopoverPrimitive>
    );
}
