import { API_BASE_URL } from "../config";

export const getImageUrl = (fileImage) => {
  if (!fileImage) return null;
  if (fileImage.startsWith("http") || fileImage.startsWith("data:")) {
    return fileImage;
  }
  return `${API_BASE_URL}${fileImage}`;
};
