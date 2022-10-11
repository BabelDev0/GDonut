import { Matrix } from "ml-matrix";

export class TorusUtils {
    /**
     * Put the image passed in a torus geometry and return the torus as a matrix
     * 
     * @param xImgInTorus x position of the image in the torus (that is also the horizontal movement)
     * @param yImgInTorus y position of the image in the torus (that is also the vertical movement)
     * @param image image to be put in the torus
     * @param widthTorus width of the torus
     * @param heightTorus height of the torus
     * @returns torus with the image in the specified position
     */
    static putImgInTorus(
        xImgInTorus: number,
        yImgInTorus: number,
        image: Matrix,
        widthTorus: number,
        heightTorus: number
    ): Matrix {
        widthTorus *= 4;
        var torus = Matrix.zeros(heightTorus, widthTorus);

        // Calculates the new horizontal position based on the width of the torus
        xImgInTorus =
            xImgInTorus < 0
                ? widthTorus + (xImgInTorus % widthTorus)
                : xImgInTorus % widthTorus;
        xImgInTorus *= 4;

        // Calculates the new vertical position based on the height of the torus
        yImgInTorus =
            yImgInTorus < 0
                ? heightTorus + (yImgInTorus % heightTorus)
                : yImgInTorus % heightTorus;

        // loop that fills the torus with the image data, columns are filled in grops of 4
        // and the position in always calculated with the modulus of the width and height
        for (
            var yTorus = yImgInTorus;
            yTorus - yImgInTorus < image.rows;
            yTorus++
        ) {
            for (
                var xTorus = xImgInTorus;
                xTorus - xImgInTorus < image.columns;
                xTorus += 4
            ) {
                for (var i = 0; i < 4; i++) {
                    torus.set(
                        yTorus % heightTorus,
                        (xTorus % widthTorus) + i,
                        image.get(yTorus - yImgInTorus, xTorus - xImgInTorus + i)
                    );
                }
            }
        }
        return torus;
    }
}
