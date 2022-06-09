import { Matrix } from "ml-matrix";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";
import { useTorus } from "../composables/useTorus";
import { create, all, Parser } from "mathjs";

const getParser = (
    polyString: string,
    testImgMatrix: Matrix,
    testImg: HTMLImageElement,
    canvasSize: number,
): Parser | null => {
    if (polyString && polyString.length !== 0) {
        const config = {};
        const math = create(all, config);
        const parser = math.parser();

        parser.set('h', Math.floor(canvasSize / 2));

        parser.set('a_1', function (x: number | string, y: number | string) {
            return useTorus().putImgInTorus(
                +x,
                +y,
                testImgMatrix,
                canvasSize,
                canvasSize
            ).to1DArray();
        });

        parser.set('a_2', function (degree: number) {
            var myCanvasRotate = document.createElement("canvas");
            myCanvasRotate.width = canvasSize;
            myCanvasRotate.height = canvasSize;

            var ctxRotate = myCanvasRotate.getContext("2d");
            if (ctxRotate) {
                var ctxRotatePre = ctxRotate;

                ctxRotate.clearRect(0, 0, myCanvasRotate.width, myCanvasRotate.height);
                ctxRotate.translate(
                    Math.floor(canvasSize / 2),
                    Math.floor(canvasSize / 2)
                );
                ctxRotate.rotate((+degree * Math.PI) / 180);
                ctxRotate.translate(
                    -Math.floor(canvasSize / 2),
                    -Math.floor(canvasSize / 2)
                );
                ctxRotate.drawImage(
                    testImg,
                    0,
                    0,
                    testImg.width,
                    testImg.height,
                    0,
                    0,
                    canvasSize,
                    canvasSize
                );

                var testImgDataRotate = ctxRotate.getImageData(
                    0,
                    0,
                    canvasSize,
                    canvasSize
                );

                var torus_2 = useMatrixCanvas().arrayCanvasToMatrix(
                    testImgDataRotate.data,
                    canvasSize,
                    canvasSize
                );

                ctxRotate = ctxRotatePre;

                return torus_2.to1DArray();
            }
            else {
                console.log("ctxRotate is null");
                return null;
            }
        });

        return parser;
    }
    else {
        return null;
    }
};

const evalPoly = (
    polyString: string,
    testImgMatrix: Matrix,
    testImg: HTMLImageElement,
    canvasSize: number,
): Matrix | null => {

    const parser = getParser(polyString, testImgMatrix, testImg, canvasSize);
    if (parser) {
        var arrayValuated = parser.evaluate(polyString);
        parser.clear();
        return Matrix.from1DArray(testImgMatrix.rows, testImgMatrix.columns, arrayValuated);
    }
    else {
        return null;
    }
}

export const usePoly = () => ({
    evalPoly: evalPoly,
});
