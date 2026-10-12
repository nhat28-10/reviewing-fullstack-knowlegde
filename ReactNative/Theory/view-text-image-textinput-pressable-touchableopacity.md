# React Native Theory

## 1. View, Text, Image, TextInput, Pressable / TouchableOpacity

### 1. Sơ lược

Nếu đã học ReactJS, React Native sẽ khá dễ tiếp cận vì vẫn dùng các khái niệm quen thuộc như `component`, `props`, `state` và `hooks`.

Điểm khác biệt lớn nhất là React Native không render ra HTML DOM. Thay vào đó, React Native dùng các component giao diện riêng và ánh xạ chúng sang UI native của iOS/Android.

| React Native       | Mục đích                                           | Tương tự trong ReactJS |
| ------------------ | -------------------------------------------------- | ---------------------- |
| `View`             | Container để chứa và bố trí các component khác     | `div`, `section`       |
| `Text`             | Hiển thị văn bản                                   | `p`, `span`, `h1`      |
| `Image`            | Hiển thị hình ảnh local hoặc từ URL                | `img`                  |
| `TextInput`        | Nhận dữ liệu người dùng nhập                       | `input`, `textarea`    |
| `Pressable`        | Xử lý thao tác nhấn với nhiều trạng thái linh hoạt | `button` có event      |
| `TouchableOpacity` | Xử lý nhấn và tự giảm opacity khi được nhấn        | `button` có hiệu ứng   |

Các component trên chỉ tương đương về mục đích sử dụng, không phải cùng một loại phần tử với HTML.

### 2. View

`View` là component dùng để tạo layout và nhóm các component con.

```jsx
<View>
  <Text>Hello React Native</Text>
</View>
```

Một vài điểm cần nhớ:

- `View` không dùng để hiển thị text trực tiếp.
- Text trong React Native phải được đặt trong component `Text`.
- `View` thường được style bằng Flexbox.

Sai:

```jsx
<View>Hello</View>
```

Đúng:

```jsx
<View>
  <Text>Hello</Text>
</View>
```

### 3. Text

`Text` dùng để hiển thị nội dung văn bản.

```jsx
<Text>Xin chào React Native</Text>
```

Có thể lồng `Text` bên trong `Text` để style từng đoạn nhỏ:

```jsx
<Text>
  Xin chào <Text style={{ fontWeight: "700" }}>Nhat</Text>
</Text>
```

Trong React Native, không nên dùng thẻ HTML như `<p>`, `<span>`, `<h1>`.

### 4. Image

`Image` dùng để hiển thị hình ảnh.

Với ảnh từ URL, thường dùng `source={{ uri: "..." }}`:

```jsx
<Image
  source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
  style={{ width: 64, height: 64 }}
/>
```

Với ảnh local, thường dùng `require`:

```jsx
<Image source={require("./assets/avatar.png")} />
```

Điểm quan trọng: ảnh từ URL cần có kích thước rõ ràng, ví dụ `width` và `height`, nếu không ảnh có thể không hiển thị như mong đợi.

### 5. TextInput

`TextInput` dùng để nhận dữ liệu nhập từ người dùng.

```jsx
const [name, setName] = useState("");

<TextInput
  value={name}
  onChangeText={setName}
  placeholder="Nhập tên của bạn"
/>;
```

Khác với ReactJS:

```jsx
// ReactJS
onChange={(event) => setName(event.target.value)}
```

Trong React Native, `onChangeText` nhận trực tiếp chuỗi mới:

```jsx
// React Native
onChangeText={(text) => setName(text)}
```

Có thể viết ngắn hơn:

```jsx
onChangeText = { setName };
```

### 6. Pressable

`Pressable` là component linh hoạt để xử lý thao tác nhấn.

```jsx
<Pressable onPress={() => console.log("Pressed")}>
  <Text>Nhấn tôi</Text>
</Pressable>
```

`Pressable` hỗ trợ nhiều event:

- `onPress`: chạy khi người dùng nhấn.
- `onLongPress`: chạy khi người dùng nhấn giữ.
- `onPressIn`: chạy khi bắt đầu nhấn.
- `onPressOut`: chạy khi thả tay ra.

`Pressable` cũng có thể thay đổi style dựa trên trạng thái đang nhấn:

```jsx
<Pressable
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
>
  <Text>Pressable button</Text>
</Pressable>
```

### 7. TouchableOpacity

`TouchableOpacity` cũng dùng để xử lý thao tác nhấn, nhưng đơn giản hơn `Pressable`.

```jsx
<TouchableOpacity activeOpacity={0.6} onPress={() => console.log("Pressed")}>
  <Text>TouchableOpacity button</Text>
</TouchableOpacity>
```

Khi người dùng nhấn, component sẽ tự giảm opacity để tạo phản hồi trực quan.

### 8. Pressable vs TouchableOpacity

| Tiêu chí         | Pressable                       | TouchableOpacity                       |
| ---------------- | ------------------------------- | -------------------------------------- |
| Mức độ linh hoạt | Cao hơn                         | Đơn giản hơn                           |
| Trạng thái nhấn  | Có thể tùy chỉnh bằng `pressed` | Tự giảm opacity                        |
| Event hỗ trợ     | Nhiều event hơn                 | Chủ yếu dùng `onPress`                 |
| Khi nên dùng     | UI cần phản hồi nhấn phức tạp   | Button đơn giản, cần hiệu ứng mờ nhanh |

Với code mới, có thể ưu tiên `Pressable` khi cần kiểm soát trạng thái tương tác rõ hơn. `TouchableOpacity` vẫn phù hợp cho các button đơn giản.

### 9. Ví dụ thực tế

Ví dụ màn hình chào người dùng:

```jsx
import React, { useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  return (
    <View style={{ padding: 20 }}>
      <Image
        source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
        style={{ width: 60, height: 60 }}
      />

      <Text>Nhập tên của bạn</Text>

      <TextInput value={name} onChangeText={setName} placeholder="Họ và tên" />

      <Pressable onPress={() => setMessage(`Xin chào, ${name}!`)}>
        <Text>Chào bằng Pressable</Text>
      </Pressable>

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => setMessage("Đã nhấn nút thứ hai")}
      >
        <Text>Chào bằng TouchableOpacity</Text>
      </TouchableOpacity>

      <Text>{message}</Text>
    </View>
  );
}
```

Luồng hoạt động:

```txt
Người dùng nhập tên vào TextInput
        ↓
onChangeText gọi setName
        ↓
State name cập nhật
        ↓
Component re-render
        ↓
Người dùng nhấn Pressable hoặc TouchableOpacity
        ↓
setMessage cập nhật message
        ↓
Text hiển thị lời nhắn mới
```

### 10. Lỗi thường gặp

| Lỗi                                       | Cách hiểu đúng                                    |
| ----------------------------------------- | ------------------------------------------------- |
| `<View>Hello</View>`                      | Văn bản phải nằm trong `<Text>`                   |
| `<Image source="url" />`                  | Ảnh URL cần dùng `source={{ uri: "url" }}`        |
| Ảnh từ URL không hiển thị                 | Cần khai báo `width` và `height`                  |
| Dùng `onClick` cho `Pressable`            | React Native dùng `onPress`                       |
| Dùng `event.target.value` với `TextInput` | `onChangeText` nhận trực tiếp chuỗi mới           |
| Quên style cho `TextInput`                | Input có thể khó nhìn nếu không có border/padding |

### 11. File example

File example cho phần này:

```txt
ReactNative/Example/view-text-image-textinput-pressable-touchableopacity.jsx
```

Có thể copy component `App` trong file example vào project React Native hoặc Expo để chạy thử.

### 12. Câu hỏi thường gặp

1. Sự khác nhau giữa `View` và `Text` trong React Native là gì?
   - `View` là container dùng để xây layout. `Text` dùng để hiển thị nội dung văn bản. Văn bản không nên đặt trực tiếp trong `View`.
2. Vì sao ảnh từ URL cần có `width` và `height`?
   - React Native cần biết kích thước để bố trí ảnh trên màn hình. Nếu không có kích thước rõ ràng, ảnh có thể không hiển thị.
3. `TextInput` lấy giá trị người dùng nhập như thế nào?
   - Dùng `value` kết hợp với `onChangeText`. `onChangeText` nhận trực tiếp chuỗi mới và thường được dùng để cập nhật state.
4. Sự khác nhau giữa `Pressable` và `TouchableOpacity` là gì?
   - `Pressable` linh hoạt hơn và cho phép tùy chỉnh UI theo trạng thái nhấn. `TouchableOpacity` đơn giản hơn và tự giảm opacity khi người dùng nhấn.
5. Khi nào nên dùng `Pressable`?
   - Dùng `Pressable` khi cần xử lý nhiều trạng thái tương tác như nhấn, nhấn giữ, nhấn vào, thả ra hoặc cần style riêng khi button đang được nhấn.
