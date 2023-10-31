import React, { useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
// import * as Icon from '../Icon';
import { Input } from '../Input';
import { Modal } from '../Modal';
import { ModalButtonGroup } from '../Modal/Modal';
import styles from './index.module.less';

export interface BaseCellRangeModalProps extends BaseComponentProps {
    value?: string;
    placeholder?: string;
    title?: string;
    contentPlaceholder?: string;
    onClick: () => void;
    onChange?: (e: Event) => void;
}

export function CellRange(props: BaseCellRangeModalProps) {
    const [value, setValue] = useState(props.value ?? '');
    const [show, setShow] = useState(false);

    const group: ModalButtonGroup[] = [
        {
            label: 'button.confirm',
            type: 'primary',
            onClick: props.onClick,
        },
    ];

    // const handleOk = (e: Event) => {
    //     const { onClick } = props;
    //     onClick?.(e);
    //     setShow(false);
    // };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { onChange } = props;
        setValue(e.target.value);
        onChange?.(e.nativeEvent);
    };

    return (
        <div className={styles.cellRangeModal}>
            <Input placeholder={props.placeholder} value={value} onChange={handleChange}></Input>
            <span className={styles.cellModalIcon} onClick={() => setShow(true)}>
                {/* <Icon.Sheet.TableIcon /> */}
            </span>
            <Modal title={props.title} visible={show} group={group}>
                <Input readonly={true} placeholder={props.contentPlaceholder} value={value}></Input>
            </Modal>
        </div>
    );
}
