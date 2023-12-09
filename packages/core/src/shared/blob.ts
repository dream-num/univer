export function codeToBlob(code: string) {
    const blob = new Blob([code], { type: 'text/javascript' });
    const objectURL = window.URL.createObjectURL(blob);
    return objectURL;
}
