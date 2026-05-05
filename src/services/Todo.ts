import Todo from "../models/Todo.js";
import { Schema } from "mongoose";

export const createTodoInDb = async (
  title: string,
  date: Date,
  userId: string,
) => {
  const newTodo = await Todo.create({
    title,
    date,
    user: userId,
  });
  return newTodo;
};

export const deleteTodoInDb = async (todoId: string) => {
  const deletedTodo = await Todo.findByIdAndDelete(todoId);
  return deletedTodo;
};

export const getTodosInDb = async (
  cursor: string | null,
  limit: number,
  userId: string,
) => {
  let query: { user: string; date?: { $lt: string } } = { user: userId };
  console.log(cursor);
  if (cursor) {
    query.date = { $lt: cursor };
  }

  const todos = await Todo.find(query)
    .sort({ date: -1 })
    .limit(limit + 1)
    .lean(); // sort

  const hasNextPage = todos.length > limit;
  const result = todos.slice(0, limit);
  const nextCursor = hasNextPage ? result[result.length - 1].date : null;

  return {
    todos: result,
    hasNextPage,
    nextCursor,
  };
};

export const updateTodoInDb = async ({
  todoId,
  title,
  date,
  isCompleted,
}: {
  todoId: string;
  title?: string;
  date?: Date;
  isCompleted?: boolean;
}) => {
  const updates: { title?: string; date?: Date; isCompleted?: boolean } = {};

  if (title !== undefined) updates.title = title;
  if (date !== undefined) updates.date = date;
  if (isCompleted !== undefined) updates.isCompleted = isCompleted;

  const updatedTodo = await Todo.findByIdAndUpdate(
    todoId,
    { $set: updates },
    {
      new: true, runValidators: true
    },
  );
  return updatedTodo;
};


interface IQuery {
  userId: string
  startDate: string | Date | undefined
  endDate: string | Date | undefined
  cursor: string | null | undefined
  limit: number
  isCompleted: Boolean
}


export const getTodoByDateRange = async ({
  userId,
  startDate,
  endDate,
  cursor,
  limit = 15,
  isCompleted = false
}: IQuery) => {


  const dateFilter: { $gte?: Date; $lte?: Date; $lt?: string } = {};
  if (startDate) dateFilter.$gte = new Date(startDate) as Date;
  if (cursor) dateFilter.$lt = cursor;
  else if (endDate) dateFilter.$lte = new Date(endDate) as Date;

  const query: { isCompleted: Boolean | undefined, user: string, date?: object | undefined } = {
    isCompleted: isCompleted,
    user: userId,
  }

  if (Object.keys(dateFilter).length !== 0) query.date = dateFilter;
  const todos = await Todo.find(query).sort({ date: -1 }).limit(limit + 1).lean();


  const response = todos.slice(0, limit);
  const hasNextPage = todos.length > limit;
  const nextCursor = hasNextPage ? response[response.length - 1].date : null;

  return {
    todos: response,
    hasNextPage,
    nextCursor,
  };


}