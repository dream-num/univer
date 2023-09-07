import { CustomLabel, Icon, joinClassNames } from '@univerjs/base-ui';
import { Component } from 'preact';

import styles from './index.module.less';

export interface ISheetBarMenuItem {
    label?: string;
    hide?: boolean;
    selected?: boolean;
    index?: string;
    sheetId?: string;
    onClick?: (e?: MouseEvent) => void;
}

export interface ISheetBarMenuProps {
    menu: ISheetBarMenuItem[];
    style?: JSX.CSSProperties;
    onClick?: (e?: MouseEvent) => void;
}

interface IState {
    show: boolean;
    menu: ISheetBarMenuItem[];
}

export class SheetBarMenu extends Component<ISheetBarMenuProps, IState> {
    constructor(props: ISheetBarMenuProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        const { menu } = this.props;
        this.state = {
            show: false,
            menu,
        };
    }

    handleClick(e: MouseEvent, item: ISheetBarMenuItem) {
        e.stopPropagation();
        const { onClick } = this.props;
        if (item.onClick) {
            item.onClick(e);
        }
        onClick?.(e);
        this.showMenu(false);
        window.removeEventListener('click', this.hideMenu, true);
        this.selectItem(item.sheetId as string);
    }

    hideMenu = () => {
        this.showMenu(false);
    };

    showMenu(show: boolean) {
        this.setState({ show }, () => {
            if (this.state.show) window.addEventListener('click', this.hideMenu, true);
        });
    }

    selectItem(sheetId: string) {
        this.setState((prevState, props) => {
            const menu = prevState.menu;
            const currenMenu = menu.map((sheet) => {
                if (sheet.sheetId === sheetId) {
                    sheet.selected = true;
                    sheet.hide = false;
                } else {
                    sheet.selected = false;
                }

                return sheet;
            });
            return {
                ...prevState,
                menu: currenMenu,
            };
        });
    }

    hideItem(sheetId: string) {
        this.setState((prevState, props) => {
            const menu = prevState.menu;
            const currenMenu = menu.map((sheet) => {
                if (sheet.sheetId === sheetId) {
                    sheet.hide = true;
                    sheet.selected = false;
                }

                return sheet;
            });
            return {
                ...prevState,
                menu: currenMenu,
            };
        });
    }

    deleteItem(sheetId: string) {
        this.setState((prevState, props) => {
            const menu = prevState.menu;
            const currenMenu = menu.filter((item) => item.sheetId !== sheetId);
            return {
                ...prevState,
                menu: currenMenu,
            };
        });
    }

    render() {
        const { style } = this.props;
        const { show, menu } = this.state;

        return (
            <ul className={styles.sheetBarMenu} style={{ ...style, display: show ? 'block' : ' none' }}>
                {menu.map((item) => (
                    <li onClick={(e) => this.handleClick(e, item)} className={joinClassNames(styles.sheetBarMenuItem)}>
                        <span className={styles.sheetBarMenuIcon}>
                            <EffIcon item={item}></EffIcon>
                        </span>
                        <span className={styles.sheetBarMenuTitle}>
                            <CustomLabel label={item.label ?? ''} />
                        </span>
                    </li>
                ))}
            </ul>
        );
    }
}

function EffIcon(props: { item: ISheetBarMenuItem }) {
    if (props.item.hide) {
        return <Icon.HideIcon />;
    }
    if (props.item.selected) {
        return <Icon.Format.CorrectIcon className={styles.sheetBarMenuSvg} />;
    }
    return <></>;
}
