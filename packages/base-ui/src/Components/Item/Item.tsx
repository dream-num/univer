import React from 'react';

import { Icon } from '..';
import { CustomLabel } from '../CustomLabel';
import styles from './index.module.less';

export interface BaseMenuItem {
    className?: string;
    style?: React.CSSProperties;
    label?: React.ReactNode;
    value?: any;
    children?: BaseMenuItem[];
    show?: boolean;
    disabled?: boolean;
    onClick?: (...arg: any) => void;
    border?: boolean;
}
export interface BaseItemProps extends BaseMenuItem {
    selected?: boolean;
    suffix?: React.ReactNode;
    border?: boolean;
}
// // TODO@wzhudev: move this component to another proper position. Now used by NeoCustomLabel component.
// /**
//  * This render as a label of MenuItem.
//  */
// export class Item extends Component<BaseItemProps> {
//     render() {
//         const { selected, label, suffix, disabled } = this.props;
//         return (
//             <div className={joinClassNames(styles.selectItem, disabled ? styles.selectDisabledItem : '')}>
//                 {selected && (
//                     <span className={styles.selectItemSelected}>
//                         <Icon.CorrectIcon />
//                     </span>
//                 )}
//                 <span className={styles.selectItemContent}>
//                     <CustomLabel label={label} />
//                 </span>
//                 {suffix && (
//                     <span className={styles.selectItemSuffix}>
//                         <CustomLabel label={suffix} />
//                     </span>
//                 )}
//             </div>
//         );
//     }
// }

export function Item({ selected, label, suffix, disabled, className, style, onClick }: BaseItemProps) {
    return (
        <div
            className={`${styles.selectItem} ${disabled ? styles.selectDisabledItem : ''} ${className || ''}`}
            style={style}
            onClick={onClick}
        >
            {selected && (
                <span className={styles.selectItemSelected}>
                    <Icon.CorrectIcon />
                </span>
            )}
            <span className={styles.selectItemContent}>
                <CustomLabel label={label} />
            </span>
            {suffix && (
                <span className={styles.selectItemSuffix}>
                    <CustomLabel label={suffix} />
                </span>
            )}
        </div>
    );
}
