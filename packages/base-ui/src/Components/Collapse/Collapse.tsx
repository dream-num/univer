import { BaseCollapseProps, BasePanelProps, CollapseComponent, joinClassNames as classnames, JSXComponent, PanelComponent } from '@univerjs/base-ui';
import { useState } from 'preact/hooks';
import { Icon } from '../index';
import Style from './index.module.less';

// interface PanelProps {
//     children: ComponentChildren;
//     header?: ComponentChildren;
// }

// interface CollapseProps {
//     children: ComponentChildren;
// }

const Panel = (props: BasePanelProps) => {
    const { header, children } = props;
    let [panelBodyClassName, setPanelBodyClassName] = useState(classnames(Style.panelBody));

    const handelClick = () => {
        let classname: string | undefined = panelBodyClassName;
        if ((classname as string).includes('active')) {
            setPanelBodyClassName(classnames(Style.panelBody));
        } else {
            setPanelBodyClassName(classnames(Style.panelBody, Style.active));
        }
    };

    return (
        <div className={Style.panelWrapper}>
            <div className={Style.panelHeader} onClick={() => handelClick()}>
                {header}
                <span className={`${Style.panelHeaderIcon} ${panelBodyClassName!.includes('active') ? Style.panelHeaderIconRotate : ''}`}>
                    <Icon.Format.NextIcon />
                </span>
            </div>
            <div className={panelBodyClassName}>{children}</div>
        </div>
    );
};

const Collapse = (props: BaseCollapseProps) => {
    const { children } = props;

    return <div className={Style.collapseWrapper}>{children}</div>;
};

export class UniverCollapse implements CollapseComponent {
    render(): JSXComponent<BaseCollapseProps> {
        return Collapse;
    }
}
export class UniverPanel implements PanelComponent {
    render(): JSXComponent<BasePanelProps> {
        return Panel;
    }
}

export { Panel, Collapse };
