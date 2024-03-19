/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ISlidePage } from '@univerjs/core';
import React, { Component, createRef } from 'react';

import styles from './index.module.less';

interface SlideBarState {
    slideList: ISlidePage[];
    activePageId?: string;
}

interface IProps {
    addSlide: () => void;
    activeSlide: (pageId: string) => void;
}

// TODO: @wzhudev: should show slide list and active slide
export class SlideBar extends Component<{}, SlideBarState> {
    slideBarRef = createRef<HTMLDivElement>();

    constructor(props: {}) {
        super(props);

        this.state = {
            slideList: [],
        };
    }

    override componentDidMount() {
        this._init();
    }

    isActive(pageId: string, index: number = 0) {
        if (this.state.activePageId == null && index === 0) {
            return styles.slideBarItemActive;
        }
        if (this.state.activePageId === pageId) {
            return styles.slideBarItemActive;
        }
        return '';
    }

    setSlide(slideList: ISlidePage[], cb?: () => void) {
        this.setState(
            {
                slideList,
            },
            cb
        );
    }

    activeSlide(pageId: string, index: number) {
        if (this.state.activePageId === pageId) {
            return;
        }

        this.setState({
            activePageId: pageId,
        });

        // this.props.activeSlide(pageId);
    }

    private _init(): void {
        // TODO: should subscribe to active slide change event
        // const univerInstanceService = this.context.injector.get(IUniverInstanceService);
        // const model = univerInstanceService.getCurrentUniverSlideInstance();
        // const pages = model.getPages();
        // const pageOrder = model.getPageOrder();
        // if (!pages || !pageOrder) {
        //     return;
        // }

        const p: ISlidePage[] = [];
        // pageOrder.forEach((pageKey) => {
        //     p.push(pages[pageKey]);
        // });

        this.setState({
            slideList: p,
        });
    }

    override render() {
        // const { addSlide } = this.props;
        const { slideList } = this.state;
        // TODO@wzhudev: manage slides in a SlideService

        return (
            <div className={styles.slideBar} ref={this.slideBarRef}>
                <div className={styles.slideBarContent}>
                    {slideList.map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.slideBarItem} ${this.isActive(item.id, index)}`}
                            onClick={() => this.activeSlide(item.id, index)}
                        >
                            <span>{index + 1}</span>
                            <div className={styles.slideBarBox} />
                        </div>
                    ))}
                </div>
                {/* <div className={styles.slideAddButton}>
                    <Button onClick={addSlide}>+</Button>
                </div> */}
            </div>
        );
    }
}
