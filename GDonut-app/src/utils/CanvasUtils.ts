import { Matrix } from "ml-matrix";

export class CanvasUtils {
    /**
     * Return a matrix with the data of a canvas
     * 
     * @param imgData image data taken from the canvas
     * @param width width of the image (must be multiplied by 4)
     * @param height height of the image
     * @returns matrix with the image data
     */
    static canvasToMatrix(
        imgData: number[] | Uint8ClampedArray,
        imgWith: number,
        imgHeight: number
    ): Matrix {
        return Matrix.from1DArray(imgHeight, imgWith * 4, imgData);;
    }

    /**
     * Draw a matrix in a canvas
     * 
     * @param matrix matrix to draw
     * @param canvas canvas where to draw
     */
    static drawMatrix(matrix: Matrix, canvas: HTMLCanvasElement) {
        var imgDataToDisplay = matrix.to1DArray();
        var ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var imgData = ctx.createImageData(matrix.columns / 4, matrix.rows);
            imgData.data.set(imgDataToDisplay);
            ctx.putImageData(imgData, 0, 0);
        }
    }

    /**
     * clear a canvas
     * 
     * @param canvas canvas to clear
     */
    static clearCanvas(canvas: HTMLCanvasElement) {
        var ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}
