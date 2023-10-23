import { IMouseEvent } from '@univerjs/base-render';
import { DisposableCollection, ICommandService } from '@univerjs/core';
import { RediContext, useDependency } from '@wendellhu/redi/react-bindings';
import React, { useContext, useEffect, useState } from 'react';

import { Dropdown2 } from '../../../Components/Dropdown/Dropdown2';
import { Menu2 } from '../../../Components/Menu/Menu2';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';

export interface IProps {
    children: React.ReactElement;
}

export function ContextMenu(props: IProps) {
    const { children } = props;

    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [menuType, setMenuType] = useState('');

    const context = useContext(RediContext);

    const contextMenuService = useDependency(IContextMenuService);

    useEffect(() => {
        const _disposables = new DisposableCollection();

        document.addEventListener('click', handleClick);

        _disposables.add(
            contextMenuService.registerContextMenuHandler({
                handleContextMenu,
            })
        );

        return () => {
            document.removeEventListener('click', handleClick);
            _disposables.dispose();
        };
    }, []);

    function handleVisibleChange(visible: boolean) {
        setVisible(visible);
    }

    function handleContextMenu(event: IMouseEvent, menuType: string) {
        event.preventDefault();

        requestIdleCallback(() => {
            setVisible(true);
        });

        // TODO: should calculate the correct position when the menu is too close to the edge of the viewport @jikkai
        setPosition({
            x: event.clientX,
            y: event.clientY,
        });

        setMenuType(menuType);
    }

    function handleClick() {
        if (visible) {
            setVisible(false);
        }
    }

    return (
        <Dropdown2
            visible={visible}
            trigger={['contextMenu']}
            alignPoint
            align={{ offset: [position.x, position.y] }}
            overlay={
                <Menu2
                    menuType={menuType}
                    onOptionSelect={(params) => {
                        const { label: commandId, value } = params;
                        const commandService = context.injector?.get(ICommandService);
                        commandService && commandService.executeCommand(commandId as string, { value });
                        setVisible(false);
                    }}
                />
            }
            onVisibleChange={handleVisibleChange}
        >
            {children}
        </Dropdown2>
    );
}
