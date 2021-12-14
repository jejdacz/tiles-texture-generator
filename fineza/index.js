const paths = Array(15)
  .fill(0)
  .map((e, i) => `/fineza/${i.toString().padStart(3, "0")}.jpg`);

const width = 1200;
const height = 200;

const gapColor = "#d69d70";
const name = "fineza-bricola-miel-20x120";

export default { paths, gapColor, width, height, name };
