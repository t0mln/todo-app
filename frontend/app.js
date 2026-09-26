const API_URL = "https://todo-app-backend-neon.vercel.app";


// ==============================
// UPDATE TODO
// ==============================

async function updateTodo(todoId, completed) {
  try {
    const response = await fetch(`${API_URL}/api/todos/${todoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        completed: completed
      })
    });

    return response.ok;

  } catch (error) {
    console.error("Could not connect to server", error);
    return false;
  }
}


// ==============================
// HANDLE CHECKBOX
// ==============================

async function handleCheckboxChange(todoId, checkbox) {
  const newCompletedState = checkbox.checked;

  // UI has already changed.
  // Give the user immediate feedback.
  if (newCompletedState) {
    confetti({ particleCount: 200 });
  }

  // API happens in the background.
  const success = await updateTodo(todoId, newCompletedState);

  // If API failed, undo the UI change.
  if (!success) {
    checkbox.checked = !newCompletedState;
  }
}


// ==============================
// DELETE TODO
// ==============================

async function deleteTodo(todoId) {
  try {
    const response = await fetch(
      `${API_URL}/api/todos/${todoId}`,
      {
        method: "DELETE"
      }
    );

    return response.ok;

  } catch (error) {
    console.error("Could not connect to server", error);
    return false;
  }
}


// ==============================
// CREATE TODO ELEMENT
// ==============================

function createTodoElement(todo) {
  const li = document.createElement("li");

  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;

  checkbox.addEventListener("change", () => {
    handleCheckboxChange(li.dataset.id, checkbox);
  });

  li.appendChild(checkbox);


  const titleText = document.createTextNode(todo.title);

  li.appendChild(titleText);


  const deleteButton = document.createElement("button");

  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-button");


  deleteButton.addEventListener("click", async () => {

    // Remember where the task was before removing it.
    const parent = li.parentElement;
    const nextSibling = li.nextSibling;

    // UI changes immediately.
    li.remove();

    // API happens in the background.
    const success = await deleteTodo(li.dataset.id);

    // If deletion failed, restore the task.
    if (!success) {

      if (nextSibling && nextSibling.parentElement === parent) {
        parent.insertBefore(li, nextSibling);
      } else {
        parent.appendChild(li);
      }
    }
  });


  li.appendChild(deleteButton);

  return li;
}


// ==============================
// LOAD TODOS
// ==============================

async function loadTodos() {
  try {
    const response = await fetch(`${API_URL}/api/todos`);

    if (!response.ok) {
      throw new Error("Failed to load todos");
    }

    const todos = await response.json();

    const todoList = document.querySelector("#todo-list");

    for (const todo of todos) {
      const li = createTodoElement(todo);

      todoList.appendChild(li);
    }

    document.querySelector("#loading-message").remove();

  } catch (error) {
    console.error(error);

    document.querySelector("#loading-message").textContent =
      "Failed to load todos.";
  }
}


// ==============================
// LOAD EXISTING TODOS
// ==============================

loadTodos();


// ==============================
// ADD TODO
// ==============================

const input = document.querySelector("#todo-input");
const todoForm = document.querySelector("#todo-form");

todoForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = input.value.trim();

  if (title === "") {
    return;
  }


  // Create a temporary ID for the UI.
  const temporaryId = `temporary-${Date.now()}`;


  // Create the todo immediately in the UI.
  const temporaryTodo = {
    id: temporaryId,
    title: title,
    completed: false
  };


  const todoList = document.querySelector("#todo-list");

  const li = createTodoElement(temporaryTodo);

  todoList.appendChild(li);


  // Clear input immediately.
  input.value = "";

  document.querySelector("#error-message").textContent = "";


  try {

    // Send the request in the background.
    const response = await fetch(`${API_URL}/api/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title
      })
    });


    // API failed.
    if (!response.ok) {

      li.remove();

      const error = await response.json();

      document.querySelector("#error-message").textContent =
        error.error || "Failed to create todo.";

      return;
    }


    // API succeeded.
    const todo = await response.json();


    // Replace temporary ID with the real database ID.
    li.dataset.id = todo.id;

  } catch (error) {

    console.error(error);

    // API/network failed.
    li.remove();

    document.querySelector("#error-message").textContent =
      "Could not connect to the server.";
  }
});


// ==============================
// CLEAR ERROR MESSAGE
// ==============================

input.addEventListener("input", () => {
  document.querySelector("#error-message").textContent = "";
});