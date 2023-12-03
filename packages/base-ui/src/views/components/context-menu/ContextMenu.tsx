import type { IMouseEvent } from '@univerjs/base-render';
import { ICommandService } from '@univerjs/core';
import { Popup } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { Menu } from '../../../components/menu/Menu';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';

export interface IProps {}

export function ContextMenu() {
    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [offset, setOffset] = useState<[number, number]>([0, 0]);

    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);

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
                <Menu
                    menuType={[menuType]}
                    onOptionSelect={(params) => {
                        const { label: commandId, value } = params;
                        commandService && commandService.executeCommand(commandId as string, { value });
                        setVisible(false);
                    }}
                />
            </section>
        </Popup>
    );
}
