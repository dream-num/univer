import { IMouseEvent } from '@univerjs/base-render';
import { DisposableCollection, ICommandService } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { Menu2 } from '../../../Components/Menu/Menu2';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';

export interface IProps {
    children: React.ReactElement;
}

export function ContextMenu(props: IProps) {
    const { children } = props;

    const [visible, setVisible] = useState(false);
    const [menuType, setMenuType] = useState('');

    const contextMenuService = useDependency(IContextMenuService);
    const commandService = useDependency(ICommandService);

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

        setMenuType(menuType);
    }

    function handleClick() {
        if (visible) {
            setVisible(false);
        }
    }

    return (
        <Dropdown
            visible={visible}
            trigger={['contextMenu']}
            alignPoint
            overlay={
                <Menu2
                    menuType={[menuType]}
                    onOptionSelect={(params) => {
                        const { label: commandId, value } = params;
                        commandService && commandService.executeCommand(commandId as string, { value });
                        setVisible(false);
                    }}
                />
            }
            onVisibleChange={handleVisibleChange}
        >
            {children}
        </Dropdown>
    );
}
