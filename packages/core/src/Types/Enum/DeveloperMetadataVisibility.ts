/**
 * An enumeration of the types of developer metadata visibility.
 */
export enum DeveloperMetadataVisibility {
    DOCUMENT, // Document-visible metadata is accessible from any developer project with access to the document.
    PROJECT, // Project-visible metadata is only visible to and accessible by the developer project that created the metadata. Do not use project-visible developer metadata as a security mechanism or to store secrets. It can be exposed to users with view access to the document.
}
