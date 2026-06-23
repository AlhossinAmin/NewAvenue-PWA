import { useApi } from "~/composables/common/useApi";
import type { ApiResponse } from "~/types/common/api";
import type { MediaItem } from "~/types/common/media";

// Media upload API. An image is uploaded on its own (POST /media) and stored
// under a temporary owner; the returned `id` is later attached to a record by
// sending it in that record's `photos: [id, …]` payload, which re-parents the
// media server-side. Uploads that are never attached are pruned daily by the
// backend, so the client doesn't have to clean up abandoned uploads itself.
export function useMedia() {
  const api = useApi();

  /**
   * Upload a single image file and return its `{ id, url }`. The id is what
   * gets submitted in a record's `photos` array; the url is for previewing.
   */
  const uploadMedia = async (file: File): Promise<MediaItem> => {
    const form = new FormData();
    form.append("image", file);
    const res = await api<ApiResponse<MediaItem>>("/media", {
      method: "POST",
      body: form,
    });
    return res.data;
  };

  /**
   * Delete a media item (row + underlying S3 file). Note: detaching a photo
   * from a record is done by omitting its id from the next `photos` payload —
   * this is only for explicitly destroying a standalone/abandoned upload.
   */
  const deleteMedia = async (id: string): Promise<void> => {
    await api(`/media/${id}`, { method: "DELETE" });
  };

  return { uploadMedia, deleteMedia };
}
