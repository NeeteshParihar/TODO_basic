import { type Response, type Request } from "express";
import { Types, Schema } from "mongoose";
import {
  createTodoInDb,
  deleteTodoInDb,
  getTodosInDb,
  updateTodoInDb,
} from "../services/Todo.js";

export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, date } = req.body;
    const userId = String(req.user!.userId);
    const newTodo = await createTodoInDb(title, date, userId);

    res.status(201).json({
      success: true,
      message: "Todo created successfully!",
      data: {
        todo: newTodo,
      },
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Please choose a different date",
        errorCode: 11000,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user!.userId);
    const todoId = String(req.params.id);
    const deletedTodo = await deleteTodoInDb(todoId);
    if (!deletedTodo)
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

export const getTodos = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user!.userId);
    let { limit = 10 } = req.query;
    limit = Number(limit);

    let cursor: unknown = req.query.cursor;

    if (Array.isArray(cursor) && typeof cursor[0] === "string") {
      cursor = cursor[0];
    } else if (!cursor) cursor = null;

    const { todos, hasNextPage, nextCursor } = await getTodosInDb(
      cursor as string | null,
      limit,
      userId,
    );

    res.status(200).json({
      success: true,
      data: {
        todos,
        hasNextPage,
        nextCursor,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {

   
    let todoId = req.params.id as string;

    const { title, date, isCompleted } = req.body;

    if (!todoId)
      return res.status(400).json({
        success: false,
        message: "Bad request!",
      });



    const updatedTodo = await updateTodoInDb({      
      todoId,
      title,
      date,
      isCompleted,
    });

    if (!updatedTodo)
     return res.status(404).json({
        success: false,
        message: "Todo not found!",
      });

    res.status(200).json({
      success: true,
      message: "Todo Updated successfully",
      data: {
        todo: updatedTodo,
      },
    });


  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Please choose a different date",
        errorCode: 11000,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};
