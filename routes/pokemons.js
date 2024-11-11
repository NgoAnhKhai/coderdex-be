var express = require("express");
const fs = require("fs");
const path = require("path");
var router = express.Router();

const rawData = fs.readFileSync("./db.json", "utf-8");
const pokemons = JSON.parse(rawData);

/* GET users listing with pagination and filtering. */
router.get("/", function (req, res) {
  let { page, limit, search, type } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // Lọc theo tên nếu có query parameter 'search'
  let filteredPokemons = pokemons;
  if (search) {
    filteredPokemons = filteredPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Lọc theo loại nếu có query parameter 'type'
  if (type) {
    filteredPokemons = filteredPokemons.filter(
      (pokemon) => Array.isArray(pokemon.types) && pokemon.types.includes(type)
    );
  }

  // Phân trang dữ liệu
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedPokemons = filteredPokemons.slice(startIndex, endIndex);

  // Trả về kết quả
  res.json({
    total: filteredPokemons.length,
    page: page,
    limit: limit,
    data: paginatedPokemons,
  });
});

/* GET single Pokémon by ID with previous and next info */
router.get("/:id", function (req, res, next) {
  const pokemonId = parseInt(req.params.id);

  // Tìm Pokémon hiện tại
  const currentPokemon = pokemons.find((pokemon) => pokemon.id === pokemonId);

  if (!currentPokemon) {
    return res.status(404).json({ message: "Pokémon not found" });
  }

  // Tìm Pokémon trước và sau
  const previousPokemonId =
    pokemonId > 1 ? pokemonId - 1 : pokemons[pokemons.length - 1].id;
  const nextPokemonId =
    pokemonId < pokemons.length ? pokemonId + 1 : pokemons[0].id;

  const previousPokemon = pokemons.find(
    (pokemon) => pokemon.id === previousPokemonId
  );
  const nextPokemon = pokemons.find((pokemon) => pokemon.id === nextPokemonId);

  // Trả về dữ liệu
  res.json({
    data: {
      pokemon: {
        id: currentPokemon.id,
        name: currentPokemon.name,
        types: currentPokemon.types,
        total: currentPokemon.total,
        hp: currentPokemon.hp,
        attack: currentPokemon.attack,
        defense: currentPokemon.defense,
        url: `http://localhost:3000/images/${currentPokemon.id}.png`,
      },
      previousPokemon: previousPokemon
        ? {
            id: previousPokemon.id,
            name: previousPokemon.name,
            types: previousPokemon.types,
            total: previousPokemon.total,
            hp: previousPokemon.hp,
            attack: previousPokemon.attack,
            defense: previousPokemon.defense,
            url: `http://localhost:3000/images/${previousPokemon.id}.png`,
          }
        : null,
      nextPokemon: nextPokemon
        ? {
            id: nextPokemon.id,
            name: nextPokemon.name,
            types: nextPokemon.types,
            total: nextPokemon.total,
            hp: nextPokemon.hp,
            attack: nextPokemon.attack,
            defense: nextPokemon.defense,
            url: `http://localhost:3000/images/${nextPokemon.id}.png`,
          }
        : null,
    },
  });
});
// Các loại Pokémon hợp lệ
const validPokemonTypes = [
  "Grass",
  "Fire",
  "Water",
  "Electric",
  "Normal",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dark",
  "Dragon",
  "Steel",
  "Fairy",
];

// Tạo Pokémon mới
router.post("/", (req, res) => {
  const { id, name, types, url } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!id || !name || !types || !url) {
    return res
      .status(400)
      .json({ error: "Thiếu dữ liệu bắt buộc. (name, id, types hoặc URL)" });
  }

  // Kiểm tra nếu Pokémon đã tồn tại
  const existingPokemon = pokemons.find(
    (pokemon) => pokemon.id === id || pokemon.name === name
  );
  if (existingPokemon) {
    return res.status(400).json({ error: "Pokémon này tồn tại." });
  }

  // Kiểm tra số lượng loại (chỉ được có 1 hoặc 2 loại)
  if (!Array.isArray(types) || types.length === 0 || types.length > 2) {
    return res
      .status(400)
      .json({ error: "Pokémon chỉ có thể có một hoặc hai loại." });
  }

  // Kiểm tra loại hợp lệ
  for (const type of types) {
    if (!validPokemonTypes.includes(type)) {
      return res
        .status(400)
        .json({ error: `Loại Pokémon không hợp lệ: ${type}.` });
    }
  }

  // Thêm Pokémon mới vào danh sách
  const newPokemon = { id, name, types, url };
  pokemons.push(newPokemon);

  // Lưu lại db.json với Pokémon mới
  fs.writeFileSync("./db.json", JSON.stringify(pokemons, null, 2));

  res
    .status(201)
    .json({ message: "Pokémon đã được thêm thành công.", pokemon: newPokemon });
});

router.put("/:id", (req, res) => {
  const pokemonId = parseInt(req.params.id);
  const updatedData = req.body;

  // Kiểm tra Pokémon có tồn tại không
  const pokemonIndex = pokemons.findIndex(
    (pokemon) => pokemon.id === pokemonId
  );
  if (pokemonIndex === -1) {
    return res.status(404).json({ error: "Pokémon không tồn tại." });
  }

  // Kiểm tra loại hợp lệ nếu `types` được cung cấp trong yêu cầu cập nhật
  if (updatedData.types) {
    const isValidType =
      Array.isArray(updatedData.types) &&
      updatedData.types.every((type) => validPokemonTypes.includes(type));
    if (!isValidType) {
      return res.status(400).json({ error: "Loại Pokémon không hợp lệ." });
    }
  }

  // Cập nhật dữ liệu Pokémon
  pokemons[pokemonIndex] = { ...pokemons[pokemonIndex], ...updatedData };
  fs.writeFileSync("./db.json", JSON.stringify(pokemons, null, 2));

  res.json({
    message: "Cập nhật Pokémon thành công.",
    data: pokemons[pokemonIndex],
  });
});

router.delete("/:id", (req, res) => {
  const pokemonId = parseInt(req.params.id);

  // Kiểm tra Pokémon có tồn tại không
  const pokemonIndex = pokemons.findIndex(
    (pokemon) => pokemon.id === pokemonId
  );
  if (pokemonIndex === -1) {
    return res.status(404).json({ error: "Pokémon không tồn tại." });
  }

  // Xóa Pokémon
  const deletedPokemon = pokemons.splice(pokemonIndex, 1);
  fs.writeFileSync("./db.json", JSON.stringify(pokemons, null, 2));

  res.json({ message: "Xóa Pokémon thành công.", data: deletedPokemon });
});

module.exports = router;
