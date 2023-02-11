import { Editor, Path } from 'slate';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { insertImage } from 'editor/formatting';
import { isUrl } from 'utils/url';
import imageExtensions from 'utils/image-extensions';
import supabase from 'lib/supabase';
import { store } from 'lib/store';
import { PlanId } from 'constants/pricing';

const withImages = (editor: Editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    const { files } = data;

    // TODO: there is a bug on iOS Safari where the files array is empty
    // See https://github.com/ianstormtaylor/slate/issues/4491
    if (files && files.length > 0) {
      for (const file of files) {
        const [mime] = file.type.split('/');
        if (mime === 'image') {
          uploadAndInsertImage(editor, file);
        } else {
          toast.error('Only images can be uploaded.');
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const isImageUrl = (url: string) => {
  if (!url || !isUrl(url)) {
    return false;
  }
  const ext = new URL(url).pathname.split('.').pop();
  if (ext) {
    return imageExtensions.includes(ext);
  }
  return false;
};

export const uploadAndInsertImage = async (
  editor: Editor,
  file: File,
  path?: Path
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return;
  }

  // Enforce upload limits
  const BASIC_UPLOAD_LIMIT = 5 * 1024 * 1024; // 5 MB
  const PRO_UPLOAD_LIMIT = 20 * 1024 * 1024; // 20 MB
  const planId = store.getState().billingDetails.planId;

  if (planId === PlanId.Basic && file.size > BASIC_UPLOAD_LIMIT) {
    toast.error(
      'Your image is over the 5 MB limit. Upgrade to the Pro plan for 20 MB file uploads.'
    );
    return;
  } else if (
    (planId === PlanId.Pro || planId === PlanId.Catalyst) &&
    file.size > PRO_UPLOAD_LIMIT
  ) {
    toast.error(
      'Your image is over the 20 MB limit. Please upload a smaller image.'
    );
    return;
  }

  const uploadingToast = toast.info('Uploading image, please wait...', {
    autoClose: false,
    closeButton: false,
    draggable: false,
  });
  const key = `${user.id}/${uuidv4()}.png`;
  const { error: uploadError } = await supabase.storage
    .from('user-assets')
    .upload(key, file, { upsert: false });

  if (uploadError) {
    toast.dismiss(uploadingToast);
    toast.error(uploadError.message);
    return;
  }

  const expiresIn = 60 * 60 * 24 * 365 * 100; // 100 year expiry
  const { data, error: signedUrlError } = await supabase.storage
    .from('user-assets')
    .createSignedUrl(key, expiresIn);
  const signedUrl = data?.signedUrl;

  toast.dismiss(uploadingToast);
  if (signedUrl) {
    insertImage(editor, signedUrl, path);
  } else if (signedUrlError) {
    toast.error(signedUrlError.message);
  } else {
    toast.error(
      'There was a problem uploading your image. Please try again later.'
    );
  }
};

export default withImages;
