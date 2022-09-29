import { BaseMenuProps, JSXComponent, MenuComponent, MenuItemComponent } from '@univer/base-component';
import styles from './index.module.less';

interface menuProps {
    children: any;
    onClick?: () => void;
}

export const MenuItem = (props: BaseMenuProps) => {
    const { children, onClick } = props;
    return (
        <div className={styles.menuItem} onClick={onClick}>
            {children}
        </div>
    );
};

export const Menu = (props: BaseMenuProps) => {
    const { children } = props;

    return <div className={styles.menu}>{children}</div>;
};

export class UniverMenuItem implements MenuItemComponent {
    render(): JSXComponent<BaseMenuProps> {
        return MenuItem;
    }
}

export class UniverMenu implements MenuComponent {
    render(): JSXComponent<BaseMenuProps> {
        return MenuItem;
    }
}
