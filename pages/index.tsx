import React from "react";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { todoController } from "@ui/controller/todo";

const bg = "/bg.jpeg";

interface HomePage {
    id: string;
    content: string;
    done: boolean;
}

export default function Page() {
    const initialLoadComplete = React.useRef(false);
    const [newTodoContent, setNewTodoContent] = React.useState("");
    const [totalPages, setTotalPages] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [todos, setTodos] = React.useState<HomePage[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const homeTodos = todoController.filterTodosByContent<HomePage>(
        search,
        todos,
    );

    const hasMorePages = totalPages > page;
    const hasNoTodos = homeTodos.length === 0 && !isLoading;

    // Load infos onload
    React.useEffect(() => {
        if (!initialLoadComplete.current) {
            todoController
                .get({ page })
                .then(({ todos, pages }) => {
                    setTodos(todos);
                    setTotalPages(pages);
                })
                .finally(() => {
                    setIsLoading(false);
                    initialLoadComplete.current = true;
                });
        }
    }, []);

    return (
        <main>
            <GlobalStyles themeName="devsoutinho" />
            <header
                style={{
                    backgroundImage: `url('${bg}')`,
                }}
            >
                <div className="typewriter">
                    <h1>O que fazer hoje?</h1>
                </div>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        todoController.create({
                            content: newTodoContent,
                            onSuccess(todo: HomePage) {
                                setTodos((oldTodos) => {
                                    return [todo, ...oldTodos];
                                });
                                setNewTodoContent("");
                            },
                            onError(customMessage) {
                                alert(
                                    customMessage ||
                                        "Você precisa ter um conteúdo para criar uma TODO!",
                                );
                            },
                        });
                    }}
                >
                    <input
                        name="add-todo"
                        type="text"
                        placeholder="Correr, Estudar..."
                        value={newTodoContent}
                        onChange={function newTodoHandler(event) {
                            setNewTodoContent(event.target.value);
                        }}
                    />
                    <button type="submit" aria-label="Adicionar novo item">
                        +
                    </button>
                </form>
            </header>

            <section>
                <form>
                    <input
                        type="text"
                        placeholder="Filtrar lista atual, ex: Dentista"
                        value={search}
                        onChange={function handleSearch(event) {
                            // eslint-disable-next-line no-console
                            // console.log("Change ! ", event.target.value);
                            setSearch(event.target.value);
                        }}
                    />
                </form>

                <table border={1}>
                    <thead>
                        <tr>
                            <th align="left">
                                <input type="checkbox" disabled />
                            </th>
                            <th align="left">Id</th>
                            <th align="left">Conteúdo</th>
                            <th />
                        </tr>
                    </thead>

                    <tbody>
                        {homeTodos.map((currentTodo) => {
                            return (
                                <tr key={currentTodo.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            defaultChecked={currentTodo.done}
                                            onChange={function handleToogle() {
                                                todoController.toggleDone({
                                                    id: currentTodo.id,
                                                    onError() {
                                                        alert(
                                                            "Falha ao atualizar a TODO :(",
                                                        );
                                                    },
                                                    updateTodoOnScreen() {
                                                        setTodos(
                                                            (
                                                                currentTodosCheck,
                                                            ) => {
                                                                return currentTodosCheck.map(
                                                                    (
                                                                        currentTodoCheck,
                                                                    ) => {
                                                                        if (
                                                                            currentTodoCheck.id ===
                                                                            currentTodo.id
                                                                        ) {
                                                                            return {
                                                                                ...currentTodoCheck,
                                                                                done: !currentTodoCheck.done,
                                                                            };
                                                                        }
                                                                        return currentTodoCheck;
                                                                    },
                                                                );
                                                            },
                                                        );
                                                    },
                                                });
                                            }}
                                        />
                                    </td>
                                    <td>{currentTodo.id.substring(0, 4)}</td>
                                    <td>
                                        {!currentTodo.done &&
                                            currentTodo.content}
                                        {currentTodo.done && (
                                            <s>{currentTodo.content}</s>
                                        )}
                                    </td>
                                    <td align="right">
                                        <button
                                            data-type="delete"
                                            onClick={function handleClick() {
                                                todoController
                                                    .deleteById(currentTodo.id)
                                                    .then(() => {
                                                        setTodos((cTodos) => {
                                                            return cTodos.filter(
                                                                (cTodo) => {
                                                                    return (
                                                                        cTodo.id !==
                                                                        currentTodo.id
                                                                    );
                                                                },
                                                            );
                                                        });
                                                    })
                                                    .catch(() => {
                                                        console.error(
                                                            "Failed to delete",
                                                        );
                                                    });
                                            }}
                                        >
                                            Apagar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {isLoading && (
                            <tr>
                                <td
                                    colSpan={4}
                                    align="center"
                                    style={{ textAlign: "center" }}
                                >
                                    Carregando...
                                </td>
                            </tr>
                        )}

                        {hasNoTodos && (
                            <tr>
                                <td colSpan={4} align="center">
                                    Nenhum item encontrado
                                </td>
                            </tr>
                        )}
                        {hasMorePages && (
                            <tr>
                                <td
                                    colSpan={4}
                                    align="center"
                                    style={{ textAlign: "center" }}
                                >
                                    <button
                                        data-type="load-more"
                                        onClick={() => {
                                            setIsLoading(true);
                                            const nextPage = page + 1;
                                            setPage(nextPage);

                                            todoController
                                                .get({ page: nextPage })
                                                .then(({ todos, pages }) => {
                                                    setTodos((oldTodos) => {
                                                        return [
                                                            ...oldTodos,
                                                            ...todos,
                                                        ];
                                                    });
                                                    setTotalPages(pages);
                                                })
                                                .finally(() => {
                                                    setIsLoading(false);
                                                });
                                        }}
                                    >
                                        Pagina {page}, Carregar mais{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                marginLeft: "4px",
                                                fontSize: "1.2em",
                                            }}
                                        >
                                            ↓
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>
        </main>
    );
}
