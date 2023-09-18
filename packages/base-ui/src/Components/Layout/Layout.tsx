import { useEffect, useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils';
import styles from './index.module.less';

function getFirstChild(obj: HTMLElement) {
    const objChild = [];
    const objs = obj.getElementsByTagName('*');

    for (let i = 0, j = objs.length; i < j; ++i) {
        if (objs[i].nodeType !== Node.ELEMENT_NODE) {
            continue;
        }
        const node = objs[i].parentNode;
        if (node && node.nodeType === 1) {
            if (node === obj) {
                objChild[objChild.length] = objs[i];
            }
        } else if (node && node.parentNode === obj) {
            objChild[objChild.length] = objs[i];
        }
    }

    return objChild;
}

export interface BaseLayoutProps extends BaseComponentProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;
}

/**
 * Layout Component
 */
export function Layout({ children, style, className }: BaseLayoutProps) {
    const [isAside, setIsAside] = useState(false);
    const ref = useRef<HTMLTableSectionElement>(null);

    // If the first child element contains the `aside` component, the layout needs to be changed to horizontal arrangement
    useEffect(() => {
        if (ref.current) {
            const children = getFirstChild(ref.current);
            const childrens = children instanceof Array ? children : [children];

            for (const ele of childrens) {
                if (ele.tagName === 'ASIDE') {
                    setIsAside(true);
                    break;
                }
            }
        }
    }, []);

    const classes = joinClassNames(
        styles.layoutWrapper,
        {
            [styles.layoutWrapperHasSider]: isAside,
        },
        className
    );

    return (
        <section style={style} ref={ref} className={classes}>
            {children}
        </section>
    );
}

/**
 * Header Component
 */
const Header = (props: BaseLayoutProps) => {
    const { children, className, style } = props;

    return (
        <header style={style} className={`${styles.headerWrapper} ${className}`}>
            {children}
        </header>
    );
};

/**
 * Footer Component
 */
const Footer = (props: BaseLayoutProps) => {
    const { children, className, style } = props;

    const classes = joinClassNames(styles.footerWrapper, className);

    return (
        <footer className={classes} style={style}>
            {children}
        </footer>
    );
};

/**
 * Content Component
 */
const Content = (props: BaseLayoutProps) => {
    const { children, className, style } = props;

    const classes = joinClassNames(styles.contentWrapper, className);

    return (
        <main className={classes} style={style}>
            {children}
        </main>
    );
};

/**
 * Sider Component
 */
const Sider = (props: BaseLayoutProps) => {
    const { children, className, style } = props;

    const classes = joinClassNames(styles.siderWrapper, className);

    return (
        <aside className={classes} style={style}>
            {children}
        </aside>
    );
};

export { Content, Footer, Header, Sider };
