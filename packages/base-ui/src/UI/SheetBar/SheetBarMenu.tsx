import { BaseComponentRender, BaseComponentSheet } from '../../BaseComponent';
import { Component } from '../../Framework';
import { joinClassNames } from '../../Utils';
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
    private _render: BaseComponentRender;

    initialize() {
        const component = this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this._render = component.getComponentRender();

        this.state = {
            show: false,
        };
    }

    handleClick(e: MouseEvent, item: SheetBarMenuItem) {
        const { onClick } = this.props;
        if (item.onClick) {
            item.onClick(e);
        }
        onClick?.(e);
        this.showMenu(false);
        window.removeEventListener('click', this.hideMenu);
    }

    hideMenu = () => {
        this.showMenu(false);
    };

    showMenu(show: boolean) {
        this.setState(
            {
                show,
            },
            () => {
                if (show) {
                    window.addEventListener('click', this.hideMenu, true);
                }
            }
        );
    }

    render() {
        const { menu, style } = this.props;
        const { show } = this.state;
        const CheckIcon = this._render.renderFunction('CheckIcon');
        const HideIcon = this._render.renderFunction('HideIcon');

        return (
            <ul className={styles.sheetBarMenu} style={{ ...style, display: show ? 'block' : ' none' }}>
                {menu.map((item) => (
                    <li onClick={(e) => this.handleClick(e, item)} className={joinClassNames(styles.sheetBarMenuItem, item.hide ? styles.sheetBarMenuItemHide : '')}>
                        <span className={styles.sheetBarMenuIcon}>
                            {item.hide ? <HideIcon /> : ''}
                            {item.selected ? <CheckIcon /> : ''}
                        </span>
                        {item.label}
                    </li>
                ))}
            </ul>
        );
    }
}
