import './index.less';

import { MoreDownSingle } from '@univerjs/icons';

export const MoreNumfmtType = (props: { value?: string }) => {
    const value = props.value ?? '常规';
    return (
        <span className="more-numfmt-type">
            {value}
            <div className="icon">
                <MoreDownSingle />
            </div>
        </span>
    );
};
