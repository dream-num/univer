import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

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

export interface ILayoutProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;
}

/**
 * Layout Component
 */
export function Layout({ children, style, className }: ILayoutProps) {
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

    const _className = clsx(
        styles.layoutWrapper,
        {
            [styles.layoutWrapperHasSider]: isAside,
        },
        className
    );

    return (
        <section ref={ref} className={_className} style={style}>
            {children}
        </section>
    );
}

/**
 * Header Component
 */
export const Header = (props: ILayoutProps) => {
    const { children, className, style } = props;

    const _className = clsx(styles.headerWrapper, className);

    return (
        <header className={_className} style={style}>
            {children}
        </header>
    );
};

/**
 * Footer Component
 */
export function Footer(props: ILayoutProps) {
    const { children, className, style } = props;

    const _className = clsx(styles.footerWrapper, className);

    return (
        <footer className={_className} style={style}>
            {children}
        </footer>
    );
}

/**
 * Content Component
 */
export function Content(props: ILayoutProps) {
    const { children, className, style } = props;

    const _className = clsx(styles.contentWrapper, className);

    return (
        <main className={_className} style={style}>
            {children}
        </main>
    );
}

/**
 * Sider Component
 */
export function Sider(props: ILayoutProps) {
    const { children, className, style } = props;

    const _className = clsx(styles.siderWrapper, className);

    return (
        <aside className={_className} style={style}>
            {children}
        </aside>
    );
}
