import { createDownloadElement } from '../util/index';

export class ExportController {
    exportJson(data: string, fileName: string) {
        const blob = new Blob([data], { type: 'text/json' });
        const startDownload = createDownloadElement(`${fileName}.json`, blob);
        startDownload();
    }

    exportWebm(data: Blob, fileName: string) {
        const startDownload = createDownloadElement(`${fileName}.webm`, data);
        startDownload();
    }
}
