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
}

export class SheetBarMenu extends Component<ISheetBarMenuProps, IState> {
    constructor(props: ISheetBarMenuProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            show: false,
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
    }

    hideMenu = () => {
        this.showMenu(false);
    };

    showMenu(show: boolean) {
        this.setState({ show }, () => {
            if (this.state.show) window.addEventListener('click', this.hideMenu, true);
        });
    }

    render() {
        const { menu, style } = this.props;
        const { show } = this.state;

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
        return <Icon.Data.CheckIcon className={styles.sheetBarMenuSvg} />;
    }
    return <></>;
}
