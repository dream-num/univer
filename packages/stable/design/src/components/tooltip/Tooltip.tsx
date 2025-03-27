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

import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { TooltipContent, TooltipPrimitive, TooltipProvider, TooltipTrigger } from './TooltipPrimitive';

export interface ITooltipProps {
    /**
     * The trigger element
     */
    children: ReactNode;
    /**
     * The class name of the tooltip
     */
    className?: string;
    /**
     * Whether the tooltip is a child of the trigger element
     * @default false
     */
    asChild?: boolean;
    /**
     * The content of the tooltip
     * @description If not set, the tooltip will not be displayed. Although it can be set to ReactNode, it is recommended to use string.
     */
    title?: ReactNode;
    /**
     * The placement of the tooltip
     * @default 'bottom'
     */
    placement?: 'top' | 'right' | 'bottom' | 'left';
    /**
     * Whether the tooltip is displayed when the content is ellipsis
     * @default false
     */
    showIfEllipsis?: boolean;
    /**
     * Whether the tooltip is visible
     * @description If not set, the tooltip will be controlled by the component itself
     */
    visible?: boolean;
    /**
     * Callback when the visibility of the tooltip changes
     */
    onVisibleChange?: (visible: boolean) => void;
}

export function Tooltip(props: ITooltipProps) {
    const {
        children,
        className,
        asChild = true,
        title,
        placement = 'bottom',
        showIfEllipsis = false,
        visible: controlledVisible,
        onVisibleChange,
    } = props;

    // Internal state for uncontrolled mode
    const [uncontrolledVisible, setUncontrolledVisible] = useState(false);

    // Determine whether the tooltip is controlled or uncontrolled
    const isControlled = controlledVisible !== undefined;
    const visible = isControlled ? controlledVisible : uncontrolledVisible;

    const triggerRef = useRef<HTMLButtonElement>(null);

    function isContentOverflowing(element: HTMLElement): boolean {
        return Math.abs(element.scrollWidth - element.clientWidth) > 1;
    }

    function handleMouseEnter() {
        if (showIfEllipsis && triggerRef.current) {
            if (!isContentOverflowing(triggerRef.current)) return;
        }

        if (isControlled) {
            onVisibleChange?.(true);
        } else {
            setUncontrolledVisible(true);
        }
    }

    function handleMouseLeave() {
        if (isControlled) {
            onVisibleChange?.(false);
        } else {
            setUncontrolledVisible(false);
        }
    }

    return (
        <TooltipProvider>
            <TooltipPrimitive open={visible}>
                <TooltipTrigger
                    ref={triggerRef}
                    asChild={asChild}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {children}
                </TooltipTrigger>
                <TooltipContent className={className} side={placement}>
                    {title}
                </TooltipContent>
            </TooltipPrimitive>
        </TooltipProvider>
    );
}
