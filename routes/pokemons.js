var express = require("express");
const fs = require("fs");
const path = require("path");
var router = express.Router();

const rawData = fs.readFileSync("./db.json", "utf-8");
const pokemons = JSON.parse(rawData);

/* GET users listing with pagination and filtering. */
router.get("/", function (req, res, next) {
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
    pokemon: {
      id: currentPokemon.id,
      name: currentPokemon.name,
      types: currentPokemon.types,
      url: `/images/${currentPokemon.id}.png`,
    },
    previousPokemon: previousPokemon
      ? {
          id: previousPokemon.id,
          name: previousPokemon.name,
          types: previousPokemon.types,
          url: `/images/${previousPokemon.id}.png`,
        }
      : null,
    nextPokemon: nextPokemon
      ? {
          id: nextPokemon.id,
          name: nextPokemon.name,
          types: nextPokemon.types,
          url: `/images/${nextPokemon.id}.png`,
        }
      : null,
  });
});

module.exports = router;
