const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const database = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;
const intializedbserver = async () => {
  try {
    db = open({
      filename: database,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log("database error:", e.message);
    process.exit(1);
  }
};
const gettodofn = (eachtodo) => {
  return {
    id: eachtodo.id,
    todo: eachtodo.todo,
    priority: eachtodo.priority,
    status: eachtodo.status,
  };
};
const statusupdate = (status) => {
  return status !== undefined;
};
const priorityupdate = (priority) => {
  return priority !== undefined;
};
const todosometask = (todotask) => {
  return todotask !== undefined;
};
const haspriorityandstatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const haspriority = (requestquery) => {
  return requestquery.priority !== undefined;
};
const hasstatus = (requestquery) => {
  return requestquery.status !== undefined;
};
app.get("/todos/?status=TO%20DO", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let gettodosquery = "";
  let data = null;
  switch (true) {
    case haspriorityandstatus(request.query):
      gettodosquery = `select * from todo where todo like '%${search_q}%' and status='${status}' and priority='${priority};`;
      break;

    case haspriority(request.query):
      gettodosquery = `select * from todo where priority= '${priority};`;
      break;
    case hasstatus(request.query):
      gettodosquery = `select * from todo where status='${status}';`;
      break;
    default:
      gettodosquery = `select * from todo like '%${search_q}%';`;
  }
  data = await db.all(gettodosquery);
  response.send(data);
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettquery = `select * from todo where id=${todoId};`;
  const dbresponse = await db.get(gettquery);
  response.send(gettodofn(dbresponse));
});
app.post("/todos/", async (request, response) => {
  const { todo, priority, status } = request.body;
  const createrecord = `insert into todo(todo,priority,status) values("${todo}","${priority}","${status}");`;
  const dbresponse = await db.run(createrecord);
  response.send("Todo Successfully Added");
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  let dbresponse = null;
  let updatequery = "";
  switch (true) {
    case statusupdate(request.body.status):
      updatequery = `upadte todo set status='${status}' where id=${todoId};`;
      dbresponse = await db.run(updatequery);
      response.send("Status Updated");
      break;
    case priorityupdate(request.body.priority):
      updatequery = `update todo set priority='${priority}' where id=${todoId};`;
      dbresponse = await db.run(updatequery);
      response.send("Priority Updated");
      break;
    case todosometask(request.body.todo):
      updatequery = `update todo set todo ='${todo}' where id=${todoId};`;
      dbresponse = await db.run(updatequery);
      response.send("Todo Updated");
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequery = `delete from todo where id=${todoId};`;
  const dbresponse = await db.run(deletequery);
  dbresponse.send("Todo Deleted");
});

module.exports = app;
