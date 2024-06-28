import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { get } from 'aws-amplify/api';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);
  async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }

    result += decoder.decode(); // Decodificar los últimos datos
    return result;
}
  async function createTodo() {
    console.log('Creating todo...');
    try {
      const restOperation = get({ 
        apiName: 'myRestApi',
        path: 'items' 
      });
      const response = await restOperation.response;
      if (response.body) {
        const responseBody = await readStream(response.body);
        console.log('GET call succeeded: ', responseBody);
    } else {
        console.log('GET call succeeded but response body is empty');
    }
    } catch (error) {
      console.log('GET call failed: ');
    }
    
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo. Ronald Niño
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;
