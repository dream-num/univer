import { IMouseEvent } from '@univerjs/base-render';
import { RediContext, WithDependency } from '@wendellhu/redi/react-bindings';
import { Component, createRef } from 'react';

import { Menu } from '../../../Components';
import { BaseMenuItem } from '../../../Interfaces/Menu';
import { IContextMenuService } from '../../../services/contextmenu/contextmenu.service';
import { IDisplayMenuItem, IMenuItem, MenuPosition } from '../../../services/menu/menu';
import styles from './contextmenu.module.less';

// WTF: props here is not correct
export interface IContextMenuProps extends BaseMenuItem {}

export interface IContextMenuState {
    visible: boolean;
    srcElement?: HTMLElement; // FIXME: any?
    eventType: string | null;
    children: IContextMenuProps[];
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export class ContextMenu extends Component<IContextMenuProps, IContextMenuState> {
    static override contextType = RediContext;

    @WithDependency(IContextMenuService)
    private declare contextMenuService: IContextMenuService;

    declare context: typeof RediContext;

    private menuRef = createRef<Menu>();

    private rootRef = createRef<HTMLDivElement>();

    constructor(props: IContextMenuProps) {
        super(props);

        this.state = {
            visible: false,
            srcElement: null, // WTF: this property is weird
            eventType: null, // WTF: this property is weird
            children: [] as IContextMenuProps[],
            menuItems: [] as Array<IDisplayMenuItem<IMenuItem>>,
        };
    }

    override componentDidMount() {
        document.addEventListener('click', this.handleClick);

        // TODO: dispose
        this.contextMenuService.registerContextMenuHandler({
            handleContextMenu: this.handleContextMenu,
        });
    }

    override componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClick);
    }

    showContextMenu(show: boolean) {
        this.menuRef.current?.showMenu(show);
    }

    override render() {
        const { visible } = this.state;

        return (
            visible && (
                <div ref={this.rootRef} className={styles.contextMenu} onContextMenu={(e) => e.preventDefault()}>
                    <Menu ref={this.menuRef} menuId={MenuPosition.CONTEXT_MENU} onClick={this.handleClick} />
                </div>
            )
        );
    }

    handleContextMenu = async (event: IMouseEvent, rect?: any, down?: boolean) => {
        event.preventDefault();

        // FIXME: srcElement is deprecated
        // FIXME: contextmenu position algorithm is not correct
        this.setState({ visible: true, srcElement: event.srcElement, eventType: event.type }, () => {
            new Promise<void>((resolve, reject) => {
                this.menuRef.current?.showMenu(true);
                resolve();
            }).then(() => {
                // clientX/Y 获取到的是触发点相对于浏览器可视区域左上角距离
                const clickX = !down ? event.clientX : rect.x;
                const clickY = !down ? event.clientY : rect.y;

                // window.innerWidth/innerHeight 获取的是当前浏览器窗口的视口宽度/高度
                const screenW = window.innerWidth;
                const screenH = window.innerHeight;
                // 获取自定义菜单的宽度/高度
                const currentUl = this.menuRef.current?.getMenuRef().current;
                const rootW = currentUl?.offsetWidth || 0;
                const rootH = currentUl?.offsetHeight || 0;

                // right为true，说明鼠标点击的位置到浏览器的右边界的宽度可以放下菜单。否则，菜单放到左边。
                // bottom为true，说明鼠标点击位置到浏览器的下边界的高度可以放下菜单。否则，菜单放到上边。
                const right = screenW - clickX > rootW;
                const left = !right;
                const bottom = screenH - clickY > rootH;
                const top = !bottom;

                const current = this.rootRef.current;
                if (!current) {
                    return;
                }

                if (right) {
                    current.style.left = `${clickX}px`;
                }
                if (left) {
                    current.style.left = `${clickX - rootW}px`;
                }

                if (bottom) {
                    current.style.top = `${clickY}px`;
                }
                if (top) {
                    current.style.top = `${clickY - rootH}px`;
                }
            });
        });
    };

    private handleClick = (e: MouseEvent) => {
        const { visible, eventType, srcElement } = this.state;
        if (!this.rootRef.current) {
            return;
        }

        if (eventType === 'click' && srcElement && srcElement.contains(e.target)) {
            return;
        }

        if (this.rootRef.current.contains(e.target)) {
            return;
        }

        if (visible) {
            this.setState({ visible: false });
        }
    };
}
