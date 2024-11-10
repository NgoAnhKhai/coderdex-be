const fs = require("fs");

const rawData = fs.readFileSync("db.json");
const pokemons = JSON.parse(rawData);

const updatedPokemons = pokemons.map((pokemon) => ({
  ...pokemon,
  url: `http://localhost:3000/images/${pokemon.id}.png`,
}));

fs.writeFileSync("db.json", JSON.stringify(updatedPokemons, null, 2));
console.log("Cập nhật đường dẫn ảnh thành công!");
