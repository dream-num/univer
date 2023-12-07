import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { ISidebarService } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { IDataPreviewService } from '../../services/data-preview.service';
import { DATA_CONNECTOR_SIDEBAR_COMPONENT } from '../../views/DataConnectorSidebar/interface';

export const DataConnectorSidebarOperation: ICommand = {
    id: 'data-connector.operation.sidebar',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sidebarService = accessor.get(ISidebarService);
        const dataPreviewService = accessor.get(IDataPreviewService);

        dataPreviewService.setState(true);

        sidebarService.open({
            header: { title: 'dataConnector.insert.tooltip' },
            children: { label: DATA_CONNECTOR_SIDEBAR_COMPONENT },
            onClose: () => {
                dataPreviewService.setState(false);
            },
        });

        return true;
    },
};
