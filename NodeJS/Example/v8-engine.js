"use strict";

const v8 = require("node:v8");

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function showHeap(label) {
  const heap = v8.getHeapStatistics();

  console.log(`\n${label}`);
  console.log(`Heap đang dùng: ${formatBytes(heap.used_heap_size)}`);
  console.log(`Giới hạn heap: ${formatBytes(heap.heap_size_limit)}`);
}

console.log(`Node.js: ${process.version}`);
console.log(`V8: ${process.versions.v8}`);

showHeap("Trước khi tạo dữ liệu:");

let temporaryData = Array.from({ length: 100_000 }, (_, index) => ({
  id: index,
  label: `Item ${index}`,
}));

console.log(`\nĐã tạo ${temporaryData.length} object.`);
showHeap("Sau khi tạo dữ liệu:");

temporaryData = null;
console.log("\nĐã bỏ tham chiếu đến dữ liệu tạm.");

if (global.gc) {
  global.gc();
  showHeap("Sau khi yêu cầu GC:");
} else {
  console.log("Chạy với --expose-gc để yêu cầu GC minh hoạ: node --expose-gc NodeJS/Example/v8-engine.js");
}

// Không dựa vào thời điểm GC trong code sản phẩm; V8 quyết định khi nào GC là phù hợp.
