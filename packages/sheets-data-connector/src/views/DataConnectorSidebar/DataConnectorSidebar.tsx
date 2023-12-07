import { LocaleService } from '@univerjs/core';
import { Button, Input, MessageType } from '@univerjs/design';
import { IMessageService } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';

import { IDataPreviewService } from '../../services/data-preview.service';
import type { IDataTree } from '../../services/interface';
import styles from './index.module.less';

export function DataConnectorSidebar() {
    const localeService = useDependency(LocaleService);
    const messageService = useDependency(IMessageService);
    const [searchText, setSearchText] = useState<string>('');
    const [dataId, setDataId] = useState<string>('');
    const dataPreviewService = useDependency(IDataPreviewService);
    const [dataTree, setDataTree] = useState<IDataTree | null>(null);

    useEffect(() => {
        dataPreviewService.getDataTree().then((data) => {
            setDataTree(data);
        });
    }, []);

    function handleSearchInputChange(value: string) {
        setSearchText(value);
    }

    function handleConfirm() {
        if (dataId === '') {
            messageService.show({
                type: MessageType.Warning,
                content: localeService.t('dataConnector.message.select'),
            });
            return;
        }

        dataPreviewService.setDataInfo(dataId);
    }

    function handleSelectData(params: string) {
        setDataId(params);
        dataPreviewService.setPreviewDataInfo(params);
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
                        {JSON.stringify(dataTree)}
                        <Button type="primary" onClick={() => handleSelectData('0c4334e4-85a9-46f3-b214-b14693e07bea')}>
                            {'data 1'}
                        </Button>
                        <Button type="primary" onClick={() => handleSelectData('0c4334e4-85a9-46f3-b214-b14693e07bea')}>
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
