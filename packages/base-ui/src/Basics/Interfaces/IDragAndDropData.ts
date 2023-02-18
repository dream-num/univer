export interface IDragAndDropData {
    /**
     * drag data item kind, one of: "string", "file"
     */
    kind: string;

    /**
     * MIME type, "text/plain", "image/jpeg"
     */
    type: string;

    /**
     * File object
     */
    file: File;
}
