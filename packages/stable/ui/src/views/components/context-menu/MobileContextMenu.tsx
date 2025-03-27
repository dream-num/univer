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

import type { IMouseEvent } from '@univerjs/engine-render';
import { ICommandService } from '@univerjs/core';
import { Popup } from '@univerjs/design';
import React, { useEffect, useRef, useState } from 'react';
import { MobileMenu } from '../../../components/menu/mobile/MobileMenu';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { useDependency } from '../../../utils/di';

export function MobileContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [offset, setOffset] = useState<[number, number]>([0, 0]);
    const visibleRef = useRef(visible);
    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);
    visibleRef.current = visible;

    useEffect(() => {
        const disposables = contextMenuService.registerContextMenuHandler({
            handleContextMenu,
            hideContextMenu() {
                setVisible(false);
            },
            get visible() {
                return visibleRef.current;
            },
        });

        document.addEventListener('pointerdown', handleClose);
        document.addEventListener('wheel', handleClose);

        return () => {
            document.removeEventListener('pointerdown', handleClose);
            document.removeEventListener('wheel', handleClose);
            disposables.dispose();
        };
    }, [contextMenuService]);

    function handleContextMenu(event: IMouseEvent, menuType: string) {
        setMenuType(menuType);
        setOffset([event.clientX, event.clientY]);
        setVisible(true);
    }

    function handleClose() {
        setVisible(false);
    }

    return (
        <Popup visible={visible} offset={offset}>
            <section onPointerDown={(e) => e.stopPropagation()}>
                {/* TODO@wzhudev: maybe we should add another component for mobile devices. */}
                {menuType && (
                    // TODO@wzhudev: change to mobile menu
                    <MobileMenu
                        menuType={menuType}
                        onOptionSelect={(params) => {
                            const { label: id, value, commandId } = params;
                            commandService && commandService.executeCommand(commandId ?? id as string, { value });
                            setVisible(false);
                        }}
                    />
                )}
            </section>
        </Popup>
    );
}
