import { useState } from 'react';

import { BaseCollapseProps, BasePanelProps } from '../../Interfaces';
import { joinClassNames } from '../../Utils';
import { Icon } from '../index';
import Style from './index.module.less';

// interface PanelProps {
//     children: ComponentChildren;
//     header?: ComponentChildren;
// }

// interface CollapseProps {
//     children: ComponentChildren;
// }

export function Panel(props: BasePanelProps) {
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
                <span className={`${Style.panelHeaderIcon} ${panelBodyClassName!.includes('active') ? Style.panelHeaderIconRotate : ''}`}>
                    <Icon.Format.NextIcon />
                </span>
            </div>
            <div className={panelBodyClassName}>{children}</div>
        </div>
    );
}

export function Collapse(props: BaseCollapseProps) {
    const { children } = props;

    return <div className={Style.collapseWrapper}>{children}</div>;
}
