import React, { useState } from 'react';

import { joinClassNames } from '../../Utils';
// import { NextIcon } from '../Icon/Format';
import Style from './index.module.less';

export interface BaseCollapseProps {
    children: React.ReactNode;

    /**
     * Set the header of collapse
     */
    header: string;
}

/**
 * Collapse Component
 */
export function Collapse(props: BaseCollapseProps) {
    const { header, children } = props;
    const [panelBodyClassName, setPanelBodyClassName] = useState(joinClassNames(Style.panelBody));

    const handelClick = () => {
        const className: string | undefined = panelBodyClassName;
        if ((className as string).includes('active')) {
            setPanelBodyClassName(joinClassNames(Style.panelBody));
        } else {
            setPanelBodyClassName(joinClassNames(Style.panelBody, Style.active));
        }
    };

    return (
        <div className={Style.panelWrapper}>
            <div className={Style.panelHeader} onClick={handelClick}>
                {header}
                <span
                    className={`${Style.panelHeaderIcon} ${
                        panelBodyClassName!.includes('active') ? Style.panelHeaderIconRotate : ''
                    }`}
                >
                    {/* <NextIcon /> */}
                </span>
            </div>
            <div className={panelBodyClassName}>{children}</div>
        </div>
    );
}
