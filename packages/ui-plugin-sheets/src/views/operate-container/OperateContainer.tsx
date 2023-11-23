import React from 'react';

import { AutoFillPopupMenu } from './AutoFillPopupMenu';
import styles from './index.module.less';

export const OperateContainer: React.FC = () => (
    <div className={styles.operateContainer}>
        <AutoFillPopupMenu></AutoFillPopupMenu>
    </div>
);
