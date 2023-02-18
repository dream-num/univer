import { Component, createRef, cloneElement, VNode } from '../../Framework';
import { JSXComponent } from '../../BaseComponent';
import { BaseUlProps, UlComponent } from '../../Interfaces';
import { debounce } from '../../Utils';
import * as Icon from '../Icon';
import styles from './index.module.less';

type UlState = {
    style?: JSX.CSSProperties;
    posStyle?: JSX.CSSProperties;
};

type styleProp = {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
};

export class Ul extends Component<BaseUlProps, UlState> {
    refs: Ul[] = [];

    ulRef = createRef<HTMLUListElement>();

    resizeUl: any;

    protected initialize(props: BaseUlProps) {
        this.state = {
            style: {
                display: 'none',
            },
            posStyle: {},
        };

        this.resizeUl = debounce(this.getStyle, 200);
    }

    filterChildren = (node: HTMLElement) => {
        let flag;
        Array.from(node.children).forEach((item) => {
            if (item.nodeName === 'UL') {
                flag = true;
            }
        });
        return flag;
    };

    mouseOver = (e: MouseEvent, index: number) => {
        this.refs.forEach((item) => {
            item.hideSelect();
        });
        const currentTarget = e.currentTarget as HTMLElement;
        if (!this.filterChildren(currentTarget)) return;
        this.refs[index].showSelect();
    };

    mouseLeave = (e: MouseEvent, index: number) => {
        // const currentTarget = e.currentTarget as HTMLElement;
        // if (!this.filterChildren(currentTarget)) return;

        const type = this.refs[index] ? this.refs[index].props.children![0].selectType : '';
        if (type === 'jsx') return;

        this.refs.forEach((item) => {
            item.hideSelect();
        });
    };

    handleClick = (e: MouseEvent, { item, index, ref }: Record<string, BaseUlProps | number>, onClick?: (...arg: any[]) => void) => {
        e.stopImmediatePropagation();
        // item.onClick ? use onClick, or use onClick from props
        onClick?.call(this, e, { item, index, ref });
    };

    handleKeyUp = (e: KeyboardEvent, { item, index, ref }: Record<string, BaseUlProps | number>, onKeyUp?: (...arg: any[]) => void) => {
        e.stopImmediatePropagation();
        onKeyUp?.call(this, e, { item, index, ref });
    };

    // 将自己传给子组件
    sendParent = () => this;

    hideSelect = () => {
        window.removeEventListener('resize', this.resizeUl);
        if (this.state.style?.display === 'none') return;
        this.refs.forEach((item) => {
            item.hideSelect();
        });
        this.setState((prevState) => ({ style: { display: 'none' } }));
    };

    showSelect = () => {
        window.addEventListener('resize', this.resizeUl);
        this.setState(
            (prevState) => ({ style: { display: 'inline-block' } }),
            () => {
                this.getStyle();
            }
        );
    };
    // componentDidMount() {
    //     window.addEventListener('resize', this.resizeUl);
    // }

    // componentWillUnmount() {
    //     window.removeEventListener('resize', this.resizeUl);
    // }
    componentWillMount() {
        const { show = false } = this.props;
        if (show) {
            this.setState((prevState) => ({
                style: {
                    display: 'inline-block',
                },
            }));
        }
    }

    // ul 边界处理
    getStyle = () => {
        const parent = this.ulRef.current?.parentElement;
        const current = this.ulRef.current;

        let style: styleProp = {};
        let docPosition: any;
        if (!current || !parent) return;
        // 获取各个节点距离屏幕的距离
        const curPosition = current.getBoundingClientRect();
        let parPosition = parent?.getBoundingClientRect();

        // TODO 业务组件
        const spreadsheet: any = this.getContext().getPluginManager().getPluginByName('spreadsheet');
        const contentRef = spreadsheet.getSheetContainerControl().getContentRef();
        const wrapper = contentRef.current!;
        // const wrapper = $$('.univer-content-inner-right-container');
        docPosition = wrapper.getBoundingClientRect();
        if (!docPosition || !parPosition) return;
        // 处理li中包含的ul右边界
        if (parent?.nodeName === 'LI') {
            current.style.position = 'fixed';

            // 获取固定定位后 父元素正确的位置信息
            parPosition = parent?.getBoundingClientRect();
            if (parPosition.right + curPosition.width > docPosition!.right) {
                style.left = `${parPosition.left - curPosition.width}px`;
                style.top = `${parPosition.top}px`;
            } else {
                style.left = `${parPosition.right}px`;
                style.top = `${parPosition.top}px`;
            }
        } else if (parent?.nodeName === 'DIV') {
            if (parPosition.right + curPosition.width > docPosition!.right || parPosition.right + curPosition.width > document.documentElement.clientWidth) {
                // 边界碰到univer-main-content右边界或者小于视口
                style.right = '0';
                style.left = 'auto';
            } else {
                style.left = '0';
                style.right = 'auto';
            }
            if (curPosition.top >= docPosition.bottom) {
                style.top = 'auto';
                style.bottom = '100%';
            }
        }
        this.setState((prevState) => ({
            posStyle: style,
        }));
    };

    showIcon = (item: any) => {
        if ('selected' in item || 'hidden' in item) {
            if (item.selected) {
                return (
                    <span className={styles.ulIcon}>
                        <Icon.Format.CorrectIcon style={{ fontSize: '13px' }} />
                    </span>
                );
            }
            if (item.hidden) {
                return (
                    <span className={styles.ulIcon}>
                        <Icon.Format.HideIcon style={{ fontSize: '13px' }} />
                    </span>
                );
            }
            return <span className={styles.ulIcon}></span>;
        }
        return '';
    };

    /**
     * 如果是包含Icon的字符串,转为Icon图标
     */
    getIcon = (item: JSX.Element | string | null | undefined) => {
        let icon = item;
        if (typeof icon === 'string' && /Icon$/.test(icon)) {
            icon = Icon.IconMap[icon];
        }
        return <span className={styles.submenuArrow}>{icon}</span>;
    };

    // 获取父组件
    getParent = () => this.props.getParent() ?? null;

    render(props: BaseUlProps, state: UlState) {
        const { children, onClick, style, onKeyUp } = props;
        const { posStyle } = state;
        const ulStyle = Object.assign(this.state.style ?? {}, posStyle, style || {});

        if (!children?.length) return <></>;

        // If there is a case where selected is set to true, other items need to be set to false, so that the icon can be constructed in the showIcon method to keep the style uniform.
        // If the selected true is not set, the showIcon method will keep an empty string
        children.some((item, i) => {
            if (item.selected) {
                children.forEach((ele, j) => {
                    if (i !== j) {
                        ele.selected = false;
                    }
                });
                return true;
            }
            return false;
        });

        return (
            <ul className={children[0].selectType === 'jsx' ? styles.colsMenuJsx : styles.colsMenu} style={{ ...ulStyle }} ref={this.ulRef}>
                {children?.map((item, index: number) => {
                    let liClass = item.className ? `${styles.colsMenuitem} ${item.className}` : styles.colsMenuitem;
                    if (item.hideLi) {
                        return;
                    }
                    return (
                        <li
                            className={liClass}
                            style={{ ...item.style }}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.handleClick(e, { item, index, ref: this }, item.onClick ? item.onClick : onClick);
                            }}
                            onMouseEnter={(e) => {
                                this.mouseOver(e, index);
                            }}
                            onMouseLeave={(e) => {
                                this.mouseLeave(e, index);
                            }}
                            onKeyUp={(e) => {
                                this.handleKeyUp(e, { item, index, ref: this }, item.onKeyUp ? item.onKeyUp : onKeyUp);
                            }}
                        >
                            <div className={item.selectType === 'jsx' ? '' : styles.colsMenuitemContent}>
                                {/* {'selected' in item ? <span className={styles.ulIcon}>{item.selected ? <Icon.Format.CorrectIcon style={{ fontSize: '13px' }} /> : ''}</span> : ''} */}
                                {this.showIcon(item)}
                                <div>
                                    {item.selectType === 'jsx' ? <span>{cloneElement(item.label as VNode, { onChange: this.getStyle })}</span> : <span>{item.label}</span>}
                                    {/* {item.icon ? <span className={styles.submenuArrow}>{item.icon}</span> : ''} */}
                                    {item.icon ? this.getIcon(item.icon) : ''}
                                </div>
                            </div>
                            {item.children?.length ? (
                                <Ul children={item.children} onClick={item.onClick} ref={(ele: Ul) => (this.refs[index] = ele)} getParent={this.sendParent}></Ul>
                            ) : (
                                <></>
                            )}

                            {item.border ? <div className={styles.line}></div> : ''}
                        </li>
                    );
                })}
            </ul>
        );
    }
}

export class UniverUl implements UlComponent {
    render(): JSXComponent<BaseUlProps> {
        return Ul;
    }
}
