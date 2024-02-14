import { todoRepository } from "@ui/repository/todo";
import { Todo } from "@ui/schema/todo";
import { z as schema } from "zod";

interface TodoControllerGetParams {
    page: number;
}

async function get(params: TodoControllerGetParams) {
    return todoRepository.get({
        page: params.page,
        limit: 1,
    });
}

function filterTodosByContent<Todo>(
    search: string,
    todos: Array<Todo & { content: string }>,
): Todo[] {
    const homeTodos = todos.filter((todo) => {
        const searchNormalized = search.toLocaleLowerCase();
        const contentNormalized = todo.content.toLocaleLowerCase();
        return contentNormalized.includes(searchNormalized);
    });
    return homeTodos;
}

interface TodoControllerCreatetParams {
    content?: string;
    onSuccess: (todo: Todo) => void;
    onError: (customMessage?: string) => void;
}
function create({ content, onSuccess, onError }: TodoControllerCreatetParams) {
    // Fail Fast
    const parsedParams = schema.string().nonempty().safeParse(content);
    if (!parsedParams.success) {
        onError();
        return;
    }

    todoRepository
        .createByContent(parsedParams.data)
        .then((newTodo) => {
            onSuccess(newTodo);
        })
        .catch(() => {
            onError();
        });
}

interface TodoControllerToggleDoneParams {
    id: string;
    onError: () => void;
    updateTodoOnScreen: () => void;
}

function toggleDone({
    id,
    updateTodoOnScreen,
    onError,
}: TodoControllerToggleDoneParams) {
    // Optmistic Update
    // updateTodoOnScreen()
    todoRepository
        .toggleDone(id)
        .then(() => {
            // Update Real
            updateTodoOnScreen();
        })
        .catch(() => {
            onError();
        });
}

async function deleteById(id: string): Promise<void> {
    const todoId = id;
    todoRepository.deleteById(todoId);
}

export const todoController = {
    get,
    filterTodosByContent,
    create,
    toggleDone,
    deleteById,
};
