import { useContext, useEffect, useState } from 'react';

import { AppContext } from '../../../Common/AppContext';
import { IDisplayMenuItem, IMenuItem, MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';

export function DocBars() {
    const context = useContext(AppContext);

    const [menuItems, setMenuItems] = useState<Array<IDisplayMenuItem<IMenuItem>>>([]);

    useEffect(() => {
        // this.props.getComponent?.(this); // pass the UI to the controller, which is not good...

        const menuService = context.injector!.get(IMenuService);
        const update = () => {
            setMenuItems(menuService.getMenuItems(MenuPosition.TOOLBAR));
        };

        // TODO: dispose
        menuService.menuChanged$.subscribe(() => update());
        update();
    }, []);

    return (
        <section className={styles.docBars}>
            <div className={styles.menubar}>{/* TODO: Start */}</div>
            <div className={`${styles.toolbarWarp} ${styles.toolbar}`}>
                {menuItems.map((item) => (
                    <ToolbarItem key={item.id} {...item} />
                ))}
            </div>
        </section>
    );
}
