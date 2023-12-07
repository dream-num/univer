import { LocaleService } from '@univerjs/core';
import { Button, Input } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';

import { IDataPreviewService } from '../../services/data-preview.service';
import styles from './index.module.less';

export function DataConnectorSidebar() {
    const localeService = useDependency(LocaleService);
    const [searchText, setSearchText] = useState<string>('');
    const dataPreviewService = useDependency(IDataPreviewService);

    function handleSearchInputChange(value: string) {
        setSearchText(value);
    }

    function handleConfirm() {
        // console.log('handleConfirm');
    }

    function handleSelectData(params: string) {
        dataPreviewService.setDataInfo(params);
    }

    return (
        <div className={styles.dataConnectorSidebar}>
            <div className={styles.dataConnectorSidebarContent}>
                <div className={styles.dataConnectorSidebarSelect}>
                    {localeService.t('dataConnector.sidebar.select')}
                </div>
                <div className={styles.dataConnectorSidebarSearch}>
                    <div className={styles.dataConnectorSidebarInput}>
                        <Input
                            placeholder={localeService.t(`dataConnector.sidebar.search`)}
                            value={searchText}
                            onChange={handleSearchInputChange}
                            size="large"
                            allowClear
                        />
                    </div>
                    <div className={styles.dataConnectorSidebarTree}>
                        <Button type="primary" onClick={() => handleSelectData('1')}>
                            {'data 1'}
                        </Button>
                        <Button type="primary" onClick={() => handleSelectData('2')}>
                            {'data 2'}
                        </Button>
                    </div>
                </div>
            </div>
            <div className={styles.dataConnectorSidebarOperation}>
                {
                    <Button type="primary" onClick={handleConfirm}>
                        {localeService.t('dataConnector.sidebar.import')}
                    </Button>
                }
            </div>
        </div>
    );
}
