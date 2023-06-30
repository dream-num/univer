import { IMouseEvent } from '@univerjs/base-render';
import { BaseRightMenuProps, Component, createRef, Menu } from '@univerjs/base-ui';
import { RightMenuProps } from '../../Controller';
import Style from './index.module.less';

interface IState {
    visible: boolean;
    srcElement: any;
    eventType: string | null;
    children: RightMenuProps[];
}

export class RightMenu extends Component<BaseRightMenuProps, IState> {
    ulRef = createRef();

    root = createRef();

    initialize() {
        this.state = {
            visible: false,
            srcElement: null,
            eventType: null,
            children: [],
        };
    }

    setMenuList(children: RightMenuProps[]) {
        this.setState({
            children,
        });
    }

    // TODO:添加到具体的元素
    componentDidMount() {
        this.props.getComponent?.(this);
        // 添加右键点击、点击事件监听
        document.addEventListener('click', this.handleClick);
    }

    componentWillUnmount() {
        // 移除事件监听
        document.removeEventListener('click', this.handleClick);
    }

    // 右键菜单事件
    handleContextMenu = async (event: IMouseEvent, rect?: any, down?: boolean) => {
        event.preventDefault();

        this.setState({ visible: true, srcElement: event.target, eventType: event.type }, () => {
            new Promise<void>((resolve, reject) => {
                this.ulRef.current.showMenu(true);
                resolve();
            }).then(() => {
                // clientX/Y 获取到的是触发点相对于浏览器可视区域左上角距离
                const clickX = !down ? event.clientX : rect.x;
                const clickY = !down ? event.clientY : rect.y;

                // console.log(event);

                // window.innerWidth/innerHeight 获取的是当前浏览器窗口的视口宽度/高度
                const screenW = window.innerWidth;
                const screenH = window.innerHeight;
                // 获取自定义菜单的宽度/高度

                const rootW = this.ulRef.current.base.offsetWidth;
                const rootH = this.ulRef.current.base.offsetHeight;

                // right为true，说明鼠标点击的位置到浏览器的右边界的宽度可以放下菜单。否则，菜单放到左边。
                // bottom为true，说明鼠标点击位置到浏览器的下边界的高度可以放下菜单。否则，菜单放到上边。
                const right = screenW - clickX > rootW;
                const left = !right;
                const bottom = screenH - clickY > rootH;
                const top = !bottom;

                if (right) {
                    this.root.current.style.left = `${clickX}px`;
                }

                if (left) {
                    this.root.current.style.left = `${clickX - rootW}px`;
                }

                if (bottom) {
                    this.root.current.style.top = `${clickY}px`;
                }
                if (top) {
                    this.root.current.style.top = `${clickY - rootH}px`;
                }
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
        if (this.root.current.contains(e.target)) {
            return;
        }
        if (visible) {
            this.setState({ visible: false });
        }
    };

    // 显示隐藏菜单栏
    showRightMenu(show: boolean) {
        this.ulRef.current.showMenu(show);
    }

    render() {
        if (!this.state.children.length) {
            return;
        }

        const wrapStyles = { ...this.props.style };
        const { visible } = this.state;

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
                    <Menu ref={this.ulRef} menu={this.state.children} onClick={this.handleClick}></Menu>
                </div>
            )
        );
    }
}
