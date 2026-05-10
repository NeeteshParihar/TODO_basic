import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  getTodosByDateRange
} from "../controllers/Todo.js";

import { validateJwt } from "../middleware/users.js";
import { validateData } from "../middleware/dataValidation.js";
import { TodoSchema, TodoUpdateSchema, TodoGetSchema, TodoGetByDateRangeSchema } from "../dataValidation/todo.js";


import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(rateLimiter("todos"));


router.post("/", validateJwt, validateData(TodoSchema), createTodo);
router.get("/", validateJwt, validateData(TodoGetSchema, "query"), getTodos);
router.patch("/:id",validateJwt, validateData(TodoUpdateSchema), updateTodo);
router.delete("/:id",validateJwt, deleteTodo);
router.get("/get",validateJwt, validateData(TodoGetByDateRangeSchema, "query"), getTodosByDateRange);



export default router;
