# React Native Theory

## 10. Android vs iOS khác nhau cơ bản

### 1. Android và iOS khác nhau như thế nào?

React Native cho phép chia sẻ phần lớn code JavaScript/TypeScript giữa Android và iOS. Tuy nhiên, hai hệ điều hành vẫn khác nhau về UI convention, navigation behavior, permission, build tool và native API.

| Tiêu chí | Android | iOS |
| --- | --- | --- |
| Native language | Kotlin / Java | Swift / Objective-C |
| Build tools | Android Studio, Gradle | Xcode |
| Cấu hình permission | `AndroidManifest.xml` | `Info.plist` |
| Navigation | Có system Back button | Thường dùng Back trên UI hoặc gesture |
| UI convention | Material Design phổ biến | Apple Human Interface Guidelines |
| App package | APK / AAB | IPA |
| Store | Google Play hoặc store khác | App Store |

Điểm cần nhớ: React Native không tự động khiến giao diện và mọi hành vi giống hệt nhau trên hai nền tảng. Developer vẫn cần test trên cả Android và iOS.

### 2. Ví dụ thực tế

Một màn hình `ProductDetail` có thể dùng chung code React Native, nhưng hành vi có thể khác:

- Android: người dùng có thể dùng nút Back của hệ thống để quay lại.
- iOS: người dùng thường dùng nút Back trên navigation header hoặc gesture vuốt, tùy cấu hình navigator.

Một nút `Login` cũng có thể cần màu sắc, shadow hoặc spacing hơi khác để hợp với convention từng nền tảng.

Minh họa:

![Android vs iOS](./Image/android-ios.png)

### 3. Platform.OS

React Native cung cấp API `Platform` để kiểm tra app đang chạy trên nền tảng nào.

```jsx
import { Platform } from "react-native";

console.log(Platform.OS);
```

Kết quả:

```txt
Android -> "android"
iOS     -> "ios"
```

Lưu ý: giá trị là chữ thường, không phải `"Android"`, `"IOS"` hoặc `"iOS"`.

Ví dụ:

```jsx
import { Platform, Text, View } from "react-native";

export default function HomeScreen() {
  const isIOS = Platform.OS === "ios";

  return (
    <View>
      <Text>{isIOS ? "Running on iOS" : "Running on Android"}</Text>
    </View>
  );
}
```

Giải thích:

- `Platform.OS`: xác định hệ điều hành hiện tại.
- `isIOS`: boolean dùng cho conditional rendering.
- UI có thể thay đổi theo nền tảng.

### 4. Platform.select()

`Platform.select()` dùng để chọn giá trị phù hợp theo nền tảng hiện tại.

Ví dụ style button khác nhau giữa Android và iOS:

```jsx
import { Platform, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.button}>
      <Text style={styles.buttonText}>Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        backgroundColor: "#007aff",
      },
      android: {
        backgroundColor: "#4caf50",
        elevation: 3,
      },
      default: {
        backgroundColor: "#2563eb",
      },
    }),
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
  },
});
```

Phân biệt nhanh:

| API | Cách dùng |
| --- | --- |
| `Platform.OS` | Kiểm tra hệ điều hành, thường dùng trong `if` hoặc ternary |
| `Platform.select()` | Chọn value/style/config theo từng platform |

`Platform.select()` không chỉ dùng cho style. Nó có thể dùng cho text, config, animation duration, icon name hoặc giá trị bất kỳ.

### 5. Một số khác biệt thường gặp trong UI

| Chủ đề | Android | iOS |
| --- | --- | --- |
| Shadow | Thường dùng `elevation` | Dùng `shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset` |
| Back behavior | Có nút Back hệ thống | Không có nút Back hệ thống |
| Status bar | Cần chú ý màu status bar trên nhiều phiên bản | Cần chú ý safe area/notch |
| Picker/Date input | Native control có style Android | Native control có style iOS |
| Keyboard | Hành vi resize/pan khác nhau theo config | Thường cần xử lý keyboard tránh che input |
| Permission wording | Khai báo trong manifest/app config | Cần usage description rõ ràng |

Ví dụ shadow cross-platform:

```jsx
card: {
  backgroundColor: "#ffffff",
  borderRadius: 8,
  padding: 16,
  ...Platform.select({
    android: {
      elevation: 4,
    },
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
    },
  }),
}
```

### 6. Khi nào cần tách code Android và iOS?

Nếu khác biệt chỉ nằm ở một vài dòng style hoặc logic, nên dùng `Platform.OS` hoặc `Platform.select()`.

Khi component có logic hoặc UI khác nhau đáng kể, có thể dùng platform-specific files.

Ví dụ:

```txt
components/
├── CustomButton.android.jsx
└── CustomButton.ios.jsx
```

Sau đó import bình thường:

```jsx
import CustomButton from "./components/CustomButton";
```

React Native sẽ tự chọn file phù hợp với hệ điều hành đang chạy.

Không cần tách mọi component thành hai file. Chỉ nên tách khi khác biệt đủ lớn để code chung trở nên khó đọc hoặc khó maintain.

### 7. Platform-specific file thường dùng cho gì?

Một vài trường hợp nên cân nhắc tách file:

- Native module wrapper khác nhau giữa Android và iOS.
- UI component có behavior rất khác nhau.
- Animation hoặc gesture cần config riêng.
- Permission flow khác biệt nhiều.
- Code liên quan đến file system, bluetooth, map hoặc payment.

Ví dụ:

```txt
services/
├── permission.android.js
└── permission.ios.js
```

### 8. Những lỗi và hiểu nhầm thường gặp

| Hiểu nhầm | Cách hiểu đúng |
| --- | --- |
| `Platform.OS === "iOS"` | Giá trị đúng là `"ios"` |
| React Native chạy giống hệt trên hai OS | Có thể khác về UI, navigation, permission và native API |
| Chỉ cần test Android là đủ | Nên test cả Android và iOS |
| Mọi native API đều dùng chung | Một số API chỉ có trên một nền tảng |
| Luôn phải viết hai bộ code | Có thể chia sẻ phần lớn code, chỉ xử lý riêng khi cần |
| Dùng `elevation` và nghĩ iOS cũng có shadow | `elevation` chủ yếu dành cho Android |
| Quên safe area trên iOS | Màn hình có notch/home indicator cần được xử lý đúng |

Một ví dụ thực tế: `PermissionsAndroid` chỉ phục vụ permission của Android. Phần xin quyền trên iOS sử dụng API/cấu hình riêng hoặc thư viện hỗ trợ đa nền tảng.

### 9. File example

File example cho phần này:

```txt
ReactNative/Example/androidvsios.jsx
```

Có thể copy component `App` trong file example vào project React Native hoặc Expo để chạy thử.

### 10. Câu hỏi thường gặp

1. Sự khác biệt chính giữa phát triển Android và iOS trong React Native là gì?
   - React Native cho phép chia sẻ nhiều code JavaScript/TypeScript, nhưng vẫn khác nhau về native API, permission, navigation behavior, UI convention và build tool.
2. `Platform.OS` là gì?
   - `Platform.OS` cho biết hệ điều hành hiện tại. Nó trả về `"android"` trên Android và `"ios"` trên iOS.
3. Sự khác nhau giữa `Platform.OS` và `Platform.select()` là gì?
   - `Platform.OS` dùng để kiểm tra platform hiện tại. `Platform.select()` dùng để chọn giá trị tương ứng theo platform.
4. Làm thế nào để tạo component riêng cho Android và iOS?
   - Dùng file extension theo platform như `.android.jsx` và `.ios.jsx`. Khi import không cần ghi extension, React Native tự chọn file phù hợp.
5. Có nên tách code Android/iOS ngay từ đầu không?
   - Không nên tách sớm nếu khác biệt nhỏ. Hãy dùng code chung trước, chỉ tách file khi khác biệt nhiều và làm code chung khó maintain.
