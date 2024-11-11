const fs = require("fs");

const data = JSON.parse(fs.readFileSync("db.json", "utf8"));

data.forEach((pokemon) => {
  pokemon.types = [];
  if (pokemon.type1) pokemon.types.push(pokemon.type1);
  if (pokemon.type2) pokemon.types.push(pokemon.type2);

  delete pokemon.type1;
  delete pokemon.type2;
});

fs.writeFileSync("db.json", JSON.stringify(data, null, 2), "utf8");

console.log("Updated db.json successfully!");
