# React Native Theory

## 3. FlatList: keyExtractor và tối ưu danh sách

### 1. Sơ lược

Ở bài trước, `FlatList` được dùng để render danh sách dài hiệu quả hơn `ScrollView` nhờ virtualization. Tuy nhiên, chỉ dùng `FlatList` chưa có nghĩa là danh sách đã tối ưu hoàn toàn.

Khi làm việc với danh sách, cần chú ý hai nhóm vấn đề:

- `keyExtractor`: giúp React Native nhận diện từng item ổn định.
- Tối ưu render item: hạn chế những lần render lại không cần thiết.

### 2. keyExtractor là gì?

`keyExtractor` là một prop của `FlatList`, dùng để lấy ra một key duy nhất và ổn định cho mỗi item.

```jsx
import { FlatList, Text } from "react-native";

const users = [
  { id: "1", name: "Nhat" },
  { id: "2", name: "Duy" },
  { id: "3", name: "Giap" },
];

export default function UserScreen() {
  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

Trong ví dụ trên:

- `data`: danh sách user cần hiển thị.
- `keyExtractor`: lấy `id` làm key cho từng user.
- `renderItem`: tạo UI cho từng user.

### 3. Tại sao key quan trọng?

Khi danh sách thay đổi, React cần biết item nào:

- Được thêm vào.
- Bị xóa đi.
- Được cập nhật.
- Vẫn giữ nguyên.
- Bị thay đổi vị trí.

Key giúp React đối chiếu item cũ và item mới chính xác hơn. Nếu key không ổn định, React có thể tái sử dụng sai component, gây lỗi UI hoặc state.

Ví dụ khi thêm item mới vào đầu danh sách:

```txt
Trước:
index 0 -> Nhat
index 1 -> Duy
index 2 -> Giap

Sau khi thêm Minh vào đầu:
index 0 -> Minh
index 1 -> Nhat
index 2 -> Duy
index 3 -> Giap
```

Nếu dùng index làm key, key của `Nhat`, `Duy`, `Giap` đều bị thay đổi. React có thể hiểu nhầm item cũ là item mới.

### 4. Có nên dùng index làm key không?

Nên ưu tiên dùng `id` ổn định từ dữ liệu.

Nên dùng:

```jsx
keyExtractor={(item) => item.id}
```

Không khuyến khích với danh sách có thể thay đổi:

```jsx
keyExtractor={(_, index) => index.toString()}
```

Chỉ cân nhắc dùng index khi danh sách thật sự tĩnh:

- Không thêm item.
- Không xóa item.
- Không sắp xếp lại item.
- Không filter làm thay đổi thứ tự item.

Trong thực tế, danh sách user, sản phẩm, comment, notification, chat message gần như luôn nên có `id`.

### 5. Các cách tối ưu FlatList

| Kỹ thuật              | Tác dụng                                         | Khi nên dùng                                     |
| --------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `keyExtractor`        | Giúp nhận diện item ổn định                      | Gần như luôn cần                                 |
| `React.memo`          | Tránh render lại item khi props không đổi        | Item phức tạp hoặc danh sách dài                 |
| `useCallback`         | Giữ reference của `renderItem` ổn định           | Khi truyền function xuống `FlatList` hoặc item   |
| `getItemLayout`       | Bỏ qua bước đo layout động                       | Khi item có chiều cao cố định                    |
| `initialNumToRender`  | Điều chỉnh số item render ban đầu                | Khi cần cân bằng tốc độ mở màn hình và độ đầy UI |
| `ListHeaderComponent` | Render header mà không cần bọc bằng `ScrollView` | Khi danh sách có phần đầu                        |
| `ListEmptyComponent`  | Hiển thị UI khi danh sách rỗng                   | Khi data có thể rỗng                             |

Điểm cần nhớ: `keyExtractor` không tự ngăn re-render. Nó chỉ giúp React nhận diện item chính xác. Muốn giảm render không cần thiết, cần kết hợp thêm các kỹ thuật như `React.memo`, `useCallback` hoặc tối ưu props truyền vào item.

### 6. Ví dụ tối ưu FlatList

```jsx
import React, { memo, useCallback } from "react";
import { FlatList, Text } from "react-native";

const users = [
  { id: "1", name: "Nhat" },
  { id: "2", name: "Duy" },
  { id: "3", name: "Giap" },
];

const ITEM_HEIGHT = 50;

const UserItem = memo(function UserItem({ name }) {
  return <Text style={{ height: ITEM_HEIGHT }}>{name}</Text>;
});

export default function UserScreen() {
  const renderItem = useCallback(({ item }) => {
    return <UserItem name={item.name} />;
  }, []);

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      initialNumToRender={8}
    />
  );
}
```

Giải thích:

- `memo(UserItem)`: bỏ qua render lại nếu props của `UserItem` không đổi.
- `useCallback`: tránh tạo function `renderItem` mới sau mỗi lần component cha render.
- `keyExtractor`: dùng `id` ổn định làm key.
- `getItemLayout`: vì mỗi item cao cố định `50`, `FlatList` tính được vị trí item mà không cần đo layout động.
- `initialNumToRender`: quy định số item render trong lần đầu.

### 7. Khi nào không cần tối ưu quá sớm?

Không phải danh sách nào cũng cần `React.memo`, `useCallback` hoặc `getItemLayout`.

Với danh sách ngắn, item đơn giản, không có lag khi cuộn, code đơn giản thường quan trọng hơn tối ưu sớm.

Nên tối ưu khi:

- Danh sách dài.
- Item có UI phức tạp.
- Màn hình re-render thường xuyên.
- Khi cuộn bị giật.
- Có thao tác thêm, xóa, filter, sort dữ liệu.

### 8. Lỗi và hiểu nhầm thường gặp

| Lỗi hoặc hiểu nhầm                                   | Cách hiểu đúng                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Dùng index làm key cho danh sách thay đổi            | Nên dùng `id` ổn định                                                     |
| Nghĩ `keyExtractor` giúp item không re-render        | Key chỉ giúp nhận diện item, không tự chặn re-render                      |
| Nghĩ `FlatList` tự tối ưu mọi thứ                    | Virtualization chỉ là một phần, item vẫn có thể re-render không cần thiết |
| Dùng `getItemLayout` với item cao thấp khác nhau     | Offset có thể sai nếu chiều cao item không cố định                        |
| Đặt `initialNumToRender` quá thấp                    | Màn hình ban đầu có thể bị trống                                          |
| Tạo object/function mới liên tục rồi truyền vào item | Có thể làm `memo` mất tác dụng                                            |

### 9. File example

File example cho phần này:

```txt
ReactNative/Example/keyextractor-optimizelist.jsx
```

Có thể copy component `App` trong file example vào project React Native hoặc Expo để chạy thử.

### 10. Câu hỏi thường gặp

1. Mục đích của `keyExtractor` trong `FlatList` là gì?
   - `keyExtractor` cung cấp key duy nhất và ổn định cho từng item, giúp React Native nhận diện item khi danh sách thay đổi.
2. Tại sao nên tránh dùng array index làm key?
   - Index có thể thay đổi khi thêm, xóa, filter hoặc sắp xếp lại danh sách. Điều này có thể khiến React tái sử dụng sai component.
3. `keyExtractor` có giúp giảm re-render không?
   - Không trực tiếp. Nó giúp định danh item chính xác. Để giảm re-render, có thể dùng `React.memo`, `useCallback` và tối ưu props.
4. `getItemLayout` dùng để làm gì?
   - `getItemLayout` giúp `FlatList` biết trước kích thước và vị trí item, tránh phải đo layout động. Nó phù hợp khi item có chiều cao cố định.
5. Khi nào nên dùng `React.memo` cho item?
   - Khi item có UI phức tạp, danh sách dài hoặc component cha re-render thường xuyên nhưng props của item không đổi.
