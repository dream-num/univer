import { Component, createRef } from 'react';
import { JSXComponent } from '../../BaseComponent';
import { BaseDragProps, DragComponent } from '../../Interfaces';
import styles from './index.module.less';

interface IState {}

class Drag extends Component<BaseDragProps, IState> {
    root = createRef();

    initDragDialog() {
        // Drag and drop function (mainly to trigger three events: onpointerdown\onpointermove\onpointerup)
        const drag = this.root.current;

        // move to center
        const { top, left } = this.getPosition();
        drag.style.top = `${top}px`;
        drag.style.left = `${left}px`;

        const divMask = drag.querySelector(`.${styles.dragMask}`);

        const dragBarTop = drag.querySelector(`.${styles.dragBarTop}`);
        const dragBarBottom = drag.querySelector(`.${styles.dragBarBottom}`);
        const dragBarLeft = drag.querySelector(`.${styles.dragBarLeft}`);
        const dragBarRight = drag.querySelector(`.${styles.dragBarRight}`);

        dragBarTop.addEventListener('pointerdown', pointerDownListener);
        dragBarBottom.addEventListener('pointerdown', pointerDownListener);
        dragBarLeft.addEventListener('pointerdown', pointerDownListener);
        dragBarRight.addEventListener('pointerdown', pointerDownListener);

        // When you click on an object, you can use the drag object. Move and up are the global area, that is, the entire document is common. The document object should be used instead of the drag object (otherwise, when the drag object is used, the object can only move to the right or down )

        function pointerDownListener(e: PointerEvent) {
            e = e || window.event; // Compatible with IE browser
            const diffX = e.clientX - drag.offsetLeft; // The distance from the moment the mouse clicks on the object relative to the left border of the object = the distance of the position when clicked relative to the leftmost left of the browser - the distance of the left border of the object relative to the leftmost left of the browser
            const diffY = e.clientY - drag.offsetTop;

            /* Low version IE bug: When an object is dragged out of the browser’s visual window, a scroll bar will appear,
            The solution is to use two unique methods setCapture()\releaseCapture() in IE browser, these two methods,
            You can let the mouse slide outside the browser to capture the event, and our bug is when the mouse moves out of the browser,
            The function that the limit is exceeded becomes invalid. In this way, this problem can be solved. Note: These two methods are used in onpointerdown and onpointerup */
            if (typeof drag.setCapture !== 'undefined') {
                drag.setCapture();
            }

            // Cover the pop-up window
            divMask.style.width = '100%';
            divMask.style.height = '100%';

            // Prevent the selected event from being triggered when the dragging speed is too fast
            document.body.style.userSelect = 'none';

            document.addEventListener('pointermove', pointerMoveListener);
            document.addEventListener('pointerup', pointerUpListener);

            function pointerMoveListener(e: PointerEvent) {
                e = e || window.event; // Compatible with IE browser
                let left = e.clientX - diffX;
                let top = e.clientY - diffY;

                // Control the range of dragged objects can only be in the browser window, and scroll bars are not allowed
                // if (left <0) {
                //     left = 0
                // } else if (left> window.innerWidth-drag.offsetWidth) {
                //     left = window.innerWidth-drag.offsetWidth
                // }
                // if (top <0) {
                //     top = 0
                // } else if (top> window.innerHeight-drag.offsetHeight) {
                //     top = window.innerHeight-drag.offsetHeight
                // }

                if (left < -drag.offsetWidth + 100) {
                    left = -drag.offsetWidth + 100;
                } else if (left > window.innerWidth - 100) {
                    left = window.innerWidth - 100;
                }
                if (top < -drag.offsetHeight + 100) {
                    top = -drag.offsetHeight + 100;
                } else if (top > window.innerHeight - 100) {
                    top = window.innerHeight - 100;
                }

                // Regain the distance of the object when moving, and solve the phenomenon of shaking when dragging
                drag.style.left = `${left}px`;
                drag.style.top = `${top}px`;
                drag.style.transform = '';
            }

            function pointerUpListener(e: PointerEvent) {
                document.removeEventListener('pointermove', pointerMoveListener);
                document.removeEventListener('pointerup', pointerUpListener);
                // Prevent the mouse from looping after it pops up (that is, prevent the mouse from moving when it is put on)

                // Fix low version ie bug
                if (typeof drag.releaseCapture !== 'undefined') {
                    drag.releaseCapture();
                }

                // Restore the hidden mask layer
                divMask.style.width = '0';
                divMask.style.height = '0';
                document.body.style.userSelect = '';
            }
        }
    }

    getPosition() {
        const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const rootW = this.root.current.offsetWidth;
        const rootH = this.root.current.offsetHeight;
        const top = (h - rootH) / 2;
        const left = (w - rootW) / 2;

        return {
            top,
            left,
        };
    }

    componentDidMount() {
        if (this.props.isDrag) {
            this.initDragDialog();
        }
    }

    render() {
        const { isDrag, className = '' } = this.props;
        return (
            <>
                {isDrag ? (
                    <div className={styles.dragContainer}>
                        <div ref={this.root} className={`${styles.dragDialog} ${className}`}>
                            {this.props.children}

                            <div className={styles.dragBarLeft}></div>
                            <div className={styles.dragBarRight}></div>
                            <div className={styles.dragBarTop}></div>
                            <div className={styles.dragBarBottom}></div>

                            <div className={styles.dragMask}></div>
                        </div>
                    </div>
                ) : (
                    this.props.children
                )}
            </>
        );
    }
}

export class UniverDrag implements DragComponent {
    render(): JSXComponent<BaseDragProps> {
        return Drag;
    }
}

export default Drag;
