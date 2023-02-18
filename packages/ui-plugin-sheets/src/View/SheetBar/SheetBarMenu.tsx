import { Component, Icon, joinClassNames } from '@univerjs/base-ui';
import styles from './index.module.less';

interface SheetBarMenuItem {
    label?: string;
    hide?: boolean;
    selected?: boolean;
    index?: string;
    sheetId?: string;
    onClick?: (e?: MouseEvent) => void;
}

export interface SheetBarMenuProps {
    menu: SheetBarMenuItem[];
    style?: JSX.CSSProperties;
    onClick?: (e?: MouseEvent) => void;
}

interface IState {
    show: boolean;
}

export class SheetBarMenu extends Component<SheetBarMenuProps, IState> {
    initialize() {
        this.state = {
            show: false,
        };
    }

    handleClick(e: MouseEvent, item: SheetBarMenuItem) {
        e.stopPropagation();
        const { onClick } = this.props;
        if (item.onClick) {
            item.onClick(e);
        }
        onClick?.(e);
        this.showMenu(false);
        window.removeEventListener('click', this.hideMenu, true);
    }

    hideMenu = () => {
        this.showMenu(false);
    };

    showMenu(show: boolean) {
        this.setState({ show }, () => {
            if (true) window.addEventListener('click', this.hideMenu, true);
        });
    }

    render() {
        const { menu, style } = this.props;
        const { show } = this.state;

        return (
            <ul className={styles.sheetBarMenu} style={{ ...style, display: show ? 'block' : ' none' }}>
                {menu.map((item) => (
                    <li onClick={(e) => this.handleClick(e, item)} className={joinClassNames(styles.sheetBarMenuItem, item.hide ? styles.sheetBarMenuItemHide : '')}>
                        <span className={styles.sheetBarMenuIcon}>
                            {item.hide ? <Icon.HideIcon /> : ''}
                            {item.selected ? <Icon.Data.CheckIcon /> : ''}
                        </span>
                        {item.label}
                    </li>
                ))}
            </ul>
        );
    }
}
