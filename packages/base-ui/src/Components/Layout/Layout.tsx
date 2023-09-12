// Types for props
// type BaseLayoutProps = {
//     children?: ComponentChildren;
//     className?: string;
//     style?: {};
// };
// Types for state
import React, { forwardRef, Ref, useEffect, useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { getFirstChildren } from '../../Utils';
import styles from './index.module.less';

export interface BaseLayoutProps extends BaseComponentProps {
    children?: React.ReactNode;
    className?: string;
    style?: {};
}

export function Layout({ children, style, className = '' }: BaseLayoutProps) {
    const [isAside, setIsAside] = useState(false);
    const ref = useRef<HTMLTableSectionElement>(null);

    // If the first child element contains the `aside` component, the layout needs to be changed to horizontal arrangement
    useEffect(() => {
        if (ref.current) {
            const children = getFirstChildren(ref.current);
            const childrens = children instanceof Array ? children : [children];

            for (const ele of childrens) {
                if (ele.tagName === 'ASIDE') {
                    setIsAside(true);
                    break;
                }
            }
        }
    }, []);

    return (
        <section style={style} ref={ref} className={isAside ? `${styles.layoutWrapper} ${styles.layoutWrapperHasSider} ${className}` : `${styles.layoutWrapper} ${className}`}>
            {children}
        </section>
    );
}

const Header = (props: BaseLayoutProps) => {
    const { children, style, className = '' } = props;

    return (
        <header style={style} className={`${styles.headerWrapper} ${className}`}>
            {children}
        </header>
    );
};
const Footer = (props: BaseLayoutProps) => {
    const { children, style, className = '' } = props;

    return (
        <footer style={style} className={`${styles.footerWrapper} ${className}`}>
            {children}
        </footer>
    );
};

/**
 * use forwardRef, get hold of a specific reference further down the tree
 */
const Content = forwardRef((props: BaseLayoutProps, ref: Ref<HTMLElement>) => {
    const { children, style, className = '' } = props;

    return (
        <main ref={ref} style={style} className={`${styles.contentWrapper} ${className}`}>
            {children}
        </main>
    );
});
const Sider = (props: BaseLayoutProps) => {
    const { children, style, className = '' } = props;

    return (
        <aside style={style} className={`${styles.siderWrapper} ${className}`}>
            {children}
        </aside>
    );
};

export { Content, Footer, Header, Sider };
