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

import { ICommandService } from '@univerjs/core';
import { Popup } from '@univerjs/design';
import type { IMouseEvent } from '@univerjs/engine-render';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { useDependency, useInjector } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { Menu } from '../../../components/menu/Menu';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';

export function ContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [offset, setOffset] = useState<[number, number]>([0, 0]);

    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);
    const injector = useInjector();

    useEffect(() => {
        const disposables = contextMenuService.registerContextMenuHandler({
            handleContextMenu,
        });

        document.addEventListener('pointerdown', handleClose);
        document.addEventListener('wheel', handleClose);

        return () => {
            document.removeEventListener('pointerdown', handleClose);
            document.removeEventListener('wheel', handleClose);
            disposables.dispose();
        };
    }, []);

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
                {menuType && (
                    <Menu
                        menuType={[menuType]}
                        onOptionSelect={(params) => {
                            const { label: commandId, value } = params;
                            commandService && commandService.executeCommand(commandId as string, { value });
                            const textSelectionRenderManager = injector.get(ITextSelectionRenderManager);
                            textSelectionRenderManager.focus();
                            setVisible(false);
                        }}
                    />
                )}
            </section>
        </Popup>
    );
}
