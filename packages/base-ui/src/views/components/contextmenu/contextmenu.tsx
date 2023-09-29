import { IMouseEvent } from '@univerjs/base-render';
import { DisposableCollection, ICommandService } from '@univerjs/core';
import { RediContext, WithDependency } from '@wendellhu/redi/react-bindings';
import React, { Component, createRef } from 'react';

import { BaseMenuItem, Menu } from '../../../Components';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { IDisplayMenuItem, IMenuItem } from '../../../services/menu/menu';
import styles from './contextmenu.module.less';

// WTF: props here is not correct
export interface IContextMenuProps extends BaseMenuItem {}

export interface IContextMenuState {
    visible: boolean;
    children: IContextMenuProps[];
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
    menuType: string;
    clientPosition: {
        clientX: number;
        clientY: number;
    };
}

export class ContextMenu extends Component<IContextMenuProps, IContextMenuState> {
    static override contextType = RediContext;

    declare context: React.ContextType<typeof RediContext>;

    @WithDependency(IContextMenuService)
    private declare contextMenuService: IContextMenuService;

    private rootRef = createRef<HTMLDivElement>();

    private _disposables = new DisposableCollection();

    constructor(props: IContextMenuProps) {
        super(props);

        this.state = {
            visible: false,
            children: [] as IContextMenuProps[],
            menuItems: [] as Array<IDisplayMenuItem<IMenuItem>>,
            menuType: '',
            clientPosition: {
                clientX: 0,
                clientY: 0,
            },
        };
    }

    override componentDidMount() {
        document.addEventListener('click', this.handleClick);

        this._disposables.add(
            this.contextMenuService.registerContextMenuHandler({
                handleContextMenu: this.handleContextMenu,
            })
        );
    }

    override componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClick);
        this._disposables.dispose();
    }

    override render() {
        const { visible, clientPosition, menuType } = this.state;

        return (
            visible && (
                <div ref={this.rootRef} className={styles.contextMenu} onContextMenu={(e) => e.preventDefault()}>
                    <Menu
                        menuId={menuType}
                        onClick={this.handleClick}
                        clientPosition={clientPosition}
                        show={visible}
                        onOptionSelect={(params) => {
                            const { label: commandId, value } = params;
                            const commandService = this.context.injector?.get(ICommandService);
                            commandService && commandService.executeCommand(commandId as string, { value });
                            this.setState({ visible: false });
                        }}
                    />
                </div>
            )
        );
    }

    handleContextMenu = async (event: IMouseEvent, menuType: string) => {
        event.preventDefault();

        this.setState({ visible: true }, () => {
            new Promise<void>((resolve) => {
                resolve();
            }).then(() => {
                // clientX/Y obtains the distance between the trigger point and the upper left corner of the browser's visible area.
                this.setState({
                    clientPosition: {
                        clientX: event.clientX,
                        clientY: event.clientY,
                    },
                    menuType,
                });
            });
        });
    };

    private handleClick = (e: MouseEvent) => {
        const { visible } = this.state;
        if (!this.rootRef.current) {
            return;
        }

        if (this.rootRef.current.contains(e.target as Node)) {
            return;
        }

        if (visible) {
            this.setState({ visible: false });
        }
    };
}
