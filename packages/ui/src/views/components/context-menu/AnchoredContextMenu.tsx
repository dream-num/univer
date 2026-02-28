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

import type { IValueOption } from '../../../services/menu/menu';
import { Popup } from '@univerjs/design';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { IContextMenuHostService } from '../../../services/contextmenu/contextmenu-host.service';
import { useDependency } from '../../../utils/di';
import { CONTEXT_MENU_SUBMENU_PORTAL_ATTR, ContextMenuPanel } from './ContextMenuPanel';

export interface IContextMenuAnchorRect {
    left: number;
    top: number;
    bottom: number;
}

export interface IAnchoredContextMenuProps {
    hostId: string;
    visible: boolean;
    anchorRect: IContextMenuAnchorRect | null;
    menuType: string;
    anchorVertical?: 'top' | 'bottom';
    menuOffset?: number;
    onRequestClose: () => void;
    onOptionSelect?: (option: IValueOption) => void;
}

export function AnchoredContextMenu(props: IAnchoredContextMenuProps) {
    const {
        hostId,
        visible,
        anchorRect,
        menuType,
        anchorVertical = 'bottom',
        menuOffset = 0,
        onRequestClose,
        onOptionSelect,
    } = props;
    const contentRef = useRef<HTMLDivElement>(null);
    const contextMenuHostService = useDependency(IContextMenuHostService);
    const onRequestCloseRef = useRef(onRequestClose);
    const menuSessionVersionRef = useRef(0);
    const visibleRef = useRef(visible);
    const menuTypeRef = useRef(menuType);

    useEffect(() => {
        onRequestCloseRef.current = onRequestClose;
    }, [onRequestClose]);

    if (visible && (!visibleRef.current || menuType !== menuTypeRef.current)) {
        menuSessionVersionRef.current += 1;
    }
    visibleRef.current = visible;
    menuTypeRef.current = menuType;

    useEffect(() => {
        const disposable = contextMenuHostService.registerMenu(hostId, () => {
            onRequestCloseRef.current();
        });

        return () => {
            disposable.dispose();
            contextMenuHostService.deactivateMenu(hostId);
        };
    }, [contextMenuHostService, hostId]);

    useLayoutEffect(() => {
        if (visible) {
            contextMenuHostService.activateMenu(hostId);
            return;
        }

        contextMenuHostService.deactivateMenu(hostId);
    }, [contextMenuHostService, hostId, visible]);

    useEffect(() => {
        if (!visible) {
            return;
        }

        const isTargetInSubmenu = (target: EventTarget | null) => {
            return target instanceof Element
                && target.closest(`[${CONTEXT_MENU_SUBMENU_PORTAL_ATTR}]`);
        };

        const handlePointerDown = (event: PointerEvent) => {
            if (isTargetInSubmenu(event.target)) {
                return;
            }

            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                onRequestCloseRef.current();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onRequestCloseRef.current();
            }
        };

        const handleWheel = (event: WheelEvent) => {
            if (isTargetInSubmenu(event.target)) {
                event.stopPropagation();
                return;
            }

            if (contentRef.current?.contains(event.target as Node)) {
                event.stopPropagation();
                return;
            }

            event.preventDefault();
            event.stopPropagation();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('wheel', handleWheel, { capture: true, passive: false });

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('wheel', handleWheel, true);
        };
    }, [visible]);

    const offset = useMemo<[number, number]>(() => {
        if (!anchorRect) {
            return [0, 0];
        }

        const anchorY = anchorVertical === 'top' ? anchorRect.top : anchorRect.bottom;
        const offsetY = anchorVertical === 'top'
            ? anchorY - menuOffset
            : anchorY + menuOffset;
        return [anchorRect.left, offsetY];
    }, [anchorRect, anchorVertical, menuOffset]);

    return (
        <Popup
            visible={visible && !!anchorRect}
            offset={offset}
            overflowVisible
            placementY={anchorVertical === 'top' ? 'above' : 'below'}
        >
            <section ref={contentRef}>
                {menuType && (
                    <ContextMenuPanel
                        menuType={menuType}
                        menuSessionVersion={menuSessionVersionRef.current}
                        onOptionSelect={onOptionSelect}
                    />
                )}
            </section>
        </Popup>
    );
}
