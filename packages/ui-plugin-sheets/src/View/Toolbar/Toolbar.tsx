import { AppContext, BaseComponentProps, Container, IDisplayMenuItem, IMenuItem } from '@univerjs/base-ui';
import { Component, createRef } from 'react';

import { IToolbarItemProps, SheetContainerUIController } from '../../Controller';
import styles from './index.module.less';
import { ToolbarItem } from './ToolbarItem';

interface IProps extends BaseComponentProps {
    style?: React.CSSProperties;
    toolList: IToolbarItemProps[];
}

interface IState {
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
}

export class Toolbar extends Component<IProps, IState> {
    static override contextType = AppContext;

    toolbarRef = createRef<HTMLDivElement>();

    moreBtnRef = createRef();

    moreToolRef = createRef();

    SelectRef = createRef();

    clientWidth = 0;

    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            menuItems: [],
        };
    }

    setToolbarNeo = (menuItems: Array<IDisplayMenuItem<IMenuItem>>) => {
        this.setState({
            menuItems,
        });
    };

    resetUl = () => {
        const wrapper = this.context.injector.get(SheetContainerUIController).getContentRef().current!;
        const height = `${(wrapper as HTMLDivElement).offsetHeight}px`;
        const ul = this.toolbarRef.current?.querySelectorAll('ul');
        if (!ul) return;
        for (let i = 0; i < ul.length; i++) {
            ul[i].style.maxHeight = height;
        }
    };

    override componentDidMount() {
        this.props.getComponent?.(this); // pass the UI to the controller, which is not good...
    }

    override componentWillUnmount() {}

    neoRenderToolbarList() {
        return this.state.menuItems.map((item) => <ToolbarItem key={item.id} {...item} />);
    }

    override render() {
        return (
            <Container style={{ position: 'relative' }}>
                <div className={`${styles.toolbarWarp} ${styles.toolbar}`} ref={this.toolbarRef}>
                    {this.neoRenderToolbarList()}
                </div>
            </Container>
        );
    }
}
