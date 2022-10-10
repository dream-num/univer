import {
    BaseLayoutProps,
    Component,
    ContentComponent,
    createRef,
    FooterComponent,
    ForwardedRef,
    forwardRef,
    getFirstChildren,
    HeaderComponent,
    JSXComponent,
    LayoutComponent,
    SiderComponent,
} from '@univer/base-component';
import styles from './index.module.less';

// Types for props
// type BaseLayoutProps = {
//     children?: ComponentChildren;
//     className?: string;
//     style?: {};
// };

// Types for state
type IState = {
    isAside: boolean;
};

class Layout extends Component<BaseLayoutProps, IState> {
    ref = createRef<HTMLTableSectionElement>();

    state = {
        isAside: false,
    };

    // If the first child element contains the `aside` component, the layout needs to be changed to horizontal arrangement
    componentDidMount() {
        if (this.ref.current) {
            let children = getFirstChildren(this.ref.current);
            const childrens = children instanceof Array ? children : [children];

            for (const ele of childrens) {
                if (ele.tagName === 'ASIDE') {
                    this.setState({
                        isAside: true,
                    });
                }
            }
        }
    }

    render(props: BaseLayoutProps, state: IState) {
        const { children, style, className } = props;
        const { isAside } = state;
        return (
            <section
                style={style}
                ref={this.ref}
                className={isAside ? `${styles.layoutWrapper} ${styles.layoutWrapperHasSider} ${className}` : `${styles.layoutWrapper} ${className}`}
            >
                {children}
            </section>
        );
    }
}

const Header = (props: BaseLayoutProps) => {
    const { children, style, className } = props;

    return (
        <header style={style} className={`${styles.headerWrapper} ${className}`}>
            {children}
        </header>
    );
};
const Footer = (props: BaseLayoutProps) => {
    const { children, style, className } = props;

    return (
        <footer style={style} className={`${styles.footerWrapper} ${className}`}>
            {children}
        </footer>
    );
};

/**
 * use forwardRef, get hold of a specific reference further down the tree
 */
const Content = forwardRef((props: BaseLayoutProps, ref: ForwardedRef<HTMLElement>) => {
    const { children, style, className } = props;

    return (
        <main ref={ref} style={style} className={`${styles.contentWrapper} ${className}`}>
            {children}
        </main>
    );
});
const Sider = (props: BaseLayoutProps) => {
    const { children, style, className } = props;

    return (
        <aside style={style} className={`${styles.siderWrapper} ${className}`}>
            {children}
        </aside>
    );
};

export { Layout, Header, Footer, Content, Sider };

export class UniverLayout implements LayoutComponent {
    render(): JSXComponent<BaseLayoutProps> {
        return Layout;
    }
}
export class UniverHeader implements HeaderComponent {
    render(): JSXComponent<BaseLayoutProps> {
        return Header;
    }
}
export class UniverFooter implements FooterComponent {
    render(): JSXComponent<BaseLayoutProps> {
        return Footer;
    }
}
export class UniverContent implements ContentComponent {
    render(): JSXComponent<BaseLayoutProps> {
        return Content;
    }
}
export class UniverSider implements SiderComponent {
    render(): JSXComponent<BaseLayoutProps> {
        return Sider;
    }
}
