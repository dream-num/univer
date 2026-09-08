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

import type { IDropdownProps } from './Dropdown';
import { createContext, useCallback, useState } from 'react';
import { MobileDropdownSurface } from './MobileDropdownSurface';

export type IMobileDropdownProps = IDropdownProps;

export const MobileDropdownCloseContext = createContext<(() => void) | undefined>(undefined);

export function MobileDropdown(props: IMobileDropdownProps) {
    const {
        children,
        overlay,
        disabled,
        open: controlledOpen,
        onOpenChange: controlledOnOpenChange,
    } = props;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const handleChangeOpen = useCallback((newOpen: boolean) => {
        if (disabled) {
            return;
        }

        if (!isControlled) {
            setUncontrolledOpen(newOpen);
        }

        controlledOnOpenChange?.(newOpen);
    }, [controlledOnOpenChange, disabled, isControlled]);
    const handleClose = useCallback(() => handleChangeOpen(false), [handleChangeOpen]);

    return (
        <MobileDropdownCloseContext.Provider value={handleClose}>
            <MobileDropdownSurface
                open={open}
                disabled={disabled}
                onOpenChange={handleChangeOpen}
                content={overlay}
            >
                {children}
            </MobileDropdownSurface>
        </MobileDropdownCloseContext.Provider>
    );
}
