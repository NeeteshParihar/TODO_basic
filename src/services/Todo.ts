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
    .limit(limit + 1)
    .sort({ date: -1 }); // sort

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
      new: true,runValidators: true
    },
  );
  return updatedTodo;
};
