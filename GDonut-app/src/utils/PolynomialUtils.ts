import { Matrix } from "ml-matrix";
import { CanvasUtils } from "./CanvasUtils";
import { TorusUtils } from "./TorusUtils";
import { create, all, Parser, factorial, re } from "mathjs";

export class PolynomialUtils {
    image: Matrix;
    canvas: HTMLImageElement;
    canvasSize: number;
    permutantSelected: Permutant[];

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

            ctxRotate = ctxRotatePre;

            return testImgDataRotate.data;
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

            ctxReflect = ctxReflectPre;

            return testImgDataReflect.data;
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
    evaluate(polynomial: string) {

        const parser = this.getParser();
        if (parser) {
            var result = parser.evaluate(polynomial);
            var matrixResult = CanvasUtils.canvasToMatrix(result, this.canvasSize, this.canvasSize);
            parser.clear();
            return matrixResult;
        }
        else {
            return null;
        }
    }
}