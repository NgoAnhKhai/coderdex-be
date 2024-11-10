const fs = require("fs");

// Đọc tệp db.json
const data = JSON.parse(fs.readFileSync("db.json", "utf8"));

// Duyệt qua từng Pokémon và gộp `type1` và `type2` thành `types`
data.forEach((pokemon) => {
  // Tạo mảng `types` và thêm `type1` và `type2` nếu có
  pokemon.types = [];
  if (pokemon.type1) pokemon.types.push(pokemon.type1);
  if (pokemon.type2) pokemon.types.push(pokemon.type2);

  // Xóa `type1` và `type2`
  delete pokemon.type1;
  delete pokemon.type2;
});

// Ghi lại tệp db.json với cấu trúc mới
fs.writeFileSync("db.json", JSON.stringify(data, null, 2), "utf8");

console.log("Updated db.json successfully!");
