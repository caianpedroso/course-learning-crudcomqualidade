import { HttpNotFoundError } from "@server/infra/errors";
import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";

async function get(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query;
    const page = Number(query.page);
    const limit = Number(query.limit);

    if (query.page && isNaN(page)) {
        res.status(400).json({
            error: {
                message: "`page` must be a number",
            },
        });
        return;
    }

    if (query.limit && isNaN(limit)) {
        res.status(400).json({
            error: {
                message: "`limit` must be a number",
            },
        });
        return;
    }

    const output = await todoRepository.get({
        page: page,
        limit: limit,
    });

    res.status(200).json({
        todos: output.todos,
        pages: output.pages,
        total: output.total,
    });
    return;
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});
async function create(req: NextApiRequest, res: NextApiResponse) {
    // Fail Fast Validation

    const body = TodoCreateBodySchema.safeParse(req.body);

    if (!body.success) {
        // Type Narrowing
        res.status(400).json({
            error: {
                message: "You need to provide a content to create a TODO",
                description: body.error.issues,
            },
        });
        return;
    }

    //Retornar um erro, caso não tenha `content`
    const createdTodo = await todoRepository.createByContent(body.data.content);
    res.status(201).json({
        todo: createdTodo,
    });
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
    const todoId = req.query.id;

    if (!todoId || typeof todoId !== "string") {
        res.status(400).json({
            error: {
                message: "You must to provide a string ID",
            },
        });
        return;
    }

    try {
        const updatedTodo = await todoRepository.toggleDone(todoId);

        res.status(200).json({
            todo: updatedTodo,
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(404).json({
                error: {
                    message: err.message,
                },
            });
        }
    }
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
    // TODO Validate query schema;
    const QuerySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });

    // Fail Fast
    const parserQuery = QuerySchema.safeParse(req.query);
    if (!parserQuery.success) {
        res.status(400).json({
            error: {
                message: `You must to provide a valid id`,
            },
        });
        return;
    }

    try {
        const todoId = parserQuery.data.id;
        await todoRepository.deleteById(todoId);

        res.status(204).end();
    } catch (err) {
        if (err instanceof HttpNotFoundError) {
            return res.status(err.status).json({
                error: {
                    message: err.message,
                },
            });
        }
        res.status(500).json({
            error: {
                message: `Internal server error`,
            },
        });
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById,
};
