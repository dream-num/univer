import { BaseDropdownProps, JSXComponent, createRef, Component, DropdownComponent } from '@univer/base-component';
import { Icon, Menu, Tooltip } from '../../index';
import styles from './index.module.less';

interface IState {
    menuStyle: JSX.CSSProperties;
}

export class Dropdown extends Component<BaseDropdownProps, IState> {
    MenuRef = createRef<Menu>();

    DropRef = createRef<HTMLDivElement>();

    IconRef = createRef<HTMLDivElement>();

    protected initialize() {
        this.state = {
            menuStyle: {},
        };
    }

    handleClick = (e: MouseEvent) => {
        this.props.onClick?.();
        const { icon } = this.props;
        if (!icon) {
            this.MenuRef.current?.showMenu(true);
        }
    };

    handleSubClick = () => {
        this.MenuRef.current?.showMenu(true);
    };

    hideMenu = (e: MouseEvent) => {
        if (!this.DropRef.current || !this.DropRef.current?.contains(e.target as Node)) {
            this.MenuRef.current?.showMenu(false);
        }
    };

    componentDidMount() {
        const { placement } = this.props;
        let style: Record<string, string | number> = { position: 'absolute' };
        if (!placement || placement === 'Bottom') {
            style.left = 0;
            style.top = '100%';
        } else if (placement === 'Top') {
            style.left = 0;
            style.top = '-100%';
        } else if (placement === 'Left') {
            style.left = '-100%';
            style.top = 0;
        } else {
            style.left = '100%';
            style.top = 0;
        }
        this.setState({
            menuStyle: style,
        });
        window.addEventListener('click', this.hideMenu);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.hideMenu);
    }

    render() {
        const { children, menu, showArrow, icon, tooltip } = this.props;
        const { menuStyle } = this.state;

        return (
            <div className={styles.dropdown} ref={this.DropRef}>
                <Tooltip title={tooltip} placement={'bottom'}>
                    <div className={styles.dropContent} onClick={this.handleClick}>
                        {children}
                        {showArrow ? <Icon.Format.NextIcon /> : ''}
                    </div>
                </Tooltip>
                {icon ? (
                    <div ref={this.IconRef} className={styles.dropIcon} onClick={this.handleSubClick}>
                        {icon}
                    </div>
                ) : (
                    ''
                )}
                <Menu onClick={menu.onClick} ref={this.MenuRef} menu={menu.menu} className={menu.className} style={{ ...menu.style, ...menuStyle }}></Menu>
            </div>
        );
    }
}

export class UniverDropdown implements DropdownComponent {
    render(): JSXComponent<BaseDropdownProps> {
        return Dropdown;
    }
}
