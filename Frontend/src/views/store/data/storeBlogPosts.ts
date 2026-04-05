import blog1 from "../../../assets/img/blog/blog1.png";
import blog2 from "../../../assets/img/blog/blog2.png";
import blog3 from "../../../assets/img/blog/blog3.png";
import blog4 from "../../../assets/img/blog/blog4.png";

export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  dateLabel: string;
  readTimeLabel: string;
  coverImage?: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
};

export const storeBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "2 tính năng email hữu ích sẽ bị Google loại bỏ vào tháng 1 này",
    summary:
      "Google xác nhận sẽ dừng hai tính năng cho phép đưa email từ tài khoản không thuộc Google vào Gmail trên desktop. Nguyên nhân trọng tâm nằm ở POP3: giao thức cũ, ít lớp bảo mật, đang được ngành chuyển dần sang IMAP.",
    tags: ["Gmail", "POP3", "Email"],
    dateLabel: "2026",
    readTimeLabel: "8 phút",
    coverImage: blog1,
    sections: [
      {
        heading: "Google lại ‘khai tử’ một tính năng quen thuộc",
        paragraphs: [
          "Google có truyền thống lâu đời trong việc loại bỏ các ứng dụng và tính năng hữu ích, và xu hướng đó không có dấu hiệu chậm lại.",
          "Theo bài viết trên Trung tâm Trợ giúp của Google, việc hỗ trợ cho hai tính năng của Gmail là Gmailify và ‘Check mail from other accounts’ sẽ kết thúc vào tháng 1 năm 2026.",
        ],
      },
      {
        heading: "Gmailify và ‘Check mail from other accounts’ là gì?",
        paragraphs: [
          "Đây là hai tính năng cho phép người dùng Gmail truy cập email từ những tài khoản không phải của Google ngay trong Gmail trên desktop.",
          "Ở trường hợp Gmailify, Google còn ‘mang’ một số trải nghiệm đặc trưng của Gmail sang các tài khoản đó — ví dụ chống thư rác, thông báo tốt hơn trên di động, phân loại hộp thư đến và tìm kiếm được cải thiện.",
          "Trên desktop, đây gần như là cách duy nhất để đọc email không thuộc Gmail ngay trong giao diện webmail của Gmail (thay vì phải đổi sang app email khác). Lựa chọn phổ biến còn lại thường là chuyển tiếp email về địa chỉ Gmail.",
        ],
      },
      {
        heading: "Vì sao Google ngừng hỗ trợ? POP3 đã quá cũ",
        paragraphs: [
          "Google cho biết lý do chính đến từ công nghệ phía sau các tính năng này: POP3.",
          "POP3 là viết tắt của Post Office Protocol 3 — một giao thức email đã tồn tại dưới nhiều hình thức từ năm 1988. Thông số kỹ thuật POP3 hiện tại được phát hành vào năm 1996, tức đã khoảng 30 năm.",
          "Vấn đề không chỉ nằm ở tuổi đời. POP3 thiếu nhiều biện pháp bảo mật và khả năng vận hành ‘đúng chuẩn hiện đại’ so với các giao thức mới hơn, khiến nó dễ rơi vào các kịch bản truy cập trái phép hoặc cấu hình thiếu an toàn.",
          "Vì vậy, các công ty như Google và Microsoft đã và đang rời bỏ POP3 để chuyển sang giải pháp thay thế mới hơn — tiêu biểu là IMAP (Internet Message Access Protocol).",
        ],
      },
      {
        heading: "Người dùng cần làm gì sau mốc 1/2026?",
        paragraphs: [
          "Gmail vẫn tiếp tục hỗ trợ IMAP trên các ứng dụng di động, nên bạn vẫn có thể gom nhiều tài khoản email về một nơi theo cách đó.",
          "Tuy nhiên, bạn sẽ không thể dùng các tính năng ‘đậm chất Gmail’ trên những tài khoản không phải Gmail nữa — điều này là điểm đáng tiếc với nhóm người dùng đang dựa vào Gmailify.",
        ],
      },
      {
        heading: "Dùng Gmail web trên desktop: sẽ bất tiện hơn",
        paragraphs: [
          "Điểm hạn chế là phiên bản web của Gmail không hỗ trợ truy cập các tài khoản khác qua IMAP. Điều đó đồng nghĩa người dùng desktop muốn hợp nhất nhiều hộp thư đến ngay trong Gmail web sẽ không còn cách làm như trước.",
          "Nếu bạn cần hợp nhất inbox trên desktop, bạn có thể cân nhắc: (1) dùng ứng dụng email của bên thứ ba, hoặc (2) chuyển tiếp email về Gmail. Một số ứng dụng email mạnh hiện có như Thunderbird (mã nguồn mở, đa nền tảng) — dù vẫn thiếu sự tiện lợi ‘mở trình duyệt là dùng’ của webmail.",
        ],
      },
      {
        heading: "Gmail vẫn tiếp tục phát triển",
        paragraphs: [
          "Dù hai tính năng nói trên bị loại bỏ, bản thân Gmail sẽ không biến mất. Trên thực tế, Google vẫn đang cập nhật sản phẩm với các tính năng mới, chẳng hạn khả năng quản lý đăng ký (subscription management).",
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Tại sao nên sử dụng DropIt, tiện ích mã nguồn mở dành cho Windows tự động sắp xếp mọi thứ được tải xuống?",
    summary:
      "Việc sắp xếp thư mục Downloads chưa bao giờ là điều được yêu thích. Tất cả các loại file nhanh chóng chất đống, và việc sắp xếp chúng thủ công giống như một công việc tốn thời gian. DropIt sẽ tự động hóa công việc này.",
    tags: ["DropIt", "Windows"],
    dateLabel: "2026",
    readTimeLabel: "10 phút ",
    coverImage: blog2,
    sections: [
      {
        heading: "DropIt thay thế công việc thủ công bằng tự động hóa",
        paragraphs: [
          "DropIt hoạt động dựa trên một nguyên tắc đơn giản: bạn xác định các quy tắc và nó tuân theo chúng. Mỗi quy tắc, được gọi là 'liên kết', bao gồm một bộ lọc (tên, phần mở rộng, kích thước, ngày) và một hành động (di chuyển, sao chép, nén, xóa).",
          "Bạn có thể thiết lập DropIt để theo dõi các thư mục cụ thể, chẳng hạn như thư mục Downloads, và nó sẽ tự động xử lý các file mới khi chúng đến. Ví dụ: file PDF được chuyển đến thư mục Documents, hình ảnh được chuyển đến Pictures, và file cài đặt được chuyển đến một thư mục khác. Việc này giúp tiết kiệm rất nhiều thời gian.",
          "DropIt cũng có thể xử lý các thao tác nâng cao hơn. Bạn có thể kết hợp nhiều hành động, đổi tên file theo mẫu, hoặc đặt mức độ ưu tiên nếu một file khớp với nhiều quy tắc.",
        ],
      },
      {
        heading: "Tùy chỉnh các quy tắc để phù hợp với bất kỳ quy trình làm việc nào",
        paragraphs: [
          "Tính linh hoạt của DropIt vượt xa việc sắp xếp file đơn giản. Bạn có thể tạo các liên kết dựa trên biểu thức chính quy hoặc các thuộc tính file cụ thể.",
          "Ví dụ, một nhiếp ảnh gia có thể sắp xếp các file RAW theo ngày, trong khi một nhà phát triển có thể tách các kho lưu trữ mã nguồn khỏi tài liệu. Công cụ này có thể thích ứng với các nhu cầu khác nhau mà không cần plugin.",
        ],
        bullets: [
            "Tải xuống DropIt từ trang web chính thức.",
            "Nhấp chuột phải vào biểu tượng DropIt trong khay hệ thống và chọn Associations.",
            "Nhấp vào Add để tạo quy tắc mới.",
            "Nhập tiêu chí lọc (ví dụ: *.pdf).",
            "Chọn một hành động (Move, Copy, Rename, Compress...).",
            "Đặt thư mục đích và lưu lại.",
        ]
      },
      {
        heading: "DropIt cung cấp 21 thao tác để xử lý file",
        paragraphs: [
          "Ngoài các thao tác cơ bản như di chuyển và sao chép, DropIt còn bao gồm những thao tác nâng cao như nén, giải nén, đổi tên hàng loạt, xóa file, in tài liệu, upload qua FTP, và gửi file qua email.",
          "Một số thao tác phục vụ cho các quy trình làm việc chuyên biệt như tạo thư viện ảnh HTML (Create Gallery) hoặc tạo playlist nhạc (Create Playlist). Bạn cũng có thể mã hóa, giải mã, hoặc chia nhỏ file.",
        ],
      },
      {
        heading: "Là phần mềm mã nguồn mở, DropIt là một lựa chọn đáng tin cậy",
        paragraphs: [
          "Nhiều tiện ích tổ chức file thường đi kèm với phần mềm không mong muốn, quảng cáo, hoặc theo dõi người dùng. DropIt là mã nguồn mở, không thu thập dữ liệu, không có gói trả phí, và không có phí đăng ký.",
          "Sự minh bạch này rất quan trọng vì công cụ có quyền truy cập vào hoạt động file của bạn. Việc biết rằng nó không gửi dữ liệu về máy chủ là điều đáng yên tâm.",
        ],
      },
      {
        heading: "Thời gian đầu tư sẽ được đền đáp gần như ngay lập tức",
        paragraphs: [
          "Sau khi thiết lập ban đầu, bạn sẽ hiếm khi nghĩ đến việc sắp xếp file nữa. Các file tải xuống được tự động lưu trữ đúng nơi cần thiết mà không cần bạn can thiệp. Đó chính là điểm mấu chốt: một công cụ xử lý các tác vụ tẻ nhạt để bạn có thể tập trung vào công việc thực sự.",
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Tấn công Man in the Middle – Chiếm quyền điều khiển Session",
    summary:
      "Giới thiệu về tấn công chiếm quyền điều khiển Session, cùng với đó là một số lý thuyết, cách thức thực hiện, cách phát hiện và biện pháp phòng chống.",
    tags: ["Security","MITM"],
    dateLabel: "2026",
    readTimeLabel: "12 phút ",
    coverImage: blog3,
    sections: [
      {
        heading: "Chiếm quyền điều khiển Session là gì?",
        paragraphs: [
          "Thuật ngữ chiếm quyền điều khiển session (session hijacking) chứa đựng một loạt các tấn công khác nhau. Nhìn chung, các tấn công có liên quan đến sự khai thác session giữa các thiết bị đều được coi là chiếm quyền điều khiển session.",
          "Khi đề cập đến một session, chúng ta sẽ nói về kết nối giữa các thiết bị mà trong đó có trạng thái đàm thoại được thiết lập, duy trì và phải sử dụng một quá trình nào đó để ngắt nó. Ví dụ điển hình là các session HTTP khi bạn đăng nhập vào một website.",
          "Nguyên lý ẩn phía sau hầu hết các hình thức chiếm quyền điều khiển session là nếu kẻ tấn công có thể chặn được dữ liệu dùng để thiết lập session (ví dụ: cookie), họ có thể sử dụng dữ liệu đó để giả mạo người dùng và truy cập vào tài khoản.",
        ],
      },
      {
        heading: "Ví dụ: Đánh cắp Cookies bằng Hamster và Ferret",
        paragraphs: [
          "Trong kịch bản này, chúng ta sẽ thực hiện một tấn công chiếm quyền điều khiển session bằng cách chặn sự truyền thông của một người dùng đang đăng nhập vào tài khoản. Sử dụng sự truyền thông bị chặn này, chúng ta sẽ giả mạo người dùng đó và truy cập vào tài khoản từ máy tính tấn công.",
          "Để thực hiện, chúng ta sẽ sử dụng hai công cụ là Hamster và Ferret. Các công cụ này có sẵn trong bộ công cụ Backtrack 4 (hoặc Kali Linux ngày nay).",
          "Bước đầu tiên là capture lưu lượng của nạn nhân khi họ duyệt web. Lưu lượng này có thể được capture bằng Wireshark hoặc tcpdump, thường kết hợp với kỹ thuật giả mạo ARP cache (ARP spoofing).",
          "Sau khi capture, file dữ liệu (ví dụ: .pcap) sẽ được xử lý bằng Ferret để trích xuất thông tin session. Cuối cùng, Hamster được dùng như một proxy để sử dụng các cookie đã đánh cắp, cho phép kẻ tấn công truy cập vào session của nạn nhân mà không cần username hay password.",
        ],
      },
      {
        heading: "Cách chống tấn công chiếm quyền điều khiển Session",
        paragraphs: [
          "Do có nhiều hình thức chiếm quyền điều khiển session khác nhau nên cách thức phòng chống cũng cần thay đổi theo chúng. Giống như các tấn công MITM khác, tấn công chiếm quyền điều khiển session khó phát hiện và thậm chí còn khó khăn hơn trong việc phòng chống vì nó phần lớn là tấn công thụ động.",
        ],
        bullets: [
          "Hạn chế truy cập các dịch vụ quan trọng (ngân hàng, email) trên các mạng không tin cậy như Wi-Fi công cộng.",
          "Luôn để ý đến các dấu hiệu bất thường, ví dụ như thời gian đăng nhập cuối cùng không khớp với hoạt động của bạn.",
          "Sử dụng các kết nối được mã hóa (HTTPS) để bảo vệ dữ liệu session khỏi bị nghe lén.",
          "Đối với quản trị viên mạng, việc bảo mật tốt các thiết bị bên trong mạng sẽ giảm thiểu nguy cơ một kẻ tấn công có thể thực hiện các kỹ thuật nghe lén.",
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Mã hóa đầu cuối là gì và nó hoạt động như thế nào?",
    summary:
      "Tìm hiểu về mã hóa đầu cuối (E2EE), cách nó bảo vệ các cuộc trò chuyện của bạn và sự khác biệt so với các phương pháp mã hóa khác.",
    tags: ["Bảo mật"],
    dateLabel: "2026",
    readTimeLabel: "10 phút ",
    coverImage: blog4,
    sections: [
      {
        heading: "Mã hóa đầu cuối là gì?",
        paragraphs: [
          "Mã hóa đầu cuối (End-to-End Encryption - E2EE) là một phương pháp giao tiếp an toàn, đảm bảo chỉ người gửi và người nhận dự định mới có thể đọc được nội dung. Nó ngăn chặn các bên thứ ba, bao gồm cả nhà cung cấp dịch vụ Internet và nhà cung cấp ứng dụng, truy cập vào dữ liệu được mã hóa.",
          "Nói một cách đơn giản, tin nhắn của bạn được khóa lại (mã hóa) trên thiết bị của bạn và chỉ có thể được mở khóa (giải mã) bởi thiết bị của người nhận.",
        ],
      },
      {
        heading: "Cách hoạt động của E2EE",
        paragraphs: [
          "E2EE sử dụng một kỹ thuật gọi là mã hóa khóa công khai (public-key cryptography). Mỗi người dùng có một cặp khóa: một public key và một private key.",
          "Khi bạn gửi tin nhắn, nó được mã hóa bằng public key của người nhận. Public key này có thể được chia sẻ công khai. Sau khi được mã hóa, tin nhắn chỉ có thể được giải mã bằng private key tương ứng, và private key này chỉ có người nhận mới sở hữu. Điều này đảm bảo rằng không ai ở giữa có thể đọc được tin nhắn.",
        ],
      },
      {
        heading: "So sánh với mã hóa tầng giao vận (TLS)",
        paragraphs: [
          "Nhiều dịch vụ không sử dụng E2EE mà thay vào đó là mã hóa tầng giao vận (Transport Layer Security - TLS). Với TLS, dữ liệu được mã hóa giữa thiết bị của bạn và máy chủ của nhà cung cấp dịch vụ. Tại máy chủ, dữ liệu được giải mã, xử lý, sau đó được mã hóa lại và gửi đến người nhận.",
          "Sự khác biệt chính là nhà cung cấp dịch vụ có thể truy cập nội dung tin nhắn của bạn trên máy chủ của họ. Với E2EE, họ không thể làm điều này.",
        ],
      },
      {
        heading: "Ưu điểm của mã hóa đầu cuối",
        paragraphs: [],
        bullets: [
          "Bảo vệ quyền riêng tư tối đa: Chỉ người gửi và người nhận mới đọc được nội dung.",
          "Chống nghe lén: Ngăn chặn tin tặc, chính phủ và cả nhà cung cấp dịch vụ xem trộm tin nhắn.",
          "Đảm bảo tính toàn vẹn của dữ liệu: Bảo vệ chống lại việc giả mạo hoặc thay đổi nội dung tin nhắn.",
        ],
      },
      {
        heading: "Nhược điểm và hạn chế",
        paragraphs: [],
        bullets: [
          "Không bảo vệ metadata: E2EE không che giấu thông tin về việc ai đang giao tiếp với ai và vào thời điểm nào.",
          "Điểm cuối dễ bị tấn công: Nếu thiết bị của người gửi hoặc người nhận bị xâm nhập, kẻ tấn công có thể đọc được tin nhắn trước khi mã hóa hoặc sau khi giải mã.",
          "Khó khăn trong việc khôi phục dữ liệu: Nếu bạn mất private key, bạn sẽ không thể giải mã các tin nhắn cũ.",
        ],
      },
    ],
  },
];

export function findStoreBlogPostById(id: string | undefined): BlogPost | null {

  if (!id) {
    return null;
  }

  const foundPost = storeBlogPosts.find((post) => post.id === id);
  if (foundPost) {
    return foundPost;
  }
  return null;
}
