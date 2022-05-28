import { Matrix } from "ml-matrix";

const putImgInTorus = (
    xImgInTorus: number,
    yImgInTorus: number,
    imgMatrix: Matrix,
    xDimensionTorus: number,
    yDimensionTorus: number
): Matrix => {
    xDimensionTorus *= 4;
    let torus = Matrix.zeros(yDimensionTorus, xDimensionTorus);

    xImgInTorus =
        xImgInTorus < 0
            ? xDimensionTorus + (xImgInTorus % xDimensionTorus)
            : xImgInTorus % xDimensionTorus;
    xImgInTorus *= 4;

    yImgInTorus =
        yImgInTorus < 0
            ? yDimensionTorus + (yImgInTorus % yDimensionTorus)
            : yImgInTorus % yDimensionTorus;

    for (
        var yTorus = yImgInTorus;
        yTorus - yImgInTorus < imgMatrix.rows;
        yTorus++
    ) {
        for (
            var xTorus = xImgInTorus;
            xTorus - xImgInTorus < imgMatrix.columns;
            xTorus += 4
        ) {
            torus.set(
                yTorus % yDimensionTorus,
                xTorus % xDimensionTorus,
                imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus)
            );
            torus.set(
                yTorus % yDimensionTorus,
                (xTorus % xDimensionTorus) + 1,
                imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus + 1)
            );
            torus.set(
                yTorus % yDimensionTorus,
                (xTorus % xDimensionTorus) + 2,
                imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus + 2)
            );
            torus.set(
                yTorus % yDimensionTorus,
                (xTorus % xDimensionTorus) + 3,
                imgMatrix.get(yTorus - yImgInTorus, xTorus - xImgInTorus + 3)
            );
        }
    }
    return torus;
};

export const useTorus = () => ({
    putImgInTorus: putImgInTorus,
});
