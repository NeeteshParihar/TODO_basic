import { Schema, model } from "mongoose";

// Just the raw data shape
export interface ITodo {
    title: string;
    date: Date;
    isCompleted: boolean;
    user: Schema.Types.ObjectId | string
}



const TodoSchema = new Schema<ITodo>({
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }
});

TodoSchema.index({ user: 1, date: -1 }, { unique: true });
const Todo = model<ITodo>("Todo", TodoSchema);

export default Todo;
