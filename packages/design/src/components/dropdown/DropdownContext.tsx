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

import type { RefObject } from 'react';
import { createContext, useContext } from 'react';

interface IDropdownContextType {
    show: boolean;
    updateShow: (value: boolean) => void;
    disabled: boolean;
    overlayRef: RefObject<HTMLDivElement>;
    triggerRef: RefObject<HTMLElement>;
}

export const DropdownContext = createContext<IDropdownContextType | null>(null);

export const useDropdown = () => {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error('useDropdown must be used within a DropdownProvider');
    }
    return context;
};
