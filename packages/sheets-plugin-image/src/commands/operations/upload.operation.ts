import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { UploadService } from '../../services/upload.service';

export const UploadOperation: ICommand = {
    id: 'image.operation.upload',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const uploadService = accessor.get(UploadService);
        uploadService.upload();
        return true;
    },
};
