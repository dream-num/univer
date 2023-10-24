import { useDependency } from '@wendellhu/redi/react-bindings';
import { useEffect, useState } from 'react';

import { IDisplayMenuItem, IMenuItem, MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';

export function DocBars() {
    const menuService = useDependency(IMenuService);

    const [menuItems, setMenuItems] = useState<Array<IDisplayMenuItem<IMenuItem>>>([]);

    useEffect(() => {
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
            <div className={styles.toolbar}>
                <div className={styles.toolbarContainer}>
                    {menuItems.map((item) => (
                        <ToolbarItem key={item.id} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
}
