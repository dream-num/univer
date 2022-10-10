import { BaseMenuProps, JSXComponent, Component, MenuComponent, createRef, BaseMenuItem, joinClassNames } from '@univer/base-component';
import styles from './index.module.less';

type IState = {
    show: boolean;
};

export class Menu extends Component<BaseMenuProps, IState> {
    private _MenuRef = createRef<HTMLUListElement>();

    private _refs: Menu[] = [];

    protected initialize() {
        this.state = {
            show: true,
        };
    }

    handleClick = (e: MouseEvent, onClick?: () => void) => {
        if (onClick) {
            onClick();
        } else if (this.props.onClick) {
            this.props.onClick();
        }
        this.showMenu(false);
    };

    showMenu = (show: boolean) => {
        this.setState({
            show,
        });
    };

    showMenuClick = (e: MouseEvent) => {
        this.showMenu(false);
    };

    mouseEnter = (e: MouseEvent, index: number) => {
        const { list } = this.props;
        // if (list[index].children) {
        // }
    };

    mouseLeave = (e: MouseEvent, index: number) => {};

    componentDidMount() {
        window.addEventListener('click', this.showMenuClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.showMenuClick);
    }

    render() {
        const { className = '', style = '', list } = this.props;
        const { show } = this.state;

        return show ? (
            <ul className={joinClassNames(styles.colsMenu, className)} style={style} ref={this._MenuRef}>
                {list.map((item: BaseMenuItem, index: number) => {
                    if (item.hide) return;
                    return (
                        <li
                            className={joinClassNames(styles.colsMenuitem, item.className ?? '')}
                            style={item.style ?? ''}
                            onClick={(e) => this.handleClick(e, item.onClick)}
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
                                    list={item.children.list}
                                    onClick={item.children.onClick}
                                    className={item.children.className}
                                    style={item.children.style}
                                    parent={this}
                                ></Menu>
                            ) : (
                                <></>
                            )}
                        </li>
                    );
                })}
            </ul>
        ) : (
            ''
        );
    }
}

export class UniverMenu implements MenuComponent {
    render(): JSXComponent<BaseMenuProps> {
        return Menu;
    }
}
