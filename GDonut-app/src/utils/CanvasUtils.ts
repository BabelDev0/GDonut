import { Matrix } from "ml-matrix";

export class CanvasUtils {

    static UtDRI: string = "public/UtDRI.png";

    /**
     * Return a matrix with the data of a canvas
     * 
     * @param imgData image data taken from the canvas
     * @param size size of the image (in with will be multiplied by 4 )
     * @returns matrix with the image data
     */
    static canvasToMatrix(
        imgData: number[] | Uint8ClampedArray,
        size: number
    ): Matrix {
        return Matrix.from1DArray(size, size * 4, imgData);
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

    /**
     * Draw image UDRI in a canvas
     * 
     * @param canvas canvas where to draw
     */
    static drawUtDRI(canvas: HTMLCanvasElement) {
        var ctx = canvas.getContext("2d");
        if (ctx) {
            var img = new Image();
            img.onload = function () {
                ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            img.src = this.UtDRI;
        }
    }
}
