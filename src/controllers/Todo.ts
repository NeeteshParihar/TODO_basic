import { type Response, type Request } from "express";
import { Types } from "mongoose";
import {
  createTodoInDb,
  deleteTodoInDb,
  getTodosInDb,
  updateTodoInDb,
  getTodoByDateRange,
  getTodoGraph
} from "../services/Todo.js";

export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, date } = res.locals.validatedBody;
    const userId = String(req.user!.userId);
    console.log("inside the createTodo");
    console.log({title, date});
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
    // Use sanitized & coerced data from res.locals (limit is already a number, cursor is already typed)
    const { limit = 10, cursor = null } = res.locals.validatedQuery;

    const { todos, hasNextPage, nextCursor } = await getTodosInDb(
      cursor as string | null,
      limit as number,
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
    const { title, date, isCompleted } = res.locals.validatedBody;

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

export const getTodosByDateRange = async (req: Request, res: Response) => {

  try {
    const userId = String(req.user!.userId);
    // All values are already sanitized and coerced by Zod via res.locals
    const { cursor, limit = 15, isCompleted, startDate, endDate } = res.locals.validatedQuery;

    const { todos, hasNextPage, nextCursor } = await getTodoByDateRange({
      cursor: cursor ?? null,
      limit: limit as number,
      userId: userId,
      startDate: startDate as Date | undefined,
      endDate: endDate as Date | undefined,
      isCompleted: isCompleted as boolean | undefined
    });

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


export const getTodoGraphController = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user!.userId);
    const {targetDate} = res.locals.validatedQuery
    const graph = await getTodoGraph({
      userId,
      targetDate,
    });
    res.status(200).json({
      success: true,
      data: {
        graph,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
}



