import "./styles.css";
import texture from "../bricola/index";

const loadImage = (path) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = path;
  });

const pickRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const drawTexture = async ({
  ctx,
  ctxb,
  texture,
  mx,
  my,
  gap = 2,
  offsetRatio = 0.5,
  bumpBrightness = 150,
  bumpContrast = 200,
  texBrightness = 100,
  texContrast = 100,
  texSaturate = 100
}) => {
  const tw = texture.width;
  const th = texture.height;

  const cw = mx * (tw + gap);
  const ch = my * (th + gap);

  const offset = tw <= th ? th * offsetRatio : tw * offsetRatio;

  ctx.canvas.width = cw;
  ctx.canvas.height = ch;
  ctx.filter = `brightness(${texBrightness}%) contrast(${texContrast}%) saturate(${texSaturate}%)`;
  ctx.fillStyle = texture.gapColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctxb.canvas.width = cw;
  ctxb.canvas.height = ch;
  ctxb.filter = `grayscale(100%) brightness(${bumpBrightness}%) contrast(${bumpContrast}%)`;
  ctxb.fillStyle = "black";
  ctxb.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const images = await Promise.all(texture.paths.map(loadImage));

  const addOffset = (i) => (i % 2 ? offset : 0);

  const generateMatrixV = () => {
    const generateRow = (y) =>
      Array(mx)
        .fill(0)
        .map((e, i) => ({
          img: pickRandomElement(images),
          x: i * (tw + gap),
          y: y + addOffset(i)
        }));

    const generateMatrix = () =>
      Array(my + 1)
        .fill(0)
        .map((e, i) => generateRow((i - 1) * (th + gap)));

    const correctRowZero = (matrix) => {
      const lastRow = matrix[matrix.length - 1];
      const rowZero = matrix[0].map(({ img, x, y }, i) => ({
        img: lastRow[i].img,
        x,
        y
      }));
      return [rowZero, ...matrix.slice(1)];
    };

    return correctRowZero(generateMatrix());
  };

  const generateMatrixH = () => {
    const generateRow = (y, xOffset) =>
      Array(mx + 1)
        .fill(0)
        .map((e, i) => ({
          img: pickRandomElement(images),
          x: (i - 1) * (tw + gap) + xOffset,
          y: y
        }));

    const generateMatrix = () =>
      Array(my)
        .fill(0)
        .map((e, i) => generateRow(i * (th + gap), addOffset(i)));

    const correctColumnZero = (matrix) =>
      matrix.map((r, i) =>
        i % 2
          ? [
              {
                img: r[r.length - 1].img,
                x: r[0].x,
                y: r[0].y
              },
              ...r.slice(1)
            ]
          : r
      );

    return correctColumnZero(generateMatrix());
  };

  const drawMatrix = (ctx, matrix) =>
    matrix.map((r) =>
      r.map(({ img, x, y }) => ctx.drawImage(img, x, y, tw, th))
    );

  const textureMatrix = tw <= th ? generateMatrixV() : generateMatrixH();

  drawMatrix(ctx, textureMatrix);
  drawMatrix(ctxb, textureMatrix);
};

const c = document.getElementById("texture");
const ctx = c.getContext("2d");

const cb = document.getElementById("bump");
const ctxb = cb.getContext("2d");

drawTexture({
  ctx,
  ctxb,
  texture,
  mx: 2, // columns
  my: 10, // rows
  gap: 2,
  offsetRatio: 0.25,
  bumpBrightness: 150,
  bumpContrast: 200,
  texBrightness: 110,
  texContrast: 130,
  texSaturate: 110
});
