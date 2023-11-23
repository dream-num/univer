import { BaseComponentProps } from '@univerjs/base-ui';
import { Nullable } from '@univerjs/core';
import { Container, Input, Tooltip } from '@univerjs/design';
import React, { Component } from 'react';

import { BaseInfoBarProps } from '../../controllers/info-bar-ui-controller';
import styles from './index.module.less';

interface IState {
    infoList: Nullable<BaseInfoBarProps>;
}

interface IProps extends BaseComponentProps {
    renameSheet: () => void;
}

export class InfoBar extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            infoList: null,
        };
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    setInfoList(list: BaseInfoBarProps) {
        this.setState({
            infoList: list,
        });
    }

    override render() {
        const { renameSheet } = this.props;
        if (!this.state.infoList) return;

        const { back, slide, update, save, rename } = this.state.infoList;

        return (
            <Container className={styles.infoDetail}>
                {/* <div style={{ marginRight: '18px' }}>
                    <Tooltip title={back.label} placement={'bottom'}>
                        <Button className={styles.infoReturn} type="text">
                            <DropDownIcon rotate={90} />
                        </Button>
                    </Tooltip>
                </div> */}
                {/* <LogoIcon style={{ width: '152px', height: '32px' }} /> */}
                <div className={styles.sheetName}>
                    <Tooltip title={rename.label} placement={'bottom'}>
                        <Input value={slide.label} />
                    </Tooltip>
                </div>
                <div className={styles.infoDetailUpdate}>{/* <CustomLabel label={update.label} /> */}</div>
                <div className={styles.infoDetailSave}>{/* <CustomLabel label={save.label} /> */}</div>
            </Container>
        );
    }
}
