import express from "express";
import todoRouter from "./todo-router.js";
import userRouter from "./auth-router.js";

const PORT = 3001;
const app = express();
app.use(express.json());

app.use(todoRouter);
app.use(userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
