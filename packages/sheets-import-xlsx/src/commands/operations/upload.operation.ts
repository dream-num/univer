import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { UploadService } from '../../services/upload.service';

export const UploadOperation: ICommand = {
    id: 'import.operation.upload',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const uploadService = accessor.get(UploadService);
        uploadService.upload();
        return true;
    },
};
