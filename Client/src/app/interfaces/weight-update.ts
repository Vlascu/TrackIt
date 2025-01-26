export interface WeightUpdate {
    id: number;
    month: number;
    day: number;
    year: number;
    newWeightValue: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        bodyWeight: number;
        height: number;
        bmi: number;
        age: number;
    };
}
