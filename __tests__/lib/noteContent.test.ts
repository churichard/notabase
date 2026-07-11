import type { Descendant } from 'slate';
import {
  INLINE_IMAGE_ERROR_MESSAGE,
  MAX_NOTE_BYTES,
  NOTE_SIZE_ERROR_MESSAGE,
  NOTE_WARNING_BYTES,
  getNoteContentBytes,
  hasInlineImageData,
  validateNoteContent,
} from 'lib/noteContent';

const contentWithByteSize = (target: number): Descendant[] => {
  const content = [
    { type: 'paragraph', children: [{ text: '' }] },
  ] as Descendant[];
  const overhead = getNoteContentBytes(content);
  (content[0] as { children: { text: string }[] }).children[0].text =
    'a'.repeat(target - overhead);
  return content;
};

describe('note content limits', () => {
  it('measures UTF-8 bytes rather than JavaScript string length', () => {
    const content = [
      { type: 'paragraph', children: [{ text: '😀' }] },
    ] as Descendant[];
    expect(getNoteContentBytes(content)).toBe(
      Buffer.byteLength(JSON.stringify(content), 'utf8')
    );
    expect(getNoteContentBytes(content)).toBeGreaterThan(
      JSON.stringify(content).length
    );
  });

  it('accepts content at the 5 MB limit', () => {
    expect(getNoteContentBytes(contentWithByteSize(MAX_NOTE_BYTES))).toBe(
      MAX_NOTE_BYTES
    );
    expect(validateNoteContent(contentWithByteSize(MAX_NOTE_BYTES))).toBeNull();
  });

  it('rejects content above the 5 MB limit', () => {
    expect(validateNoteContent(contentWithByteSize(MAX_NOTE_BYTES + 1))).toBe(
      NOTE_SIZE_ERROR_MESSAGE
    );
  });

  it('exposes the warning threshold below the hard limit', () => {
    expect(NOTE_WARNING_BYTES).toBeLessThan(MAX_NOTE_BYTES);
    expect(
      validateNoteContent(contentWithByteSize(NOTE_WARNING_BYTES))
    ).toBeNull();
  });

  it('rejects inline image data anywhere in the Slate value', () => {
    const content = [
      {
        type: 'image',
        url: 'data:image/png;base64,aGVsbG8=',
        children: [{ text: '' }],
      },
    ] as Descendant[];
    expect(hasInlineImageData(content)).toBe(true);
    expect(validateNoteContent(content)).toBe(INLINE_IMAGE_ERROR_MESSAGE);
  });
});
