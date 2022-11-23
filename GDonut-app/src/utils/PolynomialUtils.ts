import { Matrix } from "ml-matrix";
import { CanvasUtils } from "./CanvasUtils";
import { TorusUtils } from "./TorusUtils";
import { create, all, Parser, factorial } from "mathjs";

export class PolynomialUtils {
    image: Matrix;
    canvas: HTMLImageElement;
    canvasSize: number;
    permutants: Permutant[];
    unknowns: Array<{ label: string, value: string }>;
    Mimg: number = 255;
    rankPoly: number = 0;
    constToNormalize: number = 0;

    constructor(
        image: Matrix,
        canvas: HTMLImageElement,
        canvasSize: number,
        permutants: Permutant[],
        unknowns: Array<{ label: string, value: string }>
    ) {
        this.image = image;
        this.canvas = canvas;
        this.canvasSize = canvasSize;
        this.permutants = permutants;
        this.unknowns = unknowns;
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
            throw "ctxRotate is null";
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
            throw "ctxReflect is null";
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
    divideMatrices(matrices: Matrix[]) {
        var result = matrices.reduce((acc, val) => {
            return Matrix.divide(acc, val);
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
        if (size < rank) {
            throw "The rank must be greater or equal to the size of the array";
            return null;
        }
        var nCr = this.binom(size, rank);

        var result: Matrix = Matrix.zeros(this.canvasSize, this.canvasSize * 4);

        let matrices: Matrix[];
        matrices = args.map((arg: any) => {
            return CanvasUtils.canvasToMatrix(arg, this.canvasSize, this.canvasSize);
        });

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

    LaTeXToPolyGen = (polynomial: string): string => {
        var ply = polynomial;
        // replace all a_1,...,a_n 
        ply = ply.replace(/\(a_\d+(,a_\d+)*\)/g, "");
        // replace \sigma_{n} to s(n)
        ply = ply.replace(/\\sigma_(\d+)/g, "s($1)");
        ply = ply.replace(/\\sigma_\{(\d+)\}/g, "s($1)");
        // replace \cdot to *
        ply = ply.replace(/\\cdot/g, "*");

        ply = ply.replace(/\+s\((\d+)\)/g, "+1*s($1)")
        ply = ply.replace(/^s\((\d+)\)/g, "1*s($1)")
        ply = ply.replace(/-s\((\d+)\)/g, "-1*s($1)")

        // replace all ^a with ^{a}
        ply = ply.replace(/\^(-?\d+\.?\d*)/g, "^{$1}");

        // loop and replace all n*r with the result of the multiplication until there is no more n*r
        var loop = true;
        while (loop) {
            ply = ply.replace(/(-?\d+\.?\d*)\*(-?\d+\.?\d*)/g, (match, p1, p2) => {
                return (Number(p1) * Number(p2)).toString();
            });
            if (ply.search(/(-?\d+\.?\d*)\*(-?\d+\.?\d*)/) == -1) {
                loop = false;
            }
        }
        // replace all \frac{a}{b} to result of divided a and b, a and b can be double and negative
        ply = ply.replace(/\\frac{(-?\d+\.?\d*)}{(-?\d+\.?\d*)}/g, (match, p1, p2) => {
            return (Number(p1) / Number(p2)).toString();
        });

        return ply;
    };

    LaTeXToPolySpc = (polynomial: string, args: string): string => {
        var ply = polynomial;
        // trasform \fract{something}{something} to f(something,something)
        var regex = /\\frac{/g;
        var match = null;
        while ((match = regex.exec(ply)) != null) {
            var isClosing = 1;
            var i = 0;
            var first = "";
            for (i = match.index + 6; i < ply.length; i++) {
                if (ply[i] == "{") {
                    isClosing++;
                }
                else if (ply[i] == "}") {
                    isClosing--;
                }
                if (isClosing == 0) {
                    break;
                }
                else {
                    first += ply[i];
                }
            }
            var second = "";
            isClosing = 1;
            for (i = i + 2; i < ply.length; i++) {
                if (ply[i] == "{") {
                    isClosing++;
                }
                else if (ply[i] == "}") {
                    isClosing--;
                }
                if (isClosing == 0) {
                    break;
                }
                else {
                    second += ply[i];
                }
            }

            ply = ply.substring(0, match.index) + "f(" + first + "," + second + ")" + ply.substring(i + 1);
        }

        // trasform s(n)*s(r) to m(s(n),s(r))
        var regexs = [
            /(s\(\d+\))\*(s\(\d+\))/g,
            /(m\(.*\))\*(s\(\d+\))/g,
            /(m\(.*\))\*(m\(.*\))/g
        ]
        for (var i = 0; i < regexs.length; i++) {
            var regex = regexs[i];
            var match = null;
            while ((match = regex.exec(ply)) != null) {
                var first = match[1];
                var second = match[2];
                ply = ply.substring(0, match.index) + "m(" + first + "," + second + ")" + ply.substring(match.index + match[0].length);
            }
        }

        // trasform s(n)^{k} to p(s(n),k)
        regex = /(s\(\d+\))\^\{(-?\d+\.?\d*)\}/g;
        match = null;
        while ((match = regex.exec(ply)) != null) {
            ply = ply.substring(0, match.index) + "p(" + match[1] + "," + match[2] + ")" + ply.substring(match.index + match[0].length);
        }

        // trasform s(n) in s(n,args)
        regex = /s\((\d+)\)/g;
        match = null;
        while ((match = regex.exec(ply)) != null) {
            ply = ply.substring(0, match.index) + "s(" + match[1] + "," + args + ")" + ply.substring(match.index + match[0].length);
        }

        return ply;
    }

    LaTeXToPoly = (polynomial: string): string => {
        console.log("latex " + polynomial);

        var ply = polynomial;
        //replcace \left and \right with ""
        ply = ply.replace(/\\left|\\right/g, "");

        var regex = /\\sigma_\{?\d+\}?\((a_\d+(,a_\d+)*)\)/g;
        // check if all the match[1] are the same
        var match;
        var args = "";
        while ((match = regex.exec(ply)) != null) {
            if (args == "") {
                args = match[1];
            }
            else if (args != match[1]) {
                throw "Error: the arguments of the sigma function are not the same";
            }
        }

        this.setRankPoly(args);

        ply = this.LaTeXToPolyGen(ply);
        console.log("plyGEN " + ply);
        ply = this.LaTeXToPolySpc(ply, args);
        console.log("plySPC " + ply);
        return ply;
    }

    setRankPoly = (args: string) => {
        var n = 0;
        var match = null;
        var regex = /a_(\d+)/g;
        while ((match = regex.exec(args)) != null) {
            n++;
        }
        this.rankPoly = n;
    }

    setMimg = (matrix: Matrix) => {
        var matrixAbs = matrix.abs();
        this.Mimg = matrixAbs.max();
    }

    normalizeGeneo = (matrix: Matrix, constToNormalize: number): Matrix => {
        if (constToNormalize < 0) {
            if (matrix.max() !== 0) {
                constToNormalize = 255 / matrix.max();
            }
            else {
                constToNormalize = 1;
            }
        }
        this.constToNormalize = constToNormalize;
        var matrixNormalized = matrix.clone();
        matrixNormalized = matrixNormalized.mul(this.constToNormalize);
        return matrixNormalized;
    }

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

    getGeneoConstant(polynomial: string): number {

        var ply = this.LaTeXToPolyGen(polynomial);
        var regex = /(-?\d*.?\d+)?\*?s\((\d+)\)(\^\{(-?\d*.?\d+)\})?/g;
        var match;
        var n = this.rankPoly;
        var coefficients: number[] = [];
        var exponents: number[][] = [];

        var count = 0;

        while (match = regex.exec(ply)) {
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
        console.log("n ", n);
        console.log("exponents ", exponents);
        console.log("coefficients ", coefficients);
        console.log("const ", c);
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
        this.permutants.forEach((permutant) => {
            switch (permutant.internalName) {
                case "ide":
                    parser.set(permutant.label,
                        this.identity());
                    break;
                case "lin":
                    var values = [0];
                    if (permutant.value) {
                        var tempPermVal = permutant.value;
                        const x = this.unknowns.find((unknown) => unknown.label === "x");
                        const y = this.unknowns.find((unknown) => unknown.label === "y");
                        if (x && y) {
                            tempPermVal = tempPermVal.replace("x", x.value);
                            tempPermVal = tempPermVal.replace("y", y.value);
                        }
                        values = tempPermVal.split(",").map(Number);
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

        //parsing multiplication
        parser.set('m', (...args: number[][]) => {
            let matrices: Matrix[];
            matrices = args.map((arg) => {
                return CanvasUtils.canvasToMatrix(arg, this.canvasSize, this.canvasSize);
            });
            return this.multiplyMatrices(matrices);
        });

        // parsing division
        parser.set('f', (...args: number[][]) => {
            let matrices: Matrix[];
            matrices = args.map((arg) => {
                return CanvasUtils.canvasToMatrix(arg, this.canvasSize, this.canvasSize);
            });
            return this.divideMatrices(matrices);
        });

        // parsing power
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
            var result = parser.evaluate(poly);
            var matrixResult = CanvasUtils.canvasToMatrix(result, this.canvasSize, this.canvasSize);
            this.setMimg(matrixResult);

            const geneoConst = this.getGeneoConstant(polynomialLatex);
            if (geneoConst != 0) {
                matrixResult = matrixResult.div(geneoConst);
            }
            parser.clear();
            return matrixResult;
        }
        else {
            return null;
        }
    }
}