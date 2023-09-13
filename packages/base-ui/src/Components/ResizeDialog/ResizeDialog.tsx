import { useEffect, useRef } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import styles from './index.module.less';

export interface BaseResizeDialogProps extends BaseComponentProps {
    left: number;
    top: number;
    width: number;
    height: number;
    children: React.ReactNode;
    ratio: number;
}

export const ResizeDialog = (props: BaseResizeDialogProps) => {
    let { left = 0, top = 0 } = props;
    const { width = 100, height = 50, children, ratio = 1 } = props;
    const ref = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        dialog.style.width = `${width * ratio}px`;
        dialog.style.height = `${height * ratio}px`;
        dialog.style.left = `${left * ratio}px`;
        dialog.style.top = `${top * ratio}px`;

        // window.addEventListener('mousemove', mouseMove);
        // window.addEventListener('mouseup', mouseUp);
        // window.addEventListener('click', handleClick);

        // return () => {
        // TODO：应该在元素隐藏后即remove监听
        // window.removeEventListener('mousemove', mouseMove);
        // window.removeEventListener('mouseup', mouseUp);
        // window.removeEventListener('click', handleClick);
        // };
    }, []);
    let pastMove = [0, 0];
    let currentMove = [0, 0];
    let move = false;
    let resize = false;
    let resizeItem: any = null;

    const cancelHighlight = () => {
        if (!ref.current) return;
        const parent = ref.current.parentElement;
        if (!parent) return;
        const dom = parent.querySelectorAll(`.${styles.dialogResize}`);
        dom.forEach((item) => {
            item.classList.remove(styles.dialogResizeActive);
        });
    };
    const highLight = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current || !resizeRef.current) return;
        const classList = resizeRef.current.classList;
        if (!ref.current.contains(e.target as HTMLElement)) {
            if (classList.contains(styles.dialogResizeActive)) {
                classList.remove(styles.dialogResizeActive);
            }
        } else {
            classList.add(styles.dialogResizeActive);
        }
    };
    const handleClick = (e: MouseEvent) => {
        e.stopPropagation();
        cancelHighlight();
        highLight(e);
    };
    const mouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
        window.addEventListener('click', handleClick);
        e.stopPropagation();
        cancelHighlight();
        highLight(e);
        pastMove = [e.pageX, e.pageY];
        move = true;
    };
    const resizeMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (!target.className.includes(`${styles.resizeItem}`)) return;
        resizeItem = target;
        pastMove = [e.pageX, e.pageY];
        resize = true;
    };
    const mouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        if (!ref.current) return;
        const parent = ref.current.parentElement;
        if (!parent) return;
        if (!parent.contains(e.target as HTMLElement)) return;

        if (!move && !resize) return;
        const dialog = ref.current;
        if (!dialog) return;
        currentMove = [e.pageX, e.pageY];

        left = parseFloat(dialog.style.left) + currentMove[0] - pastMove[0];
        left = left < 0 ? 0 : left;
        if (left + ref.current.offsetWidth > parent.offsetWidth) {
            left = parent.offsetWidth - ref.current.offsetWidth;
        }
        top = parseFloat(dialog.style.top) + currentMove[1] - pastMove[1];
        top = top < 0 ? 0 : top;

        if (top + ref.current.offsetHeight > parent.offsetHeight) {
            top = parent.offsetHeight - ref.current.offsetHeight;
        }

        if (resize) {
            let width;
            let height;
            const type = resizeItem.dataset.type;
            if (type === 'rm' || type === 'rb' || type === 'rt') {
                width = parseFloat(dialog.style.width) + currentMove[0] - pastMove[0];
                if (width < 10) width = 10;
                if (left + width > parent.offsetWidth) {
                    width = parent.offsetWidth - left;
                }
                dialog.style.width = `${width}px`;
            }
            if (type === 'lm' || type === 'lb' || type === 'lt') {
                width = parseFloat(dialog.style.width) - (currentMove[0] - pastMove[0]);
                if (width < 10) width = 10;
                if (left + width > parent.offsetWidth) {
                    width = parent.offsetWidth - left;
                }
                dialog.style.width = `${width}px`;
                dialog.style.left = `${left}px`;
            }
            if (type === 'lb' || type === 'mb' || type === 'rb') {
                height = parseFloat(dialog.style.height) + currentMove[1] - pastMove[1];
                if (height < 10) height = 10;
                if (height + top > parent.offsetHeight) {
                    height = parent.offsetHeight - top;
                }
                dialog.style.height = `${height}px`;
            }
            if (type === 'lt' || type === 'mt' || type === 'rt') {
                height = parseFloat(dialog.style.height) - (currentMove[1] - pastMove[1]);
                if (height < 10) height = 10;
                if (height + top > parent.offsetHeight) {
                    height = parent.offsetHeight - top;
                }
                dialog.style.height = `${height}px`;
                dialog.style.top = `${top}px`;
            }
        }
        if (move) {
            dialog.style.left = `${left}px`;
            dialog.style.top = `${top}px`;
        }

        pastMove = currentMove;
    };
    const mouseUp = (e: MouseEvent) => {
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', mouseUp);
        window.removeEventListener('click', handleClick);
        e.stopPropagation();
        if (!move && !resize) return;
        const dialog = ref.current;
        if (!dialog) return;
        move = false;
        resize = false;
    };

    return (
        <div className={styles.resizeDialog} ref={ref}>
            <div className={styles.dialogMove} onMouseDown={mouseDown}>
                <div className={`${styles.moveItem} ${styles.moveTop}`}></div>
                <div className={`${styles.moveItem} ${styles.moveRight}`}></div>
                <div className={`${styles.moveItem} ${styles.moveBottom}`}></div>
                <div className={`${styles.moveItem} ${styles.moveLeft}`}></div>
            </div>
            <div className={styles.dialogResize} onMouseDown={resizeMouseDown} ref={resizeRef}>
                <div data-type="lt" className={`${styles.resizeItem} ${styles.resizeLt}`}></div>
                <div data-type="mt" className={`${styles.resizeItem} ${styles.resizeMt}`}></div>
                <div data-type="lm" className={`${styles.resizeItem} ${styles.resizeLm}`}></div>
                <div data-type="rm" className={`${styles.resizeItem} ${styles.resizeRm}`}></div>
                <div data-type="rt" className={`${styles.resizeItem} ${styles.resizeRt}`}></div>
                <div data-type="lb" className={`${styles.resizeItem} ${styles.resizeLb}`}></div>
                <div data-type="mb" className={`${styles.resizeItem} ${styles.resizeMb}`}></div>
                <div data-type="rb" className={`${styles.resizeItem} ${styles.resizeRb}`}></div>
            </div>
            <div className={styles.dialogContent}>{children}</div>
        </div>
    );
};
