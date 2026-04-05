import catalogData from "./catalog.json";
import source1 from "../assets/img/SourceCode Anh/source1.jpg";
import source2 from "../assets/img/SourceCode Anh/source2.jpg";
import source3 from "../assets/img/SourceCode Anh/source3.jpg";
import source4 from "../assets/img/SourceCode Anh/source4.jpg";
import source5 from "../assets/img/SourceCode Anh/source5.jpg";
import source6 from "../assets/img/SourceCode Anh/source6.jpg";
import source7 from "../assets/img/SourceCode Anh/source7.jpg";
import source8 from "../assets/img/SourceCode Anh/source8.jpg";
import souce9 from "../assets/img/SourceCode Anh/souce9.jpg";
import source10 from "../assets/img/SourceCode Anh/source10.jpg";
import detail1 from "../assets/img/Chi tiet SourceCode/detail1.jpg";
import detail2 from "../assets/img/Chi tiet SourceCode/detail2.jpg";
import detail3 from "../assets/img/Chi tiet SourceCode/detail3.jpg";
import detail4 from "../assets/img/Chi tiet SourceCode/detail4.jpg";
import detail5 from "../assets/img/Chi tiet SourceCode/detail5.jpg";
import detail6 from "../assets/img/Chi tiet SourceCode/detail6.jpg";
import detail7 from "../assets/img/Chi tiet SourceCode/detail7.jpg";
import detail8 from "../assets/img/Chi tiet SourceCode/detail8.jpg";
import detail9 from "../assets/img/Chi tiet SourceCode/detail9.jpg";
import detail10 from "../assets/img/Chi tiet SourceCode/detail10.jpg";
import detail11 from "../assets/img/Chi tiet SourceCode/detail11.jpg";
import detail12 from "../assets/img/Chi tiet SourceCode/detail12.jpg";
import detail13 from "../assets/img/Chi tiet SourceCode/detail13.jpg";
import detail14 from "../assets/img/Chi tiet SourceCode/detail14.jpg";
import detail15 from "../assets/img/Chi tiet SourceCode/detail15.jpg";
import detail16 from "../assets/img/Chi tiet SourceCode/detail16.jpg";
import detail17 from "../assets/img/Chi tiet SourceCode/detail17.jpg";
import detail18 from "../assets/img/Chi tiet SourceCode/detail18.jpg";
import detail19 from "../assets/img/Chi tiet SourceCode/detail19.jpg";
import detail20 from "../assets/img/Chi tiet SourceCode/detail20.jpg";
import detail21 from "../assets/img/Chi tiet SourceCode/detail21.jpg";
import detail22 from "../assets/img/Chi tiet SourceCode/detail22.jpg";
import detail23 from "../assets/img/Chi tiet SourceCode/detail23.jpg";
import detail24 from "../assets/img/Chi tiet SourceCode/detail24.jpg";
import detail25 from "../assets/img/Chi tiet SourceCode/detail25.jpg";
import detail26 from "../assets/img/Chi tiet SourceCode/detail26.jpg";
import detail27 from "../assets/img/Chi tiet SourceCode/detail27.jpg";
import detail28 from "../assets/img/Chi tiet SourceCode/detail28.jpg";
import detail29 from "../assets/img/Chi tiet SourceCode/detail29.jpg";
import detail30 from "../assets/img/Chi tiet SourceCode/detail30.jpg";
import detail31 from "../assets/img/Chi tiet SourceCode/detail31.jpg";
import detail32 from "../assets/img/Chi tiet SourceCode/detail32.jpg";
import detail33 from "../assets/img/Chi tiet SourceCode/detail33.jpg";
import detail34 from "../assets/img/Chi tiet SourceCode/detail34.jpg";
import detail35 from "../assets/img/Chi tiet SourceCode/detail35.jpg";

export type SourceCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
};

export type SourceProduct = {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  videoUrl?: string;
  technologies: string[];
  price: number;
  categoryId: string;
  languages: string[];
  projectType: string;
  level: "starter" | "professional" | "enterprise";
  readmeHighlights: string[];
  includes: string[];
  deliverables: string[];
  detailImages: string[];
};

const coverImageMap = {
  source1,
  source2,
  source3,
  source4,
  source5,
  source6,
  source7,
  source8,
  souce9,
  source9: souce9,
  source10,
} as const;

const detailImageMap = {
  detail1,
  detail2,
  detail3,
  detail4,
  detail5,
  detail6,
  detail7,
  detail8,
  detail9,
  detail10,
  detail11,
  detail12,
  detail13,
  detail14,
  detail15,
  detail16,
  detail17,
  detail18,
  detail19,
  detail20,
  detail21,
  detail22,
  detail23,
  detail24,
  detail25,
  detail26,
  detail27,
  detail28,
  detail29,
  detail30,
  detail31,
  detail32,
  detail33,
  detail34,
  detail35,
} as const;

type RawProduct = Omit<SourceProduct, "coverImage" | "detailImages"> & {
  coverImageKey: keyof typeof coverImageMap;
  detailImageKeys: (keyof typeof detailImageMap)[];
};

type CatalogData = {
  languageFilters: string[];
  priceFilters: { id: string; label: string }[];
  projectTypes: string[];
  categories: SourceCategory[];
  products: RawProduct[];
};

const catalog = catalogData as CatalogData;
const defaultCoverImage = coverImageMap.source1;

export const sourceCategories = catalog.categories;
export const languageFilters = catalog.languageFilters;
export const priceFilters = catalog.priceFilters;
export const projectTypes = catalog.projectTypes;

export const sourceProducts: SourceProduct[] = catalog.products.map((product) => {
  const { coverImageKey, detailImageKeys, ...rest } = product;
  const coverImage = coverImageMap[coverImageKey] ?? defaultCoverImage;
  const detailImages = detailImageKeys
    .map((key) => detailImageMap[key])
    .filter((value): value is string => Boolean(value));

  return {
    ...rest,
    coverImage,
    detailImages: detailImages.length > 0 ? detailImages : [coverImage],
  };
});

export const findProductById = (productId: string) =>
  sourceProducts.find((product) => product.id === productId);

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  license: "personal" | "commercial" | "enterprise";
  supportPlan: "standard" | "priority";
};

export const initialCartItems: CartItem[] = [
];

export const paymentMethods = [
  { id: "bank", label: "Chuyển khoản ngân hàng" },
  { id: "momo", label: "MOMO / ZaloPay" },
  { id: "paypal", label: "Paypal" },
];

export type DownloadTicket = {
  id: string;
  productId: string;
  status: "waiting" | "ready";
  downloadUrl: string;
  lastUpdated: string;
};

export const downloadTickets: DownloadTicket[] = [
  {
    id: "ticket-1",
    productId: "creative-avatar-studio",
    status: "ready",
    downloadUrl: "https://example.com/download/avatar-studio.zip",
    lastUpdated: "2025-12-01 09:00",
  },
  {
    id: "ticket-2",
    productId: "neosport-sneaker-store",
    status: "waiting",
    downloadUrl: "",
    lastUpdated: "2025-12-01 08:30",
  },
];

export type AdminOrder = {
  id: string;
  buyer: string;
  email: string;
  productId: string;
  amount: number;
  method: string;
  status: "pending" | "paid";
  createdAt: string;
};

export const initialAdminOrders: AdminOrder[] = [
  {
    id: "ord-2101",
    buyer: "Lê Minh",
    email: "leminh@example.com",
    productId: "rio-florist-commerce",
    amount: 100,
    method: "Chuyển khoản",
    status: "pending",
    createdAt: "2025-12-01 08:45",
  },
  {
    id: "ord-2102",
    buyer: "Agency Nova",
    email: "cto@agency-nova.com",
    productId: "habit-ai-generator",
    amount: 199,
    method: "MOMO",
    status: "paid",
    createdAt: "2025-12-01 08:10",
  },
  {
    id: "ord-2103",
    buyer: "Trần Hà",
    email: "tran.ha@gmail.com",
    productId: "milktea-franchise-kit",
    amount: 400,
    method: "Paypal",
    status: "pending",
    createdAt: "2025-12-01 07:55",
  },
];
