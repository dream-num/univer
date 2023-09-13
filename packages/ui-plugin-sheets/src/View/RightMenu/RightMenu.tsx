import { IMouseEvent } from '@univerjs/base-render';
import { BaseRightMenuProps, IDisplayMenuItem, IMenuItem, Menu, MenuPosition } from '@univerjs/base-ui';
import { Component, createRef } from 'react';

import { RightMenuProps } from '../../Controller';
import Style from './index.module.less';

interface IState {
    visible: boolean;
    srcElement: any;
    eventType: string | null;
    children: RightMenuProps[];
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
    menuShow: boolean;
    clientPosition: {
        clientX: number;
        clientY: number;
    };
}

export class RightMenu extends Component<BaseRightMenuProps, IState> {
    root = createRef<HTMLDivElement>();

    constructor(props: BaseRightMenuProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            visible: false,
            srcElement: null,
            eventType: null,
            children: [],
            menuItems: [],
            menuShow: false,
            clientPosition: {
                clientX: 0,
                clientY: 0,
            },
        };
    }

    setMenuList(children: RightMenuProps[]) {
        this.setState({
            children,
        });
    }

    setMenuListNeo = (menuItems: IMenuItem[]) => {
        this.setState({
            menuItems,
        });
    };

    // TODO:添加到具体的元素
    override componentDidMount() {
        this.props.getComponent?.(this);
        // 添加右键点击、点击事件监听
        document.addEventListener('click', this.handleClick);
    }

    override componentWillUnmount() {
        // 移除事件监听
        document.removeEventListener('click', this.handleClick);
    }

    // 右键菜单事件
    handleContextMenu = async (event: IMouseEvent) => {
        event.preventDefault();

        this.setState({ visible: true, srcElement: event.target, eventType: event.type }, () => {
            new Promise<void>((resolve, reject) => {
                resolve();
            }).then(() => {
                // clientX/Y obtains the distance between the trigger point and the upper left corner of the browser's visible area.
                this.setState({
                    clientPosition: {
                        clientX: event.clientX,
                        clientY: event.clientY,
                    },
                });

                this.showRightMenu(true);
            });
        });
    };

    // 鼠标单击事件，当鼠标在任何地方单击时，设置菜单不显示
    handleClick = (e: MouseEvent) => {
        const { visible, eventType, srcElement } = this.state;
        if (!this.root.current) return;
        if (eventType === 'click' && srcElement && srcElement.contains(e.target)) {
            return;
        }
        if (this.root.current.contains(e.target as Node)) {
            return;
        }
        if (visible) {
            this.setState({ visible: false });
        }
    };

    // 显示隐藏菜单栏
    showRightMenu(show: boolean) {
        this.setState({
            menuShow: show,
        });
    }

    override render() {
        const wrapStyles = { ...this.props.style };
        const { visible, menuShow, clientPosition } = this.state;

        return (
            visible && (
                <div
                    ref={this.root}
                    className={Style.contextMenu}
                    style={wrapStyles}
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Menu
                        show={menuShow}
                        menuId={MenuPosition.CONTEXT_MENU}
                        onClick={this.handleClick}
                        clientPosition={clientPosition}
                        onOptionSelect={() => {
                            this.showRightMenu(false);
                        }}
                    ></Menu>
                </div>
            )
        );
    }
}
