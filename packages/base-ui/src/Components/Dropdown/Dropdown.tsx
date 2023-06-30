import { Icon } from '..';
import { JSXComponent } from '../../BaseComponent';
import { PureComponent, createRef } from '../../Framework';
import { BaseDropdownProps, DropdownComponent } from '../../Interfaces';
import { Menu } from '../Menu';
import { Tooltip } from '../Tooltip';
import styles from './index.module.less';

interface IState {
    menuStyle: JSX.CSSProperties;
}

export class Dropdown extends PureComponent<BaseDropdownProps, IState> {
    MenuRef = createRef<Menu>();

    DropRef = createRef<HTMLDivElement>();

    IconRef = createRef<HTMLDivElement>();

    handleClick = (e: MouseEvent) => {
        this.props.onClick?.();
        this.props.onMainClick?.();
        const { icon } = this.props;
        if (!icon) {
            this.MenuRef.current?.showMenu(true);
        }
    };

    handleSubClick = () => {
        this.MenuRef.current?.showMenu(true);
    };

    hideMenu = () => {
        this.MenuRef.current?.showMenu(false);
    };

    hideMenuClick = (e: MouseEvent) => {
        if (!this.DropRef.current || !this.DropRef.current?.contains(e.target as Node)) {
            this.hideMenu();
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
        window.addEventListener('click', this.hideMenuClick, true);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.hideMenuClick, true);
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

    protected initialize() {
        this.state = {
            menuStyle: {},
        };
    }
}

export class UniverDropdown implements DropdownComponent {
    render(): JSXComponent<BaseDropdownProps> {
        return Dropdown;
    }
}
