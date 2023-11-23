import { BaseComponentProps } from '@univerjs/base-ui';
import React, { Component, createRef } from 'react';

import { IDocUIPluginConfig } from '../../basics';
import style from './index.module.less';

export interface BaseDocContainerProps extends BaseComponentProps {
    config: IDocUIPluginConfig;
    changeLocale: (locale: string) => void;
    methods?: any;
}

/**
 * One univerdoc instance DOM container
 */
export class DocContainer extends Component<BaseDocContainerProps> {
    leftContentLeft: number = 0;

    leftContentTop: number = 0;

    rightBorderX: number = 0;

    rightBorderY: number = 0;

    splitLeftRef = createRef<HTMLDivElement>();

    contentRef = createRef<HTMLDivElement>();

    constructor(props: BaseDocContainerProps) {
        super(props);
        this.changeSkin(props.config.container as string, 'default');
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    /**
     * split mouse down
     * @param e
     */
    handleSplitBarMouseDown = (e: React.MouseEvent) => {
        e = e || window.event; // Compatible with IE browser
        // Store the current mouse position
        this.leftContentLeft = this.splitLeftRef.current?.getBoundingClientRect().left!;
        this.leftContentTop = this.splitLeftRef.current?.getBoundingClientRect().top!;
        const mainContainer = this.splitLeftRef.current?.parentElement;
        this.rightBorderX = mainContainer?.getBoundingClientRect()?.width!;
        this.rightBorderY = mainContainer?.getBoundingClientRect()?.height!;
        document.addEventListener('mousemove', this.handleSplitBarMouseMove, false);
        document.addEventListener('mouseup', this.handleSplitBarMouseUp, false);
    };

    /**
     * split mouse move
     * @param e
     */
    handleSplitBarMouseMove = (e: MouseEvent) => {
        const layout = this.props.config.layout?.docContainerConfig!;
        e = e || window.event; // Compatible with IE browser
        let diffLeft = e.clientX - this.leftContentLeft;
        let diffTop = e.clientY - this.leftContentTop;
        // Prevent crossing borders
        diffLeft = diffLeft >= this.rightBorderX ? this.rightBorderX : diffLeft;
        diffTop = diffTop >= this.rightBorderY ? this.rightBorderY : diffTop;
        // set new width
        if (layout.contentSplit === 'vertical') {
            this.splitLeftRef.current!.style.height = `${diffTop}px`;
        } else {
            this.splitLeftRef.current!.style.width = `${diffLeft}px`;
        }
    };

    /**
     * split mouse up
     * @param e
     */
    handleSplitBarMouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', this.handleSplitBarMouseMove, false);
        document.removeEventListener('mouseup', this.handleSplitBarMouseUp, false);
    };

    getContentRef() {
        return this.contentRef;
    }

    getSplitLeftRef() {
        return this.splitLeftRef;
    }

    /**
     * Modify Dom Skin
     */
    changeSkin(container: HTMLElement | string, skin: string) {
        // Collect all  skins
        const root = document.documentElement;

        const id = typeof container === 'string' ? container : container.id;

        /**
         * get skin style doc
         * @param id
         * @returns
         */

        function getSkinStyleDoc(id: string) {
            const title = 'universheet-skin-style';
            // avoid duplicates
            for (let i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].title === title) {
                    deleteStyleRuleIndexBySelector(document.styleSheets[i], id);

                    return document.styleSheets[i];
                }
            }
            const head = document.head || document.getElementsByTagName('head')[0];
            const styleEle = document.createElement('style');
            styleEle.title = title;
            head.appendChild(styleEle);

            return document.styleSheets[document.styleSheets.length - 1];
        }

        /**
         * delete style rule in univerdoc-skin-style
         * @param skinStyleDoc
         * @param id
         */
        function deleteStyleRuleIndexBySelector(skinStyleSheet: CSSStyleSheet, id: string) {
            let index = 0;
            for (let i = 0; i < skinStyleSheet.cssRules.length; i++) {
                const rule = skinStyleSheet.cssRules[i];

                if (rule instanceof CSSStyleRule && rule.selectorText === `#${id}`) {
                    index = i;
                    skinStyleSheet.deleteRule(index);
                    break;
                }
            }
        }
    }

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    override render() {
        const { methods } = this.props;
        const { layout } = this.props.config;
        const config = layout?.docContainerConfig!;
        // Set Provider for entire Container
        return (
            <section className={style.layoutContainer}>
                <div>
                    <aside style={{ display: config.outerLeft ? 'block' : 'none' }}></aside>
                    <div className={style.mainContent} style={{ position: 'relative' }}>
                        <div>
                            <aside
                                style={{
                                    display: config.innerLeft ? 'block' : 'none',
                                }}
                            >
                                {/* innerLeft */}
                            </aside>
                            <div
                                className={
                                    config.contentSplit === 'vertical'
                                        ? style.contentContainerVertical
                                        : style.contentContainerHorizontal
                                }
                            >
                                {!!config.contentSplit && (
                                    <div ref={this.splitLeftRef} className={style.contentInnerLeftContainer}>
                                        <div
                                            className={style.hoverCursor}
                                            onMouseDown={this.handleSplitBarMouseDown}
                                        ></div>
                                    </div>
                                )}
                                <div
                                    onContextMenu={(e) => e.preventDefault()}
                                    ref={this.contentRef}
                                    className={style.contentInnerRightContainer}
                                ></div>
                                {/* extend main content */}
                            </div>

                            <aside
                                style={{
                                    display: config.innerRight ? 'block' : 'none',
                                }}
                            >
                                {/* innerRight */}
                                {/* <SideGroup></SideGroup> */}
                            </aside>
                        </div>
                        <footer
                            style={{
                                display: config.footer ? 'block' : 'none',
                            }}
                        ></footer>
                    </div>
                    <aside
                        style={{
                            display: config.outerRight ? 'block' : 'none',
                        }}
                        className={style.outerRightContainer}
                    ></aside>
                </div>
            </section>
        );
    }
}
