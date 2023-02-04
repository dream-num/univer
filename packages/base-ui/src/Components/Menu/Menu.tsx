import { BaseMenuProps, JSXComponent, Component, MenuComponent, createRef, BaseMenuItem, joinClassNames, BaseMenuState, BaseMenuStyle } from '@univerjs/base-ui';
import styles from './index.module.less';

export class Menu extends Component<BaseMenuProps, BaseMenuState> {
    private _MenuRef = createRef<HTMLUListElement>();

    private _refs: Menu[] = [];

    protected initialize() {
        this.state = {
            show: false,
            posStyle: {},
        };
    }

    getMenuRef = () => this._MenuRef;

    handleClick = (e: MouseEvent, item: BaseMenuItem, index: number) => {
        const { deep = 0 } = this.props;

        item.onClick?.call(null, e, item.value, index, deep);
        this.props.onClick?.call(null, e, item.value, index, deep);
        this.showMenu(false);
    };

    showMenu = (show: boolean) => {
        this.setState(
            (prevState) => ({ show }),
            () => {
                this.getStyle();
            }
        );
    };

    mouseEnter = (e: MouseEvent, index: number) => {
        const { menu = [] } = this.props;
        if (menu[index].children) {
            this._refs[index].showMenu(true);
        }
    };

    mouseLeave = (e: MouseEvent, index: number) => {
        const { menu = [] } = this.props;
        if (menu[index].children) {
            this._refs[index].showMenu(false);
        }
    };

    getStyle = () => {
        const current = this._MenuRef.current;
        if (!current) return;
        let style: BaseMenuStyle = {};
        const curPosition = current.getBoundingClientRect();
        let docPosition;
        const { dom, parent } = this.props;
        // if (dom) {
        //     docPosition = dom.getBoundingClientRect();
        // } else {
        docPosition = {
            left: 0,
            right: document.documentElement.clientWidth,
            top: 0,
            bottom: document.documentElement.clientHeight,
        };
        // }

        // 处理li中包含的ul右边界
        if (parent) {
            current.style.position = 'fixed';
            // 获取固定定位后 父元素正确的位置信息
            let parPosition = current.parentElement?.getBoundingClientRect();
            if (!parPosition) return;
            if (parPosition.right + curPosition.width > docPosition.right) {
                style.left = `${parPosition.left - curPosition.width}px`;
                style.top = `${parPosition.top}px`;
            } else {
                style.left = `${parPosition.right}px`;
                style.top = `${parPosition.top}px`;
            }
            this.setState({
                posStyle: style,
            });
        }
        // else {
        //     if (curPosition.width > docPosition!.right) {
        //         // 边界碰到univer-main-content右边界或者小于视口
        //         style.right = '0';
        //         style.left = 'auto';
        //     } else {
        //         style.left = '0';
        //         style.right = 'auto';
        //     }
        //     if (curPosition.top >= docPosition.bottom) {
        //         style.top = 'auto';
        //         style.bottom = '100%';
        //     }
        // }
    };

    render() {
        const { className = '', style = '', menu, deep = 0 } = this.props;
        const { show, posStyle } = this.state;

        return (
            <ul className={joinClassNames(styles.colsMenu, className)} style={{ ...style, ...posStyle, display: show ? 'block' : 'none' }} ref={this._MenuRef}>
                {menu?.map((item: BaseMenuItem, index: number) => {
                    if (item.show === false) return;
                    return (
                        <>
                            <li
                                className={joinClassNames(styles.colsMenuitem, item.className ?? '', item.disabled ? styles.colsMenuitemDisabled : '')}
                                style={item.style ?? ''}
                                onClick={(e) => this.handleClick(e, item, index)}
                                onMouseEnter={(e) => {
                                    this.mouseEnter(e, index);
                                }}
                                onMouseLeave={(e) => {
                                    this.mouseLeave(e, index);
                                }}
                            >
                                {item.label}
                                {item.children ? (
                                    <Menu
                                        ref={(ele: Menu) => (this._refs[index] = ele)}
                                        menu={item.children}
                                        onClick={item.onClick}
                                        className={item.className}
                                        style={item.style}
                                        parent={this}
                                        deep={deep + 1}
                                    ></Menu>
                                ) : (
                                    <></>
                                )}
                            </li>
                            {item.border ? <div className={styles.colsMenuitemLine}></div> : ''}
                        </>
                    );
                })}
            </ul>
        );
    }
}

export class UniverMenu implements MenuComponent {
    render(): JSXComponent<BaseMenuProps> {
        return Menu;
    }
}
