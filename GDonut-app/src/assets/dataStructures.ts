export class DataStructures {
    static permutants: Array<Permutant> = [
        {
            label: "a_1",
            internalName: "rot",
            description: "rotations around the center of the image by 90 degrees",
            value: "90",
        },
        {
            label: "a_2",
            internalName: "rot",
            description: "rotations around the center of the image by -90 degrees",
            value: "-90",
        },
        {
            label: "a_3",
            internalName: "rot",
            description: "rotations around the center of the image by 180 degrees",
            value: "180",
        },
        {
            label: "a_4",
            internalName: "rot",
            description: "rotations around the center of the image by 360 degrees",
            value: "360",
        },
        {
            label: "a_1",
            internalName: "lin",
            description: "linear translations of (x,y) pixels",
            value: "x,y",
        },
        {
            label: "a_2",
            internalName: "lin",
            description: "linear translations of (y,-x) pixels",
            value: "y,-x",
        },
        {
            label: "a_3",
            internalName: "lin",
            description: "linear translations of (-x,-y) pixels",
            value: "-x,-y",
        },
        {
            label: "a_4",
            internalName: "lin",
            description: "linear translations of (-y,x) pixels",
            value: "-y,x",
        },
    ];

    static groups: Array<Group> = [
        {
            label: "G1",
            description:
                "Group formed by rotations around the center of the image by integer multiples of 90 degrees and the symmetry on the y-axis",
            permutants: [this.permutants[0], this.permutants[1], this.permutants[2], this.permutants[3]],
            unknowns: [],
        },
        {
            label: "G2",
            description:
                "Group formed by rotations around the center of the image by integer multiples of 90 degrees",
            permutants: [this.permutants[4], this.permutants[5], this.permutants[6], this.permutants[7]],
            unknowns: [
                { label: "x", value: "0" },
                { label: "y", value: "0" },
            ],
        },
    ];
}