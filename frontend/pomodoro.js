const visor = document.querySelector(".timer-conteudo h2");
const statusTimer = document.querySelector(".status-timer");
const btnIniciar = document.querySelector(".btn-iniciar");
const btnReiniciar = document.querySelector(".btn-reiniciar");
const abas = document.querySelectorAll(".abas .aba");

const tempoFocadoEl = document.querySelector(".tempo-focado");
const totalSessoesEl = document.querySelector(".total-sessoes");

const tempoMetaEl = document.querySelector(".tempo-meta");
const progressoEl = document.querySelector(".progresso");
const percentualMetaEl = document.querySelector(".percentual-meta");
const inputMeta = document.querySelector("#meta-minutos");
const valorMetaEl = document.querySelector(".valor-meta");

const nomeUsuarioEl = document.querySelector(".nome-usuario");
const btnSair = document.querySelector(".btn-sair");

const listaTarefas = document.querySelector(".lista-tarefas");
const formTarefa = document.querySelector(".form-tarefa");
const inputTarefa = formTarefa.querySelector("input");
const btnNovaTarefa = document.querySelector(".nova-tarefa");
const painelTarefas = document.querySelector(".tarefas");
const btnAlternarTarefas = document.querySelector(".alternar-tarefas");
const resumoTarefas = document.querySelector(".resumo-tarefas");

const nomeSalvo = sessionStorage.getItem("nomeUsuario");

if (nomeSalvo) {
    nomeUsuarioEl.textContent = nomeSalvo;
}

btnSair.addEventListener("click", function () {
    sessionStorage.removeItem("nomeUsuario");
    window.location.href = "/login";
});

const modalidades = [
    { tempo: 25 * 60, status: "TEMPO DE FOCO", botao: "▶ Iniciar foco" },
    { tempo: 5 * 60, status: "PAUSA CURTA", botao: "▶ Iniciar pausa" },
    { tempo: 15 * 60, status: "PAUSA LONGA", botao: "▶ Iniciar pausa" }
];

const dadosSalvos = JSON.parse(localStorage.getItem("pomodoroFlowPainel")) || {
    tarefas: [],
    segundosFocados: 0,
    sessoesConcluidas: 0
};

let modalidadeAtual = modalidades[0];
let segundosRestantes = modalidadeAtual.tempo;
let intervalo = null;
let fimEm = null;
let segundosFocados = dadosSalvos.segundosFocados;
let sessoesConcluidas = dadosSalvos.sessoesConcluidas;
let diaEstatisticas = dadosSalvos.diaEstatisticas || new Date().toDateString();
let metaMinutos = Number(dadosSalvos.metaMinutos) || 120;
inputMeta.value = metaMinutos;

function salvarDados() {
    const tarefas = Array.from(listaTarefas.querySelectorAll(".tarefa")).map(function (tarefa) {
        return {
            texto: tarefa.querySelector("span").textContent,
            concluida: tarefa.querySelector("input").checked
        };
    });

    const dados = {
        tarefas: tarefas,
        segundosFocados: segundosFocados,
        sessoesConcluidas: sessoesConcluidas,
        diaEstatisticas: diaEstatisticas,
        metaMinutos: metaMinutos
    };

    localStorage.setItem("pomodoroFlowPainel", JSON.stringify(dados));
}

function atualizarVisor() {
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;

    visor.textContent =
        String(minutos).padStart(2, "0") + ":" +
        String(segundos).padStart(2, "0");
}

function atualizarEstatisticas() {
    const minutos = Math.floor(segundosFocados / 60);
    const segundos = segundosFocados % 60;

    tempoFocadoEl.textContent = `${minutos}min ${segundos}s`;
    totalSessoesEl.textContent = `${sessoesConcluidas} sessões`;

    const horasMeta = Math.floor(segundosFocados / 3600);
    const minutosMeta = Math.floor((segundosFocados % 3600) / 60);
    const metaSegundos = metaMinutos * 60;
    const porcentagem = Math.min(100, Math.floor((segundosFocados / metaSegundos) * 100));

    tempoMetaEl.textContent = `${horasMeta}h ${minutosMeta}min`;
    progressoEl.style.width = `${porcentagem}%`;
    percentualMetaEl.textContent = `${porcentagem}% concluído`;
    const horasObjetivo = Math.floor(metaMinutos / 60);
    const minutosObjetivo = metaMinutos % 60;
    valorMetaEl.textContent = `/ ${horasObjetivo}h ${minutosObjetivo}min`;
}



function verificarNovoDia() {
    const hoje = new Date().toDateString();

    if (diaEstatisticas !== hoje) {
        diaEstatisticas = hoje;
        segundosFocados = 0;
        sessoesConcluidas = 0;
        atualizarEstatisticas();
        salvarDados();
    }
}

function pararCronometro() {
    clearInterval(intervalo);
    intervalo = null;
    fimEm = null;
}

function atualizarCronometro() {
    verificarNovoDia();

    const novoTempo = Math.max(0, Math.ceil((fimEm - Date.now()) / 1000));
    const segundosPassados = segundosRestantes - novoTempo;

    if (segundosPassados <= 0) {
        return;
    }

    segundosRestantes = novoTempo;
    atualizarVisor();

    if (modalidadeAtual === modalidades[0]) {
        segundosFocados += segundosPassados;
        atualizarEstatisticas();
        salvarDados();
    }

    if (segundosRestantes === 0) {
        pararCronometro();

        if (modalidadeAtual === modalidades[0]) {
            sessoesConcluidas++;
            atualizarEstatisticas();
            salvarDados();
        }

        btnIniciar.textContent = modalidadeAtual.botao;
    }
}

btnIniciar.addEventListener("click", function () {
    if (intervalo !== null) {
        atualizarCronometro();

        if (intervalo !== null) {
            pararCronometro();
            btnIniciar.textContent = "▶ Continuar";
        }

        return;
    }

    if (segundosRestantes === 0) {
        segundosRestantes = modalidadeAtual.tempo;
        atualizarVisor();
    }

    fimEm = Date.now() + segundosRestantes * 1000;
    btnIniciar.textContent = "⏸ Pausar";

    intervalo = setInterval(atualizarCronometro, 1000);
});

document.addEventListener("visibilitychange", function () {
    if (!document.hidden && intervalo !== null) {
        atualizarCronometro();
    }
});

btnReiniciar.addEventListener("click", function () {
    if (intervalo !== null) {
    atualizarCronometro();
    }
    pararCronometro();
    segundosRestantes = modalidadeAtual.tempo;
    atualizarVisor();
    btnIniciar.textContent = modalidadeAtual.botao;
});

abas.forEach(function (aba, indice) {
    aba.addEventListener("click", function () {
        if (intervalo !== null) {
        atualizarCronometro();
        }
        pararCronometro();

        modalidadeAtual = modalidades[indice];
        segundosRestantes = modalidadeAtual.tempo;

        statusTimer.textContent = modalidadeAtual.status;
        btnIniciar.textContent = modalidadeAtual.botao;
        atualizarVisor();

        abas.forEach(function (outraAba) {
            outraAba.classList.remove("ativa");
        });

        aba.classList.add("ativa");
    });
});

function abrirFormulario() {
    formTarefa.hidden = false;
    inputTarefa.focus();
}

btnNovaTarefa.addEventListener("click", abrirFormulario);
btnAlternarTarefas.addEventListener("click", function () {
    painelTarefas.classList.toggle("recolhida");

    const estaAberto = !painelTarefas.classList.contains("recolhida");

    btnAlternarTarefas.setAttribute("aria-label", estaAberto ? "Recolher tarefas" : "Abrir tarefas");
    btnAlternarTarefas.setAttribute("aria-expanded", String(estaAberto));
});

function atualizarResumoTarefas() {
    const total = listaTarefas.querySelectorAll(".tarefa").length;
    const concluidas = listaTarefas.querySelectorAll(".tarefa.concluida").length;

    resumoTarefas.textContent = `${concluidas} de ${total} concluídas`;
}

function criarTarefa(texto, concluida = false) {
    const tarefa = document.createElement("div");
    const checkbox = document.createElement("input");
    const nomeTarefa = document.createElement("span");
    const btnExcluir = document.createElement("button");

    tarefa.classList.add("tarefa");
    checkbox.type = "checkbox";
    checkbox.checked = concluida;
    nomeTarefa.textContent = texto;

    btnExcluir.type = "button";
    btnExcluir.textContent = "✕";
    btnExcluir.classList.add("btn-excluir");
    btnExcluir.setAttribute("aria-label", "Excluir tarefa");

    tarefa.classList.toggle("concluida", concluida);

    checkbox.addEventListener("change", function () {
        tarefa.classList.toggle("concluida", checkbox.checked);
        atualizarResumoTarefas();
        salvarDados();
    });

    btnExcluir.addEventListener("click", function () {
        tarefa.remove();
        atualizarResumoTarefas();
        salvarDados();
    });

    tarefa.append(checkbox, nomeTarefa, btnExcluir);
    listaTarefas.append(tarefa);

    atualizarResumoTarefas();
}

formTarefa.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const texto = inputTarefa.value.trim();

    if (texto === "") {
        return;
    }

    criarTarefa(texto);
    salvarDados();

    formTarefa.reset();
    inputTarefa.focus();
});

dadosSalvos.tarefas.forEach(function (tarefa) {
    criarTarefa(tarefa.texto, tarefa.concluida);
});

inputMeta.addEventListener("change", function () {
    metaMinutos = Math.min(1440, Math.max(1, Number(inputMeta.value) || 120));
    inputMeta.value = metaMinutos;

    atualizarEstatisticas();
    salvarDados();
});

verificarNovoDia();
atualizarEstatisticas();
atualizarResumoTarefas();