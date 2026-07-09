import { put, del } from '@vercel/blob';

// ponytail: thin wrappers over @vercel/blob. Token read from BLOB_READ_WRITE_TOKEN
// env by the SDK automatically. Add list/copy when a feature needs them.

export async function uploadAvatar(userId: string, file: File | Blob) {
  const ext = file instanceof File && file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  return put(`avatars/${userId}.${ext}`, file, { access: 'public', allowOverwrite: true });
}

export async function deleteBlob(url: string) {
  return del(url);
}
