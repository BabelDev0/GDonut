import { Matrix } from "ml-matrix";
import { useMatrixCanvas } from "../composables/useMatrixCanvas";
import { useTorus } from "../composables/useTorus";
import { create, all, Parser, factorial } from "mathjs";

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

const binom = (n: number, k: number) => {
    if (k < 0 || k > n) {
        return 0;
    }
    else {
        return factorial(n) / (factorial(k) * factorial(n - k));
    }
}

//Algorithm 515 (Buckle's Algorithm)
const A515 = (n: number, p: number, l: number) => {
    var c = new Array(p);
    var x = 1;
    var r = binom(n - x, p - 1);
    var k = r;

    while (k <= l) {
        x += 1;
        r = binom(n - x, p - 1);
        k += r;
    }
    k -= r;
    c[0] = x - 1;
    for (var i = 2; i < p; i++) {
        x += 1;
        r = binom(n - x, p - i);
        k += r;
        while (k <= l) {
            x += 1;
            r = binom(n - x, p - i);
            k += r;
        }
        k -= r;
        c[i - 1] = x - 1;
    }
    if (p > 1) {
        c[p - 1] = x + l - k;
    }
    return c;
}

const eleSymPoly = (rank: number, canvasSize: number, ...args: number[][]) => {
    var size = args.length;
    var nCr = binom(size, rank);

    var result: Matrix = Matrix.zeros(canvasSize, canvasSize * 4);

    let matrices: Matrix[];
    matrices = args.map((arg: any) => {
        return useMatrixCanvas().arrayCanvasToMatrix(arg, canvasSize, canvasSize);
    });

    for (var i = 0; i < nCr; i++) {
        var step: Matrix = Matrix.ones(canvasSize, canvasSize * 4);
        var combinations = A515(size, rank, i);
        for (var j = 0; j < combinations.length; j++) {
            step = Matrix.multiply(step, matrices[combinations[j]]);
        }
        result = Matrix.add(result, step);
    }
    return result.to1DArray();
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

        parser.set('m', function (...args: number[][]) {
            let matrices: Matrix[];
            matrices = args.map((arg: any) => {
                return useMatrixCanvas().arrayCanvasToMatrix(arg, canvasSize, canvasSize);
            });
            return useMatrixCanvas().multiplyMatrix(matrices).to1DArray();
        });

        parser.set('s', function (rank: number, ...args: number[][]) {
            return eleSymPoly(rank, canvasSize, ...args);
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
