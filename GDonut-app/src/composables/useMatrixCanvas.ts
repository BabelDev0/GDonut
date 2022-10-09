import { Matrix } from "ml-matrix";

const uint8ClampedArrayToMatrix = (
    imgData: Uint8ClampedArray,
    imgWith: number,
    imgHeight: number
): Matrix => {
    var matrix = Matrix.from1DArray(imgHeight, imgWith * 4, imgData);
    return matrix;
};

const matrixToUint8ClampedArray = (matrix: Matrix): Uint8ClampedArray => {
    let imgData = new Uint8ClampedArray(Math.pow(matrix.rows, 2) * 4);
    matrix.to1DArray().forEach((value, index) => {
        imgData[index] = value;
    });
    return imgData;
};

const drawMatrix = (matrix: Matrix, myCanvas: HTMLCanvasElement) => {
    var imgDataToDisplay = matrixToUint8ClampedArray(matrix);
    var ctx = myCanvas.getContext("2d");
    ctx?.clearRect(0, 0, myCanvas.width, myCanvas.height);

    var imgData = ctx!.createImageData(matrix.columns / 4, matrix.rows);

    imgData.data.forEach((_, index) => {
        imgData.data[index] = imgDataToDisplay[index];
    });
    ctx!.putImageData(imgData, 0, 0);
};

const multiplyMatrix = (matrices: Matrix[]): Matrix => {
    return matrices.reduce((acc, val) => {
        return Matrix.multiply(acc, val);
    });
};

export const useMatrixCanvas = () => ({
    arrayCanvasToMatrix: uint8ClampedArrayToMatrix,
    matrixToArrayCanvas: matrixToUint8ClampedArray,
    multiplyMatrix: multiplyMatrix,
    drawMatrix: drawMatrix,
});
