export enum UpdateDocsAttributeType {
    COVER, // Default, if not present, add; if present, overwrite, while retaining the original properties.
    REPLACE, // Replace the original properties entirely.
    INTERSECTION, // Retain only the intersecting properties.
}
