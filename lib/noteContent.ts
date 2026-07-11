import type { Descendant } from 'slate';

export const MAX_NOTE_BYTES = 5 * 1024 * 1024;
export const NOTE_WARNING_BYTES = Math.floor(4.5 * 1024 * 1024);
export const NOTE_SIZE_ERROR_CODE = 'P0001';
// Messages raised by the validate_note_content trigger in the database
export const NOTE_SIZE_DB_ERROR = 'NOTE_CONTENT_TOO_LARGE';
export const INLINE_IMAGE_DB_ERROR = 'NOTE_CONTAINS_INLINE_IMAGE';
export const NOTE_SIZE_ERROR_MESSAGE =
  'This note is over the 5 MB limit. Remove some content or upload embedded images as files before saving.';
export const INLINE_IMAGE_ERROR_MESSAGE =
  'This note contains an embedded image. Upload the image as a file before saving.';

export const getNoteContentBytes = (content: Descendant[]) =>
  new Blob([JSON.stringify(content)]).size;

export const hasInlineImageData = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return /^data:image\/[a-z0-9.+-]+;base64,/i.test(value);
  }
  if (Array.isArray(value)) {
    return value.some(hasInlineImageData);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).some(hasInlineImageData);
  }
  return false;
};

export const validateNoteContent = (content: Descendant[]) => {
  if (hasInlineImageData(content)) {
    return INLINE_IMAGE_ERROR_MESSAGE;
  }
  if (getNoteContentBytes(content) > MAX_NOTE_BYTES) {
    return NOTE_SIZE_ERROR_MESSAGE;
  }
  return null;
};
