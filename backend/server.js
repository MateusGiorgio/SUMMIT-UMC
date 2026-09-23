const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const caminhoFrontend = path.join(__dirname, "../frontend");
const tarefas = []

app.use(express.json());
app.use(express.static(caminhoFrontend));

app.get("/api/tarefas", (req, res) => {
    res.json(tarefas);
});
app.post("/api/tarefas", (req, res) => {
    const { titulo } = req.body;

    if (!titulo) {
        return res.status(400).json({
            erro: "O título da tarefa é obrigatório"
        });
    }

    const novaTarefa = {
        id: Date.now(),
        titulo: titulo,
        concluida: false
    };

    tarefas.push(novaTarefa);

    res.status(201).json(novaTarefa);
});

app.patch("/api/tarefas/:id", (req, res) => {
    const tarefa = tarefas.find(function (item) {
        return item.id === Number(req.params.id);
    });

    if (!tarefa) {
        return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    if (typeof req.body.concluida !== "boolean") {
        return res.status(400).json({ erro: "Informe true ou false em concluida" });
    }

    tarefa.concluida = req.body.concluida;
    res.json(tarefa);
});

app.delete("/api/tarefas/:id", (req, res) => {
    const indice = tarefas.findIndex(function (item) {
        return item.id === Number(req.params.id);
    });

    if (indice === -1) {
        return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    tarefas.splice(indice, 1);
    res.status(204).send();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(caminhoFrontend, "pomodoro.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(caminhoFrontend, "pomodorologin.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});