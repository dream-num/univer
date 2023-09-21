import { Component, createRef } from 'react';

import { BaseComponentProps } from '../../../BaseComponent';
import { AppContext } from '../../../Common/AppContext';
import { Container } from '../../../Components/Container/Container';
import { IDisplayMenuItem, IMenuItem, MenuPosition } from '../../../services/menu/menu';
import { IMenuService } from '../../../services/menu/menu.service';
import styles from './index.module.less';
import { ToolbarItem } from './toolbar-item';

interface IToolbarState {
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

interface IToolbarProps extends BaseComponentProps {
    style?: React.CSSProperties;
}

export class Toolbar extends Component<IToolbarProps, IToolbarState> {
    static override contextType = AppContext;

    declare context: React.ContextType<typeof AppContext>;

    toolbarRef = createRef<HTMLDivElement>();

    moreBtnRef = createRef();

    moreToolRef = createRef();

    SelectRef = createRef();

    clientWidth = 0;

    constructor(props: IToolbarProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            menuItems: [],
        };
    }

    override componentDidMount() {
        this.props.getComponent?.(this); // pass the UI to the controller, which is not good...

        const menuService = this.context.injector!.get(IMenuService);
        const update = () => {
            this.setState({
                menuItems: menuService.getMenuItems(MenuPosition.TOOLBAR),
            });
        };

        // TODO: dispose
        menuService.menuChanged$.subscribe(() => update());
        update();
    }

    override render() {
        const { menuItems } = this.state;
        return (
            <Container style={{ position: 'relative' }}>
                <div className={`${styles.toolbarWarp} ${styles.toolbar}`} ref={this.toolbarRef}>
                    {menuItems.map((item) => (
                        <ToolbarItem key={item.id} {...item} />
                    ))}
                </div>
            </Container>
        );
    }
}
