import { Matrix } from "ml-matrix";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";
import { useTorus } from "../composables/useTorus";
import { create, all, Parser, number, log } from "mathjs";

const spaceMoviment = (
    x: number,
    y: number,
    testImgMatrix: Matrix,
    canvasSize: number,
) => {
    return useTorus().putImgInTorus(
        x,
        y,
        testImgMatrix,
        canvasSize,
        canvasSize
    ).to1DArray();
};

const rotation = (
    degree: number,
    testImg: HTMLImageElement,
    canvasSize: number,
) => {
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
};

const reflection = (
    axis: any,
    testImg: HTMLImageElement,
    canvasSize: number,
) => {
    var myCanvasReflect = document.createElement("canvas");
    myCanvasReflect.width = canvasSize;
    myCanvasReflect.height = canvasSize;

    var ctxReflect = myCanvasReflect.getContext("2d");
    if (ctxReflect) {
        var ctxReflectPre = ctxReflect;

        ctxReflect.clearRect(0, 0, myCanvasReflect.width, myCanvasReflect.height);
        ctxReflect.translate(
            Math.floor(canvasSize / 2),
            Math.floor(canvasSize / 2)
        );
        if (axis === "x") {
            ctxReflect.scale(1, -1);
        }
        else if (axis === "y") {
            ctxReflect.scale(-1, 1);
        }
        else {
            ctxReflect.scale(-1, -1);
        }
        ctxReflect.translate(
            -Math.floor(canvasSize / 2),
            -Math.floor(canvasSize / 2)
        );
        ctxReflect.drawImage(
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

        var testImgDataReflect = ctxReflect.getImageData(
            0,
            0,
            canvasSize,
            canvasSize
        );

        var torus_3 = useMatrixCanvas().arrayCanvasToMatrix(
            testImgDataReflect.data,
            canvasSize,
            canvasSize
        );

        ctxReflect = ctxReflectPre;

        return torus_3.to1DArray();
    }
    else {
        console.log("ctxReflect is null");
        return null;
    }
};

const eleSymPoly = (rank: number, ...args: number[][]) => {
    const n = args.reduce((max, xs) => Math.max(max, xs.length), 0);
    const result = Array.from({ length: n });
    return result.map((_, i) => args.map(xs => xs[i] || 0).reduce((sum, x) => sum + x, 0));
}

const getParser = (
    polyString: string,
    testImgMatrix: Matrix,
    testImg: HTMLImageElement,
    canvasSize: number,
    permutantSelected: Permutant[]
): Parser | null => {
    if (polyString && polyString.length !== 0) {
        const config = {};
        const math = create(all, config);
        const parser = math.parser();

        permutantSelected.forEach((permutant) => {
            switch (permutant.internalName) {
                case "lin":
                    var values: number[] = [];
                    if (permutant.value) {
                        values = permutant.value.split(",").map(Number);
                    }
                    parser.set(permutant.label,
                        spaceMoviment(values[0], values[1], testImgMatrix, canvasSize));
                    break;
                case "rot":
                    var value: number = 0;
                    if (permutant.value) {
                        value = +permutant.value;
                    }
                    parser.set(permutant.label,
                        rotation(value, testImg, canvasSize)
                    );
                    break;
                case "ref":
                    if (permutant.value) {
                        parser.set(permutant.label,
                            reflection(permutant.value, testImg, canvasSize)
                        );
                    }
                    break;

                default:
                    break;
            }
        });

        parser.set('s', function (rank: number, ...args: number[][]) {
            return eleSymPoly(rank, ...args);
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
    permutantSelected: Permutant[]
): Matrix | null => {
    const parser = getParser(polyString, testImgMatrix, testImg, canvasSize, permutantSelected);
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
