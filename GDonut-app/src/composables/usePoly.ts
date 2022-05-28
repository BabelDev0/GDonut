import { Matrix } from "ml-matrix";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";
import { useTorus } from "../composables/useTorus";
import { create, all, Parser } from "mathjs";

const getParser = (
    polyString: string,
    testImgMatrix: Matrix,
    testImg: HTMLImageElement,
): Parser | null => {
    if (polyString && polyString.length !== 0) {
        const config = {};
        const math = create(all, config);
        const parser = math.parser();

        parser.set('halfX', Math.floor(testImg.width / 2));

        parser.set('halfY', Math.floor(testImg.height / 2));

        parser.set('a_1', function (x: number | string, y: number | string) {
            console.log(x, y);
            return useTorus().putImgInTorus(
                +x,
                +y,
                testImgMatrix,
                testImg.width,
                testImg.height
            ).to1DArray();
        });

        parser.set('a_2', function (degree: number) {
            var myCanvasRotate = document.createElement("canvas");
            myCanvasRotate.width = testImg.width;
            myCanvasRotate.height = testImg.height;

            var ctxRotate = myCanvasRotate.getContext("2d");
            var ctxRotatePre = ctxRotate;

            ctxRotate?.clearRect(0, 0, myCanvasRotate.width, myCanvasRotate.height);
            ctxRotate?.translate(
                Math.floor(testImg.width / 2),
                Math.floor(testImg.height / 2)
            );
            ctxRotate?.rotate((+degree * Math.PI) / 180);
            ctxRotate?.translate(
                -Math.floor(testImg.width / 2),
                -Math.floor(testImg.height / 2)
            );
            ctxRotate!.drawImage(testImg, 0, 0);

            var testImgDataRotate = ctxRotate!.getImageData(
                0,
                0,
                testImg.width,
                testImg.height
            );

            var torus_2 = useMatrixCanvas().arrayCanvasToMatrix(
                testImgDataRotate.data,
                testImg.width,
                testImg.height
            );

            ctxRotate = ctxRotatePre;

            return torus_2.to1DArray();
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
): Matrix | null => {

    const parser = getParser(polyString, testImgMatrix, testImg);
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
