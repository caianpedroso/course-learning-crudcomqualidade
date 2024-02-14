const BASE_URL = "http://localhost:3000";

describe("/ - Todos feed", () => {
    it("when load, renders the page", () => {
        cy.visit(BASE_URL);
    });
    it("when create a new todo, it must appears in screen", () => {
        // 0 -  Inter
        cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
            request.reply({
                statusCode: 201,
                body: {
                    todo: {
                        id: "8486e02c-5630-42c5-b374-b36e873cce7e",
                        date: "2024-02-13T11:19:00.999Z",
                        content: "digitar alguma coisa teste",
                        done: false,
                    },
                },
            });
        }).as("createTodo");
        // 1 - Abrir a página
        cy.visit(BASE_URL);
        // 2 - Selecionar o input de criar nova todo
        // 3 - Digitar no input de criar nova todo
        const inputAddTodo = "input[name='add-todo']";
        cy.get(inputAddTodo).type("Test todo");

        // 4 - Clicar no botão
        const buttonAddTodo = "[aria-label='Adicionar novo item']";
        cy.get(buttonAddTodo).click();
        // 5 - Chacar se na página surgiu um novo elemento
        cy.get("table > tbody").contains("digitar alguma coisa teste");
    });
});
