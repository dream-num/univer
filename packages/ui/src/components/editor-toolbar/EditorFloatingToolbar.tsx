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

import type { ComponentProps, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import { IUniverInstanceService } from '@univerjs/core';
import { borderClassName, clsx, Dropdown, Tooltip } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { MoreDownIcon } from '@univerjs/icons';
import { useEffect, useRef, useState } from 'react';
import { useDependency } from '../../utils/di';
import { getEmbedBoundaryOwner, getEmbedChildUnitId } from '../../utils/embed-boundary';
import { RectPopup } from '../../views/components/popup/RectPopup';
import { preventBrowserZoomInContainers } from '../../views/hooks/prevent-browser-zoom';
import { shouldKeepFloatingToolbarMouseDownDefault } from './floating-toolbar-interaction';

function EditorToolbarBrowserZoomGuard(props: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        return preventBrowserZoomInContainers([container]);
    }, []);

    return <div ref={containerRef} className="univer-pointer-events-auto univer-contents">{props.children}</div>;
}

export function EditorToolbarTooltip(props: Omit<ComponentProps<typeof Tooltip>, 'visible' | 'onVisibleChange'> & { popupOpen: boolean }) {
    const { popupOpen, ...tooltipProps } = props;

    return popupOpen
        ? <Tooltip {...tooltipProps} visible={false} />
        : <InteractiveEditorToolbarTooltip {...tooltipProps} />;
}

function InteractiveEditorToolbarTooltip(props: Omit<ComponentProps<typeof Tooltip>, 'visible' | 'onVisibleChange'>) {
    const [tooltipVisible, setTooltipVisible] = useState(false);

    return (
        <Tooltip
            {...props}
            className={clsx('univer-delay-100 [animation-fill-mode:backwards]', props.className, `
              univer-pointer-events-none
            `)}
            visible={tooltipVisible}
            onVisibleChange={setTooltipVisible}
        />
    );
}

type EditorDropdownProps = Omit<ComponentProps<typeof Dropdown>, 'avoidCollisions'>;

function DirectionalEditorDropdown(props: EditorDropdownProps) {
    const { overlay, ...restProps } = props;
    const popupDirection = RectPopup.useDirection();
    const side = resolveEditorDropdownSide(popupDirection);

    return (
        <Dropdown
            {...restProps}
            overlay={<EditorToolbarBrowserZoomGuard>{overlay}</EditorToolbarBrowserZoomGuard>}
            side={side}
            avoidCollisions
        />
    );
}

export function EditorDropdown(props: EditorDropdownProps) {
    const instanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const editorFocusRef = useRef<{ element: HTMLElement; owner?: string; childUnitId?: string } | null>(null);
    const dropdownProps: EditorDropdownProps = {
        ...props,
        onOpenAutoFocus: (event) => {
            const activeElement = document.activeElement;
            const unitId = instanceService.getFocusedUnit()?.getUnitId();
            const element = activeElement instanceof HTMLElement && activeElement.dataset.uComp === 'editor'
                ? activeElement
                : unitId && renderManagerService.getRenderUnitById(unitId)?.engine.getCanvasElement();
            editorFocusRef.current = element instanceof HTMLElement
                ? { element, owner: getEmbedBoundaryOwner(element), childUnitId: getEmbedChildUnitId(element) }
                : null;
            props.onOpenAutoFocus?.(event);
        },
        onCloseAutoFocus: (event) => {
            const editorFocus = editorFocusRef.current;
            editorFocusRef.current = null;
            props.onCloseAutoFocus?.(event);
            if (
                event.defaultPrevented ||
                !editorFocus?.element.isConnected ||
                getEmbedBoundaryOwner(editorFocus.element) !== editorFocus.owner ||
                getEmbedChildUnitId(editorFocus.element) !== editorFocus.childUnitId
            ) {
                return;
            }

            const activeElement = editorFocus.element.ownerDocument.activeElement;
            const focusInClosingMenu = event.target instanceof HTMLElement && event.target.contains(activeElement);
            if (activeElement !== editorFocus.element.ownerDocument.body && activeElement !== editorFocus.element && !focusInClosingMenu) {
                return;
            }

            // Ribbon controls can own focus before opening; restore their unit's canvas, not a removable button.
            event.preventDefault();
            editorFocus.element.focus({ preventScroll: true });
        },
        onInteractOutside: (event) => {
            props.onInteractOutside?.(event);
            if (!event.defaultPrevented) {
                editorFocusRef.current = null;
            }
        },
    };
    if (props.side) {
        return <Dropdown {...dropdownProps} avoidCollisions />;
    }

    return <DirectionalEditorDropdown {...dropdownProps} />;
}

export function EditorToolbarIcon(props: { children: ReactNode; className?: string }) {
    const { children, className } = props;

    return (
        <span
            className={clsx(`
              univer-flex univer-size-5 univer-shrink-0 univer-items-center univer-justify-center univer-leading-none
            `, className)}
        >
            {children}
        </span>
    );
}

export function EditorFloatingToolbar(props: {
    children: ReactNode;
    className?: string;
    maxWidthClassName?: string;
    onMouseDown?: (event: MouseEvent<HTMLDivElement>) => void;
}) {
    const { children, className, maxWidthClassName, onMouseDown } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        return preventBrowserZoomInContainers([container]);
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseDown={(event) => {
                if (onMouseDown) {
                    onMouseDown(event);
                    return;
                }

                event.stopPropagation();
                if (!shouldKeepFloatingToolbarMouseDownDefault(event.target)) {
                    event.preventDefault();
                }
            }}
            className={clsx(`
              univer-box-border univer-flex univer-flex-wrap univer-items-center univer-rounded univer-bg-gray-0
              univer-px-1 univer-py-1 univer-shadow-sm
              dark:!univer-bg-gray-900
            `, borderClassName, maxWidthClassName ?? 'univer-max-w-[min(760px,calc(100vw-32px))]', className)}
        >
            {children}
        </div>
    );
}

export function EditorToolbarButton(props: {
    title?: string;
    active?: boolean;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
    sizeClassName?: string;
    popupOpen?: boolean;
    ariaExpanded?: boolean;
    onClick?: () => void;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
    onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
}) {
    const { title: titleProp, active, disabled, children, className, sizeClassName, popupOpen = false, ariaExpanded, onClick, onKeyDown, onMouseDown, onPointerDown } = props;
    const title = titleProp ?? '';

    return (
        <EditorToolbarTooltip title={title} placement="bottom" popupOpen={popupOpen}>
            <button
                type="button"
                aria-label={title}
                aria-expanded={ariaExpanded}
                disabled={disabled}
                onClick={onClick}
                onKeyDown={onKeyDown}
                onMouseDown={onMouseDown}
                onPointerDown={onPointerDown}
                className={clsx(`
                  univer-flex univer-items-center univer-justify-center univer-rounded-md univer-border-none
                  univer-bg-transparent univer-p-0 univer-text-xl univer-text-gray-700 univer-transition-colors
                  hover:univer-bg-gray-100
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
                  dark:!univer-text-gray-100
                  dark:hover:!univer-bg-gray-700
                `, sizeClassName ?? 'univer-h-6 univer-w-6', className, {
                    'univer-bg-gray-100 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-300': active,
                })}
            >
                {children}
            </button>
        </EditorToolbarTooltip>
    );
}

export function EditorDropdownTrigger(props: {
    title?: string;
    label?: string;
    icon: ReactNode;
    active?: boolean;
    className?: string;
    sizeClassName?: string;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
    onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
}) {
    const { title, label, icon, active, className, sizeClassName, onKeyDown, onMouseDown, onPointerDown } = props;

    return (
        <EditorToolbarButton
            title={title}
            active={active}
            popupOpen={active}
            ariaExpanded={active}
            className={className}
            sizeClassName={sizeClassName ?? (label
                ? 'univer-h-6 univer-w-full univer-min-w-0 !univer-justify-start univer-gap-1 univer-px-1.5'
                : 'univer-h-6 univer-min-w-9 univer-w-auto univer-gap-1 univer-px-1.5')}
            onKeyDown={onKeyDown}
            onMouseDown={onMouseDown}
            onPointerDown={onPointerDown}
        >
            {icon}
            {label && (
                <span
                    className="
                      univer-min-w-0 univer-flex-1 univer-truncate univer-text-left univer-text-xs
                      rtl:univer-text-right
                    "
                >
                    {label}
                </span>
            )}
            <MoreDownIcon
                className={clsx('univer-text-xs', label && `
                  univer-ml-auto
                  rtl:univer-ml-0 rtl:univer-mr-auto
                `)}
            />
        </EditorToolbarButton>
    );
}

export function resolveEditorDropdownSide(
    popupDirection: string,
    requestedSide?: 'top' | 'bottom'
): 'top' | 'bottom' {
    return requestedSide ?? (popupDirection.startsWith('bottom') ? 'bottom' : 'top');
}
