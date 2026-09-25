async function updateTodo(todoId, completed) {
  try {
    const response = await fetch(`http://localhost:3000/api/todos/${todoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        completed: completed
      })
    });

    if (!response.ok) {
      return false;
    }

    return true;

  } catch (error) {
    console.error("Could not connect to server", error);
    return false;
  }
}

async function handleCheckboxChange(todoId, checkbox) {
  const success = await updateTodo(todoId, checkbox.checked);

  if (!success) {
    checkbox.checked = !checkbox.checked;
  }
}

async function deleteTodo(todoId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/todos/${todoId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Could not connect to server", error);
    return false;
  }
}


async function loadTodos() {
  try {
    const response = await fetch("http://localhost:3000/api/todos");

    if (!response.ok) {
      throw new Error("Failed to load todos");
    }

    const todos = await response.json();

    const todoList = document.querySelector("#todo-list");

    for (const todo of todos) {
      const li = document.createElement("li");

li.dataset.id = todo.id;

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = todo.completed;

checkbox.addEventListener("change", () => {
  handleCheckboxChange(todo.id, checkbox);
});


li.appendChild(checkbox);

const title = document.createTextNode(todo.title);
li.appendChild(title);

const deleteButton = document.createElement("button");

deleteButton.textContent = "Delete";
deleteButton.classList.add("delete-button");

deleteButton.addEventListener("click", async () => {
  const success = await deleteTodo(todo.id);

  if (!success) {
    return;
  }

  li.remove();
});

li.appendChild(deleteButton);

todoList.appendChild(li);
    }

    document.querySelector("#loading-message").remove();
  } catch (error) {
  console.error(error);

  document.querySelector("#loading-message").textContent =
    "Failed to load todos.";
}
}

loadTodos();

const input = document.querySelector("#todo-input");
const todoForm = document.querySelector("#todo-form");
todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();


  const title = input.value;

  try {
    const response = await fetch("http://localhost:3000/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

    

    if (!response.ok) {
      const error = await response.json();

      const errorMessage = document.querySelector("#error-message");
      errorMessage.textContent = error.error;

      return;
    }

    const todo = await response.json();

    document.querySelector("#error-message").textContent = "";
    input.value = "";

   const li = document.createElement("li");
li.dataset.id = todo.id;

const titleText = document.createTextNode(todo.title);


const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = todo.completed;

checkbox.addEventListener("change", () => {
  handleCheckboxChange(todo.id, checkbox);
});

li.appendChild(checkbox);

li.appendChild(titleText);

const deleteButton = document.createElement("button");

deleteButton.textContent = "Delete";
deleteButton.classList.add("delete-button");

deleteButton.addEventListener("click", async () => {
  const success = await deleteTodo(todo.id);

  if (!success) {
    return;
  }

  li.remove();
});

li.appendChild(deleteButton);

document.querySelector("#todo-list").appendChild(li);
  } catch (error) {
  console.error(error);

  const errorMessage = document.querySelector("#error-message");
  errorMessage.textContent = "Could not connect to the server.";
}
}
);

input.addEventListener("input", () => {
  document.querySelector("#error-message").textContent = "";
});