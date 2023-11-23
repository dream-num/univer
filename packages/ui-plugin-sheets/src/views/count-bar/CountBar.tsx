import React from 'react';

import styles from './index.module.less';
import { ZoomSlider } from './zoom-slider';

interface ICountBarProps {
    changeRatio?: (ratio: string) => void;
    onChange?: (value: string) => void;
}

export function CountBar(props: ICountBarProps) {
    return (
        <section className={styles.countBar}>
            <ZoomSlider />
        </section>
    );
}
