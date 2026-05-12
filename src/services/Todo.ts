import Todo from "../models/Todo.js";
import { Schema, Types } from "mongoose";

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
  isCompleted: boolean | undefined
}


export const getTodoByDateRange = async ({
  userId,
  startDate,
  endDate,
  cursor,
  limit = 15,
  isCompleted
}: IQuery) => {


  const dateFilter: { $gte?: Date; $lte?: Date; $lt?: string } = {};
  if (startDate) dateFilter.$gte = new Date(startDate) as Date;
  if (cursor) dateFilter.$lt = cursor;
  else if (endDate) dateFilter.$lte = new Date(endDate) as Date;

  const query: { isCompleted?: boolean | undefined, user: string, date?: object | undefined } = {
    user: userId,
  }

  // we can't add empty property in the object , so we check the length of the object
  if (Object.keys(dateFilter).length !== 0) query.date = dateFilter;

  // if isComplete is undeinfed that means we want both type of todos 
  if (typeof isCompleted === "boolean") query.isCompleted = isCompleted;

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


interface ITodoAggregateResult {
  hour: number;
  minutes: number[];
}


// this function will give the number of todos in each minute of the day with respect to the hour of the day  
// this way we can show the user exact time where he/she can add there todos 
// e.g. if user has not added any todo from 11:00 to 12:00 then it will show 0 in that range 
// this way user can see the exact time where he/she can add there todos 
export const getTodoGraph = async ({
  userId,
  targetDate
}: {
  userId: string
  targetDate: string | Date
}) => {


  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const pipeline = [
    {
      // Step 1: Filter for the specific 24-hour range
      $match: {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        user: new Types.ObjectId(userId), // it has to be this type 
      }
    },
    {
      // Step 2: Extract hour and minute from the date field
      $project: {
        hour: { $hour: "$date" }, // get the hour
        minute: { $minute: "$date" } // get the minute
      }
    },
    {
      // Step 3: Group by hour and collect unique minutes into an array
      $group: {
        _id: "$hour",
        minutes: { $addToSet: "$minute" }
      }
    },
    {
      // Step 4: Sort by hour (0 to 23)
      $sort: { "_id": 1 }
    },
    {
      // Step 5: Final formatting to make the hour the key
      $project: {
        hour: "$_id",
        minutes: 1,
        _id: 0
      }
    }
  ];

  const todos = await Todo.aggregate<ITodoAggregateResult>(pipeline);

  const graph: Record<number, number[]> = {};
  todos.forEach((item) => {
    graph[item.hour] = item.minutes;
  });

  return graph;
}