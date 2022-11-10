import { Matrix } from "ml-matrix";
import { CanvasUtils } from "./CanvasUtils";
import { TorusUtils } from "./TorusUtils";
import { create, all, Parser, factorial } from "mathjs";

export class PolynomialUtils {
    image: Matrix;
    canvas: HTMLImageElement;
    canvasSize: number;
    permutantSelected: Permutant[];
    Mimg: number = 1;

    constructor(
        image: Matrix,
        canvas: HTMLImageElement,
        canvasSize: number,
        permutantSelected: Permutant[]
    ) {
        this.image = image;
        this.canvas = canvas;
        this.canvasSize = canvasSize;
        this.permutantSelected = permutantSelected;
    }

    /**
     * Returns the identity function
     * 
     * @returns array containing identity matrix
     */
    identity(
    ) {
        return this.image.to1DArray();
    };

    /**
     * Returns an array with data of the image moved to the position passed by parameter 
     * considering the image in a toroid
     * 
     * @param x horizontal displacement
     * @param y vertical displacement
     * @returns array containing the moved image 
     */
    spaceMoviment(
        x: number,
        y: number
    ) {
        var result = TorusUtils.putImgInTorus(
            x,
            y,
            this.image,
            this.canvasSize,
            this.canvasSize
        );

        return result.to1DArray();
    };

    /**
    * Returns an array with data of the image rotated by degree (multiples of 90)
    * 
    * @param degree degree of image rotation
    * @returns array containing the rotated image 
    */
    rotation(
        degree: number
    ) {
        var canvasRotate = document.createElement("canvas");
        canvasRotate.width = canvasRotate.height = this.canvasSize;
        var ctxRotate = canvasRotate.getContext("2d");

        if (ctxRotate) {
            var ctxRotatePre = ctxRotate;

            ctxRotate.clearRect(0, 0, canvasRotate.width, canvasRotate.height);

            // move the context to the center of the canvas
            ctxRotate.translate(
                Math.floor(this.canvasSize / 2),
                Math.floor(this.canvasSize / 2)
            );
            ctxRotate.rotate((+degree * Math.PI) / 180);
            // move the context back to the top left of the canvas
            ctxRotate.translate(
                -Math.floor(this.canvasSize / 2),
                -Math.floor(this.canvasSize / 2)
            );
            ctxRotate.drawImage(
                this.canvas,
                0,
                0,
                this.canvas.width,
                this.canvas.height,
                0,
                0,
                this.canvasSize,
                this.canvasSize
            );

            var testImgDataRotate = ctxRotate.getImageData(
                0,
                0,
                this.canvasSize,
                this.canvasSize
            );

            var result = CanvasUtils.canvasToMatrix(testImgDataRotate.data, this.canvasSize, this.canvasSize);

            ctxRotate = ctxRotatePre;

            return result.to1DArray();
        }
        else {
            console.log("ctxRotate is null");
            return null;
        }
    };

    /**
     * Returns an array with data of the image flipped by the axis passed by parameter
     * 
     * @param axis on which the image will be flipped
     * @returns array containing the flipped image
     */
    reflection(
        axis: any
    ) {
        var canvasReflect = document.createElement("canvas");
        canvasReflect.width = canvasReflect.height = this.canvasSize;
        var ctxReflect = canvasReflect.getContext("2d");

        if (ctxReflect) {
            var ctxReflectPre = ctxReflect;

            ctxReflect.clearRect(0, 0, canvasReflect.width, canvasReflect.height);
            // move the context to the center of the canvas
            ctxReflect.translate(
                Math.floor(this.canvasSize / 2),
                Math.floor(this.canvasSize / 2)
            );

            if (axis === "x") {
                ctxReflect.scale(1, -1);
            }
            else if (axis === "y") {
                ctxReflect.scale(-1, 1);
            }
            else if (axis === "xy") {
                ctxReflect.scale(-1, -1);
            }

            // move the context back to the top left of the canvas
            ctxReflect.translate(
                -Math.floor(this.canvasSize / 2),
                -Math.floor(this.canvasSize / 2)
            );
            ctxReflect.drawImage(
                this.canvas,
                0,
                0,
                this.canvas.width,
                this.canvas.height,
                0,
                0,
                this.canvasSize,
                this.canvasSize
            );

            var testImgDataReflect = ctxReflect.getImageData(
                0,
                0,
                this.canvasSize,
                this.canvasSize
            );

            var result = CanvasUtils.canvasToMatrix(testImgDataReflect.data, this.canvasSize, this.canvasSize);

            ctxReflect = ctxReflectPre;

            return result.to1DArray();
        }
        else {
            console.log("ctxReflect is null");
            return null;
        }
    };

    /**
     * Returns the product of an array of matrices
     * 
     * @param matrices 
     * @returns the product of the matrices
    */
    multiplyMatrices(matrices: Matrix[]) {
        var result = matrices.reduce((acc, val) => {
            return Matrix.multiply(acc, val);
        });
        return result.to1DArray();
    };

    /**
     * Returns the the division by a scalar of a matrix
     * 
     * @param dividend matrix to be divided
     * @param divider nubmer to divide the matrix
     * @returns the array with the data of matrix divided by the scalar
     */
    dividedMatrixByScalar(dividend: Matrix, divider: number) {
        var result = Matrix.divide(dividend, divider);
        return result.to1DArray();
    };

    /**
     * Returns array containing the result of the base matrix power to the exponent
     * 
     * @param base base matrix
     * @param exp exponent
     * @returns array containing the result of the exponentiation
     */
    powerMatrix(base: Matrix, exp: number) {
        var result = Matrix.pow(base, exp);
        return result.to1DArray();
    }

    /**
     * Returns the binomial coefficient of the parameters passed by parameter
     * 
     * @param n 
     * @param k 
     * @returns binoomial coefficient of n and k
     */
    binom(n: number, k: number) {
        if (k < 0 || k > n) {
            return 0;
        }
        else {
            return factorial(n) / (factorial(k) * factorial(n - k));
        }
    }

    /**
     * Returns the combination of the lexicographic order l 
     * 
     * @param n size of the set
     * @param p nubers of elements in each combination
     * @param l index of the lexicographic order 
     * @returns the combination of the lexicographic order l
     */
    A515(n: number, p: number, l: number) {
        var c = new Array(p);
        var x = 1;
        var r = this.binom(n - x, p - 1);
        var k = r;

        while (k <= l) {
            x += 1;
            r = this.binom(n - x, p - 1);
            k += r;
        }
        k -= r;
        c[0] = x - 1;
        for (var i = 2; i < p; i++) {
            x += 1;
            r = this.binom(n - x, p - i);
            k += r;
            while (k <= l) {
                x += 1;
                r = this.binom(n - x, p - i);
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

    /**
     * Returns array fill with the value of the rank elementary symmetric function 
     * of the permutant passed by parameter
     * 
     * @param rank rank of the elementary symmetric function
     * @param args array of the permutant
     * @returns rank elementary symmetric function of the permutant
     */
    eleSymPoly(rank: number, ...args: number[][]) {
        var size = args.length;
        var nCr = this.binom(size, rank);

        var result: Matrix = Matrix.zeros(this.canvasSize, this.canvasSize * 4);

        let matrices: Matrix[];
        matrices = args.map((arg: any) => {
            return CanvasUtils.canvasToMatrix(arg, this.canvasSize, this.canvasSize);
        });

        // s(1,a_1,...,a_r) = a_1 + ... + a_r
        // s(2,a_1,...,a_r) = a_1a_2+...+a_1a_r+a_2a_3+...+a_{r-1}a_r
        for (var order = 0; order < nCr; order++) {
            var step = Matrix.ones(this.canvasSize, this.canvasSize * 4);
            var combinations = this.A515(size, rank, order);
            for (var j = 0; j < combinations.length; j++) {
                step = Matrix.multiply(step, matrices[combinations[j]]);
            }
            result = Matrix.add(result, step);
        }
        return result.to1DArray();
    }

    LaTeXToPoly = (polynomial: string): string => {
        var ply = polynomial;
        ply = ply.replace(/\\left/g, "")
        ply = ply.replace(/\\left/g, "")
        ply = ply.replace(/\\right/g, "")
        ply = ply.replace(/\\sigma_(\d+)\(/g, "s($1,")
        ply = ply.replace(/\\frac\{(.+?)\}\{(\d+)\}/g, "f($1,$2)")
        ply = ply.replace(/\\cdot/g, "*");

        var index = ply.indexOf("^");
        while (index != -1 && index < ply.length) {
            var i = index - 1;
            while (
                ply[i] != "+" &&
                ply[i] != "-" &&
                ply[i] != "*" &&
                ply[i] != "/" &&
                i >= 0
            ) {
                i--;
            }
            // todo for more than one nuber after ^
            ply =
                ply.substring(0, i + 1) +
                "p(" +
                ply.substring(i + 1, index) +
                "," +
                ply.substring(index + 1, index + 2) +
                ")" +
                ply.substring(index + 2);
            index = ply.indexOf("^");
        }

        // todo upgrade m can accept more than two parameters
        index = ply.indexOf("*");
        while (index != -1 && index < ply.length) {
            var i = index - 1;
            while (
                ply[i] != "+" &&
                ply[i] != "-" &&
                ply[i] != "*" &&
                ply[i] != "/" &&
                i >= 0
            ) {
                i--;
            }
            var j = index + 1;
            while (
                ply[j] != "+" &&
                ply[j] != "-" &&
                ply[j] != "*" &&
                ply[j] != "/" &&
                j < ply.length
            ) {
                j++;
            }
            ply =
                ply.substring(0, i + 1) +
                "m(" +
                ply.substring(i + 1, index) +
                "," +
                ply.substring(index + 1, j) +
                ")" +
                ply.substring(j);
            index = ply.indexOf("*");
        }

        return ply;
    };

    MCapitolOne = (n: number, ranks: number[]): number => {
        const tempMs = [];
        for (var i = 1; i <= n; i++) {
            tempMs.push(
                ranks[i - 1]
                * i
                * Math.pow(this.binom(n, i), ranks[i - 1])
                * Math.pow(this.Mimg, (i * (ranks[i - 1] - 1)))
            );
        }
        const m1 = tempMs.reduce((a, b) => Math.max(a, b))
        return m1;
    }

    MCapitolTwo = (n: number, ranks: number[]): number => {
        const tempMs = [];
        for (var i = 1; i <= n; i++) {
            tempMs.push(
                Math.pow(this.binom(n, i), ranks[i - 1])
                * Math.pow(this.Mimg, (i * ranks[i - 1]))
            );
        }
        const m2 = Math.pow((tempMs.reduce((a, b) => Math.max(a, b))), (n - 1));
        return m2;
    }

    /**
     * Returns the geneo constant, based on the elementary symmetric polynomial passed
     */
    getGeneoConstant(polynomial: string): number {

        var ply = polynomial;
        ply = ply.replace(/\\left\(?\)?/g, "")
        ply = ply.replace(/\\right\(?\)?/g, "")
        ply = ply.replace(/\\cdot/g, "*")
        ply = ply.replace(/\^(\d+)/g, "^{$1}")
        ply = ply.replace(/\\sigma_(\d+)/g, "s($1)")
        ply = ply.replace(/\(a_\d+(,a_\d+)*\)/g, "")
        ply = ply.replace(/\+s\((\d+)\)/g, "+1*s($1)")
        ply = ply.replace(/^s\((\d+)\)/g, "1*s($1)")
        ply = ply.replace(/-s\((\d+)\)/g, "-1*s($1)")
        ply = ply.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, (match, p1, p2) => {
            return (+(p1) / +(p2)).toString();
        });
        console.log("polyConstant " + ply);

        var regex = /(-?\d*.?\d+)?\*?s\((\d+)\)(\^\{(-?\d*.?\d+)\})?/g;
        var match;
        var n = 0;
        var coefficients: number[] = [];
        var exponents: number[][] = [];

        var count = 0;

        while (match = regex.exec(ply)) {
            console.log(match);
            if (parseInt(match[2]) > n) {
                n = parseInt(match[2]);
            }
            if (match[1] !== undefined) {
                coefficients.push(+(match[1]));
                count++;
            }
        }

        for (var i = 0; i < count; i++) {
            exponents.push(new Array(n).fill(0));
        }
        count = 0;

        while (match = regex.exec(ply)) {
            if (match[1] === undefined) {
                count--;
            }

            if (match[4] !== undefined) {
                exponents[count][parseInt(match[2]) - 1] = +(match[4]);
            }
            else {
                exponents[count][parseInt(match[2]) - 1] = 1;
            }

            count++;
        }

        var c = 0;
        for (var i = 0; i < coefficients.length; i++) {
            c += Math.abs(coefficients[i])
                * this.MCapitolOne(n, exponents[i])
                * this.MCapitolTwo(n, exponents[i]);
        }
        c *= n;
        console.log("const " + c);
        return c;
    }

    /**
     * Returns a parser capable of transform permutant and elementary symmetric function in array of numbers
     * with which it possible to evaluate the polynomial
     * 
     * @returns a parser capable of transform permutant and elementary symmetric function in array of numbers
     */
    getParser(): Parser | null {
        const config = {};
        const math = create(all, config);
        const parser = math.parser();

        // parsing permutant
        this.permutantSelected.forEach((permutant) => {
            switch (permutant.internalName) {
                case "ide":
                    parser.set(permutant.label,
                        this.identity());
                    break;
                case "lin":
                    var values = [0];
                    if (permutant.value) {
                        values = permutant.value.split(",").map(Number);
                    }
                    parser.set(permutant.label,
                        this.spaceMoviment(values[0], values[1]));
                    break;
                case "rot":
                    var value = 0;
                    if (permutant.value) {
                        value = +permutant.value;
                    }
                    parser.set(permutant.label,
                        this.rotation(value)
                    );
                    break;
                case "ref":
                    if (permutant.value) {
                        parser.set(permutant.label,
                            this.reflection(permutant.value)
                        );
                    }
                    break;

                default:
                    break;
            }
        });

        //parsing actions
        parser.set('m', (...args: number[][]) => {
            let matrices: Matrix[];
            matrices = args.map((arg) => {
                return CanvasUtils.canvasToMatrix(arg, this.canvasSize, this.canvasSize);
            });
            return this.multiplyMatrices(matrices);
        });

        parser.set('f', (dividend: number[], divider: number) => {
            let dividendMatrix: Matrix;
            dividendMatrix = CanvasUtils.canvasToMatrix(dividend, this.canvasSize, this.canvasSize);
            return this.dividedMatrixByScalar(dividendMatrix, divider);
        });

        parser.set('p', (base: number[], exp: number) => {
            var baseMatrix = CanvasUtils.canvasToMatrix(base, this.canvasSize, this.canvasSize);
            return this.powerMatrix(baseMatrix, exp);
        });

        // parsing elementary symmetric function
        parser.set('s', (rank: number, ...args: number[][]) => {
            return this.eleSymPoly(rank, ...args);
        });

        return parser;
    };

    /**
     * Returns the result of the evaluation of the polynomial,
     * transforming the permutant and elementary symmetric function
     * 
     * @param polynomial polynomial to evaluate
     * @returns matrix containing the result of the evaluation of the polynomial
     */
    evaluate(polynomialLatex: string) {
        const parser = this.getParser();
        if (parser) {
            const poly = this.LaTeXToPoly(polynomialLatex);
            const constant = this.getGeneoConstant(polynomialLatex);
            console.log("poly " + poly);
            console.log("latex " + polynomialLatex);

            var result = parser.evaluate(poly);

            var matrixResult = CanvasUtils.canvasToMatrix(result, this.canvasSize, this.canvasSize);
            if (constant !== 0) {
                var matrixResult2 = Matrix.divide(matrixResult, constant);
                console.log(matrixResult2);
            }
            parser.clear();
            return matrixResult;
        }
        else {
            return null;
        }
    }
}