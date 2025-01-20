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

import { useDependency } from '@univerjs/core';
import { ComponentManager, useObservable } from '@univerjs/ui';
import React from 'react';
import { DataValidationDropdownManagerService } from '../../../services/dropdown-manager.service';

export function CellDropdown() {
    const dropdownManagerService = useDependency(DataValidationDropdownManagerService);
    const activeDropdown = useObservable(dropdownManagerService.activeDropdown$, dropdownManagerService.activeDropdown);
    const componentManager = useDependency(ComponentManager);
    if (!activeDropdown) {
        return null;
    }

    const { location, componentKey } = activeDropdown;
    const Component = componentManager.get(componentKey);

    const key = `${location.unitId}-${location.subUnitId}-${location.row}-${location.col}`;

    if (!Component) {
        return null;
    }

    const hideFn = () => {
        dropdownManagerService.hideDropdown();
    };

    return (
        <Component
            key={key}
            location={location}
            hideFn={hideFn}
        />
    );
}
