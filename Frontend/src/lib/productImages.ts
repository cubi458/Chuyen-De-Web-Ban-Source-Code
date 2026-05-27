import { API_BASE_URL } from "./api";

const coverAssetMap: Record<string, string> = {
  "source1.jpg": require("assets/img/SourceCode Anh/source1.jpg"),
  "source2.jpg": require("assets/img/SourceCode Anh/source2.jpg"),
  "source3.jpg": require("assets/img/SourceCode Anh/source3.jpg"),
  "source4.jpg": require("assets/img/SourceCode Anh/source4.jpg"),
  "source5.jpg": require("assets/img/SourceCode Anh/source5.jpg"),
  "source6.jpg": require("assets/img/SourceCode Anh/source6.jpg"),
  "source7.jpg": require("assets/img/SourceCode Anh/source7.jpg"),
  "source8.jpg": require("assets/img/SourceCode Anh/source8.jpg"),
  "souce9.jpg": require("assets/img/SourceCode Anh/souce9.jpg"),
  "source9.jpg": require("assets/img/SourceCode Anh/souce9.jpg"),
  "source10.jpg": require("assets/img/SourceCode Anh/source10.jpg"),
};

const detailAssetMap: Record<string, string> = {
  "detail1.jpg": require("assets/img/Chi tiet SourceCode/detail1.jpg"),
  "detail2.jpg": require("assets/img/Chi tiet SourceCode/detail2.jpg"),
  "detail3.jpg": require("assets/img/Chi tiet SourceCode/detail3.jpg"),
  "detail4.jpg": require("assets/img/Chi tiet SourceCode/detail4.jpg"),
  "detail5.jpg": require("assets/img/Chi tiet SourceCode/detail5.jpg"),
  "detail6.jpg": require("assets/img/Chi tiet SourceCode/detail6.jpg"),
  "detail7.jpg": require("assets/img/Chi tiet SourceCode/detail7.jpg"),
  "detail8.jpg": require("assets/img/Chi tiet SourceCode/detail8.jpg"),
  "detail9.jpg": require("assets/img/Chi tiet SourceCode/detail9.jpg"),
  "detail10.jpg": require("assets/img/Chi tiet SourceCode/detail10.jpg"),
  "detail11.jpg": require("assets/img/Chi tiet SourceCode/detail11.jpg"),
  "detail12.jpg": require("assets/img/Chi tiet SourceCode/detail12.jpg"),
  "detail13.jpg": require("assets/img/Chi tiet SourceCode/detail13.jpg"),
  "detail14.jpg": require("assets/img/Chi tiet SourceCode/detail14.jpg"),
  "detail15.jpg": require("assets/img/Chi tiet SourceCode/detail15.jpg"),
  "detail16.jpg": require("assets/img/Chi tiet SourceCode/detail16.jpg"),
  "detail17.jpg": require("assets/img/Chi tiet SourceCode/detail17.jpg"),
  "detail18.jpg": require("assets/img/Chi tiet SourceCode/detail18.jpg"),
  "detail19.jpg": require("assets/img/Chi tiet SourceCode/detail19.jpg"),
  "detail20.jpg": require("assets/img/Chi tiet SourceCode/detail20.jpg"),
  "detail21.jpg": require("assets/img/Chi tiet SourceCode/detail21.jpg"),
  "detail22.jpg": require("assets/img/Chi tiet SourceCode/detail22.jpg"),
  "detail23.jpg": require("assets/img/Chi tiet SourceCode/detail23.jpg"),
  "detail24.jpg": require("assets/img/Chi tiet SourceCode/detail24.jpg"),
  "detail25.jpg": require("assets/img/Chi tiet SourceCode/detail25.jpg"),
  "detail26.jpg": require("assets/img/Chi tiet SourceCode/detail26.jpg"),
  "detail27.jpg": require("assets/img/Chi tiet SourceCode/detail27.jpg"),
  "detail28.jpg": require("assets/img/Chi tiet SourceCode/detail28.jpg"),
  "detail29.jpg": require("assets/img/Chi tiet SourceCode/detail29.jpg"),
  "detail30.jpg": require("assets/img/Chi tiet SourceCode/detail30.jpg"),
  "detail31.jpg": require("assets/img/Chi tiet SourceCode/detail31.jpg"),
  "detail32.jpg": require("assets/img/Chi tiet SourceCode/detail32.jpg"),
  "detail33.jpg": require("assets/img/Chi tiet SourceCode/detail33.jpg"),
  "detail34.jpg": require("assets/img/Chi tiet SourceCode/detail34.jpg"),
  "detail35.jpg": require("assets/img/Chi tiet SourceCode/detail35.jpg"),
};

const serverBaseUrl = API_BASE_URL.replace(/\/api\/?$/, "");

const normalizeServerPath = (pathValue: string) => {
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return pathValue;
  }
  if (pathValue.startsWith("/")) {
    return `${serverBaseUrl}${pathValue}`;
  }
  return `${serverBaseUrl}/${pathValue}`;
};

const resolveAssetCover = (key: string) => coverAssetMap[key] || coverAssetMap["source7.jpg"];

const resolveAssetDetail = (key: string) => detailAssetMap[key];

export const resolveCoverImage = (value?: string | null, fallback?: string) => {
  if (!value) {
    return fallback || coverAssetMap["source7.jpg"];
  }
  if (value.startsWith("asset:")) {
    const key = value.replace("asset:", "").trim();
    return resolveAssetCover(key);
  }
  if (value.startsWith("asset-cover:")) {
    const key = value.replace("asset-cover:", "").trim();
    return resolveAssetCover(key);
  }
  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) {
    return normalizeServerPath(value);
  }
  return value;
};

export const resolveDetailImages = (value?: string | null) => {
  if (!value) {
    return [] as string[];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item.startsWith("asset-detail:")) {
        const key = item.replace("asset-detail:", "").trim();
        return resolveAssetDetail(key) || "";
      }
      if (item.startsWith("detail:")) {
        const key = item.replace("detail:", "").trim();
        return resolveAssetDetail(key) || "";
      }
      if (item.startsWith("/uploads/") || item.startsWith("uploads/")) {
        return normalizeServerPath(item);
      }
      return item;
    })
    .filter(Boolean);
};
