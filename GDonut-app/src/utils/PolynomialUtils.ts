import { Matrix } from "ml-matrix";
import { CanvasUtils } from "./CanvasUtils";
import { TorusUtils } from "./TorusUtils";
import { create, all, Parser, factorial } from "mathjs";

export class PolynomialUtils {
    sampleImgData: Matrix;
    sampleImg: HTMLImageElement;
    canvasSize: number;
    group: Group;
    Mimg: number = 255;
    rankPoly: number = 0;
    constToNormalize: number = 0;

    constructor(
        sampleImgData: Matrix,
        sampleImg: HTMLImageElement,
        canvasSize: number,
        group: Group
    ) {
        this.sampleImgData = sampleImgData;
        this.sampleImg = sampleImg;
        this.canvasSize = canvasSize;
        this.group = group;
    }

    /**
     * Returns an array with data of the image moved to the position passed by parameter 
     * considering the image in a toroid
     * 
     * @param x horizontal displacement
     * @param y vertical displacement
     * @returns array containing the moved image 
     */
    spaceMovement(
        x: number,
        y: number
    ) {
        var result = TorusUtils.putImgInTorus(
            x,
            y,
            this.sampleImgData,
            this.canvasSize,
            this.canvasSize
        );

        return result.to1DArray();
    };

    /**
    * Returns an array with data of the image rotated by degree (integer multiples of 90)
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
                this.sampleImg,
                0,
                0,
                this.canvasSize,
                this.canvasSize,
            );

            var testImgDataRotate = ctxRotate.getImageData(
                0,
                0,
                this.canvasSize,
                this.canvasSize
            );

            var result = CanvasUtils.canvasToMatrix(testImgDataRotate.data, this.canvasSize);

            ctxRotate = ctxRotatePre;

            return result.to1DArray();
        }
        else {
            throw "ctxRotate not exist";
        }
    };

    /**
     * Returns the product of an array of matrices
     * 
     * @param matrices 
     * @returns the product of the matrices
    */
    multiplyMatrices(matrices: Matrix[]) {
        var result = matrices.reduce((prod1, prod2) => {
            return Matrix.multiply(prod1, prod2);
        });
        return result.to1DArray();
    };

    /**
     * Returns the division of an array by a matrices
     * 
     * @param matrices 
     * @returns the quotient of the division
     */
    divideMatrices(matrices: Matrix[]) {
        var result = matrices.reduce((dividend, divisor) => {
            return Matrix.divide(dividend, divisor);
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
     * e.g. n = 4 | p = 2 | l = 2
     * {1,2,3,4} | {1,2},{1,3},{1,4},{2,3},{2,4},{3,4} | {1,3}
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
     * Returns an array filled with the value of the rank elementary symmetric function 
     * of the permutant passed by arguments
     * 
     * @param rank rank of the elementary symmetric function
     * @param args array of the permutant
     * @returns rank elementary symmetric function of the permutant
     */
    eleSymPoly(rank: number, ...args: number[][]) {
        var size = args.length;
        // s(4,a_1,a_2,...,a_n) => size=n > rank=4 OK
        if (size < rank) {
            throw "The rank must be greater or equal to the size of the array";
        }
        // number of combinations
        var nCr = this.binom(size, rank);

        var result: Matrix = Matrix.zeros(this.canvasSize, this.canvasSize * 4);

        let matrices: Matrix[];
        matrices = args.map((arg: any) => {
            return CanvasUtils.canvasToMatrix(arg, this.canvasSize);
        });

        // at each cycle I take a major lexicographic order and multiply it by the previous value
        // and then add it up when I reached the number of combinations 
        // s(2,a_1,a_2,...,a_n) = a_1a_2+a_1a_3+...+a_(n-1)a_n
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
     * Returns the polynomial in a form useful to calculate the geneo constant
     * 
     * @param polynomial to be converted
     * @returns polynomial in a gen form
     */
    LaTeXToPolyGen = (polynomial: string): string => {
        var ply = polynomial;
        // replace all a_1,...,a_n with ""
        ply = ply.replace(/\(a_\d+(,a_\d+)*\)/g, "");
        // replace \sigma_{n} with s(n)
        ply = ply.replace(/\\sigma_(\d+)/g, "s($1)");
        ply = ply.replace(/\\sigma_\{(\d+)\}/g, "s($1)");
        // replace \cdot with *
        ply = ply.replace(/\\cdot/g, "*");

        // replace +-s(n) with +-1*s(n)
        ply = ply.replace(/\+s\((\d+)\)/g, "+1*s($1)")
        ply = ply.replace(/^s\((\d+)\)/g, "1*s($1)")
        ply = ply.replace(/-s\((\d+)\)/g, "-1*s($1)")

        // replace all ^n with ^{n}
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

    /**
     * Returns the polynomial in a form useful to evaluate the polynomial
     * 
     * @param polynomial to be converted
     * @returns polynomial in a spc form
     */
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

    /**
     * Returns the polynomial in a form useful to evaluate the polynomial, after setting
     * polynomial's rank
     * 
     * @param polynomial to be converted
     * @returns polynomial in a geneo form
     */
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

    /**
     * Sets the rank of the polynomial or 
     * the cognate permutant with the function of major rank
     * 
     * @param args arguments of the polynomial
     */
    setRankPoly = (args: string) => {
        var n = 0;
        var match = null;
        var regex = /a_(\d+)/g;
        while ((match = regex.exec(args)) != null) {
            n++;
        }
        this.rankPoly = n;
    }

    /**
     * Sets the maximum value reached by the data function image
     * 
     * @param matrix 
     */
    setMimg = (matrix: Matrix) => {
        var matrixAbs = matrix.abs();
        this.Mimg = matrixAbs.max();
    }

    /**
     * Used to normalize the geneo matrix with a value chosen by the user
     * 
     * @param matrix geneo to be normalized
     * @param constToNormalize constant to normalize the matrix
     * @returns the geneo normalized by the constant
     */
    normalizeGeneo = (matrix: Matrix, constToNormalize: number): Matrix => {
        // in the default case the constant is -1 and the matrix is normalized
        // to a propotion of 255 as the maximum value of the normalized function
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
        matrixNormalized = matrixNormalized.mul(constToNormalize);
        return matrixNormalized;
    }

    /**
     * Returns the M_1 constant of the polynomial, described in the paper
     * 
     * @param n rank of the polynomial
     * @param exps exponents of symmetric functions of the polynomial
     * @returns teh M_1 constant of the polynomial
     */
    MCapitolOne = (n: number, exps: number[]): number => {
        const tempMs = [];
        for (var i = 1; i <= n; i++) {
            tempMs.push(
                exps[i - 1]
                * i
                * Math.pow(this.binom(n, i), exps[i - 1])
                * Math.pow(this.Mimg, (i * (exps[i - 1] - 1)))
            );
        }
        const m1 = tempMs.reduce((a, b) => Math.max(a, b))
        return m1;
    }

    /**
     * Returns the M_2 constant of the polynomial, described in the paper
     * 
     * @param n rank of the polynomial
     * @param exps exponents of symmetric functions of the polynomial
     * @returns teh M_2 constant of the polynomial
     */
    MCapitolTwo = (n: number, exps: number[]): number => {
        const tempMs = [];
        for (var i = 1; i <= n; i++) {
            tempMs.push(
                Math.pow(this.binom(n, i), exps[i - 1])
                * Math.pow(this.Mimg, (i * exps[i - 1]))
            );
        }
        const m2 = Math.pow((tempMs.reduce((a, b) => Math.max(a, b))), (n - 1));
        return m2;
    }

    /**
     * Returns the geneo constant C with which divide the geneo matrix
     * 
     * @param polynomial polynomial from which extract the constant
     * @returns the constant C
     */
    getGeneoConstant(polynomial: string): number {

        var ply = this.LaTeXToPolyGen(polynomial);
        var regex = /(-?\d*.?\d+)?\*?s\((\d+)\)(\^\{(-?\d*.?\d+)\})?/g;
        var match;
        var n = this.rankPoly;
        var coefficients: number[] = [];
        var exponents: number[][] = [];

        var count = 0;

        // collect the coefficients of the symmetric functions
        while (match = regex.exec(ply)) {
            if (match[1] !== undefined) {
                coefficients.push(+(match[1]));
                count++;
            }
        }

        // fill the exponents of the "cont" symmetric functions with 0
        for (var i = 0; i < count; i++) {
            exponents.push(new Array(n).fill(0));
        }
        count = 0;

        while (match = regex.exec(ply)) {
            // if the coefficient is not defined, I'm still in the same symmetric function
            if (match[1] === undefined) {
                count--;
            }

            // if the exponent is not specified, it is 1 oderwise it is the specified value
            if (match[4] !== undefined) {
                exponents[count][parseInt(match[2]) - 1] = +(match[4]);
            }
            else {
                exponents[count][parseInt(match[2]) - 1] = 1;
            }

            count++;
        }

        // calculate the C with all the M_1 and M_2 constants and the result times n
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
        this.group.permutants.forEach((permutant) => {
            switch (permutant.internalName) {
                case "lin":
                    var values = [0];
                    if (permutant.value) {
                        var tempPermVal = permutant.value;
                        const x = this.group.unknowns.find((unknown) => unknown.label === "x");
                        const y = this.group.unknowns.find((unknown) => unknown.label === "y");
                        if (x && y) {
                            tempPermVal = tempPermVal.replace("x", x.value);
                            tempPermVal = tempPermVal.replace("y", y.value);
                        }
                        values = tempPermVal.split(",").map(Number);
                    }
                    parser.set(permutant.label,
                        this.spaceMovement(values[0], values[1]));
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

                default:
                    break;
            }
        });

        //parsing multiplication
        parser.set('m', (...args: number[][]) => {
            let matrices: Matrix[];
            matrices = args.map((arg) => {
                return CanvasUtils.canvasToMatrix(arg, this.canvasSize);
            });
            return this.multiplyMatrices(matrices);
        });

        // parsing division
        parser.set('f', (...args: number[][]) => {
            let matrices: Matrix[];
            matrices = args.map((arg) => {
                return CanvasUtils.canvasToMatrix(arg, this.canvasSize);
            });
            return this.divideMatrices(matrices);
        });

        // parsing power
        parser.set('p', (base: number[], exp: number) => {
            var baseMatrix = CanvasUtils.canvasToMatrix(base, this.canvasSize);
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
            var matrixResult = CanvasUtils.canvasToMatrix(result, this.canvasSize);
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