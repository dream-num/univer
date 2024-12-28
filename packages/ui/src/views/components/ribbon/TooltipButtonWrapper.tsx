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

import type { IDropdownLegacyProps, ITooltipProps, NullableTooltipRef } from '@univerjs/design';
import { DropdownLegacy, Tooltip } from '@univerjs/design';
import React, { createContext, forwardRef, useContext, useMemo, useState } from 'react';

const TooltipWrapperContext = createContext({
    dropdownVisible: false,
    setDropdownVisible: (_visible: boolean) => {},
});

export const TooltipWrapper = forwardRef<NullableTooltipRef, ITooltipProps>((props, ref) => {
    const { children, ...tooltipProps } = props;

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    function handleChangeTooltipVisible(visible: boolean) {
        if (dropdownVisible) {
            setTooltipVisible(false);
        } else {
            setTooltipVisible(visible);
        }
    }

    function handleChangeDropdownVisible(visible: boolean) {
        setDropdownVisible(visible);

        setTooltipVisible(false);
    }

    const contextValue = useMemo(() => ({
        dropdownVisible,
        setDropdownVisible: handleChangeDropdownVisible,
    }), [dropdownVisible]);

    return (
        <Tooltip
            ref={ref}
            {...tooltipProps}
            visible={tooltipVisible}
            asChild
            onVisibleChange={handleChangeTooltipVisible}
        >
            <span>
                <TooltipWrapperContext.Provider value={contextValue}>
                    {children}
                </TooltipWrapperContext.Provider>
            </span>
        </Tooltip>
    );
});

export function DropdownWrapper(props: IDropdownLegacyProps) {
    const { children, ...dropdownProps } = props;

    const { setDropdownVisible } = useContext(TooltipWrapperContext);

    function handleVisibleChange(visible: boolean) {
        setDropdownVisible(visible);
    }

    return (
        <DropdownLegacy
            onVisibleChange={handleVisibleChange}
            {...dropdownProps}
        >
            <div onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </DropdownLegacy>
    );
}
