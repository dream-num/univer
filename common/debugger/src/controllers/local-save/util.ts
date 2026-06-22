export function createDownloadElement(fileName: string, blob: Blob) {
    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    return () => {
        a.click();
    };
}
