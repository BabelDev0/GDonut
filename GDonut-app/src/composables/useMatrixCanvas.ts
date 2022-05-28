import { Matrix } from "ml-matrix";

const uint8ClampedArrayToMatrix = (
    imgData: Uint8ClampedArray,
    imgWith: number,
    imgHeight: number
): Matrix => {
    // var matrix = new Matrix(imgHeight, imgWith * 4);


    // for (var i = 0; i < matrix.rows; i++) {
    //     matrix.setRow(i, imgData.slice(i * imgWith * 4, (i + 1) * imgWith * 4));
    // }
    var matrix = Matrix.from1DArray(imgHeight, imgWith * 4, imgData);
    return matrix;
};

const matrixToUint8ClampedArray = (matrix: Matrix): Uint8ClampedArray => {
    let imgData = new Uint8ClampedArray(Math.pow(matrix.rows, 2) * 4);
    // var j = -1;
    // imgData.forEach((_, i) => {
    //     if (i % matrix.columns === 0) {
    //         j++;
    //     }
    //     imgData[i] = matrix.get(j, i % matrix.columns);
    // });
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

export const useMatrixCanvas = () => ({
    arrayCanvasToMatrix: uint8ClampedArrayToMatrix,
    matrixToArrayCanvas: matrixToUint8ClampedArray,
    drawMatrix: drawMatrix,
});
