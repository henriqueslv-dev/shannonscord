// ==========================
// NOTIFICAÇÕES
// ==========================

function mostrarNotificacao(tipo, titulo, mensagem) {

    const notificacao = document.createElement("div");

    notificacao.className = `notification ${tipo}`;

    notificacao.innerHTML = `
        <div class="notification-icon">
            ${tipo === "sucesso" ? "✓" : tipo === "erro" ? "✕" : "!"}
        </div>

        <div class="notification-content">

            <div class="notification-title">
                ${titulo}
            </div>

            <div class="notification-message">
                ${mensagem}
            </div>

        </div>
    `;

    document.body.appendChild(notificacao);

    setTimeout(() => {
        notificacao.classList.add("show");
    }, 10);

    setTimeout(() => {

        notificacao.classList.remove("show");

        setTimeout(() => {
            notificacao.remove();
        }, 300);

    }, 3000);
}


// ==========================
// LOGIN
// ==========================

const API_URL = "http://127.0.0.1:8000";

class ErroRequisicaoApi extends Error {
    constructor(mensagem, status = null) {
        super(mensagem);
        this.status = status;
    }
}

async function enviarRequisicaoApi(endpoint, dados, metodo = "POST") {
    let resposta;
    const opcoes = {
        method: metodo
    };

    if (dados) {
        opcoes.headers = {
            "Content-Type": "application/json"
        };
        opcoes.body = JSON.stringify(dados);
    }

    try {
        resposta = await fetch(`${API_URL}${endpoint}`, opcoes);
    } catch {
        throw new ErroRequisicaoApi(
            "Não foi possível conectar à API. Verifique se o servidor está ativo."
        );
    }

    let resultado;

    try {
        resultado = await resposta.json();
    } catch {
        throw new ErroRequisicaoApi(
            "A API retornou uma resposta inválida.",
            resposta.status
        );
    }

    if (!resposta.ok) {
        const mensagem =
            typeof resultado.detail === "string"
                ? resultado.detail
                : "Não foi possível concluir a solicitação.";

        throw new ErroRequisicaoApi(mensagem, resposta.status);
    }

    return resultado;
}

const loginForm =
    document.querySelector("#login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.querySelector("#login-email").value.trim();

        const senha =
            document.querySelector("#login-senha").value;

        if (!email || !senha) {

            mostrarNotificacao(
                "aviso",
                "Atenção",
                "Preencha todos os campos."
            );

            return;
        }

        if (!email.includes("@")) {

            mostrarNotificacao(
                "erro",
                "E-mail inválido",
                "Digite um e-mail válido."
            );

            return;
        }

        try {
            const resultado = await enviarRequisicaoApi("/login", {
                email: email,
                senha: senha
            });

            if (!resultado.nome || !resultado.email) {
                mostrarNotificacao(
                    "erro",
                    "Erro no login",
                    "A API retornou dados incompletos do usuário."
                );

                return;
            }

            const usuario = {
                id: resultado.id,
                nome: resultado.nome,
                email: resultado.email
            };

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuario)
            );

            mostrarNotificacao(
                "sucesso",
                "Login realizado!",
                "Bem-vindo ao ShannonsCord."
            );

            setTimeout(() => {
                window.location.href = "home.html";
            }, 1200);
        } catch (erro) {
            if (erro.status === 401) {
                mostrarNotificacao(
                    "erro",
                    "Login inválido",
                    "E-mail ou senha incorretos."
                );
            } else {
                mostrarNotificacao(
                    "erro",
                    "Erro no login",
                    erro.message
                );
            }
        }

    });
}


// ==========================
// CADASTRO
// ==========================

const cadastroForm =
    document.querySelector("#cadastro-form");

if (cadastroForm) {

    cadastroForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const nome =
            document.querySelector("#cadastro-nome").value.trim();

        const email =
            document.querySelector("#cadastro-email").value.trim();

        const senha =
            document.querySelector("#cadastro-senha").value;

        const confirmarSenha =
            document.querySelector("#cadastro-confirmar").value;

        if (
            !nome ||
            !email ||
            !senha ||
            !confirmarSenha
        ) {

            mostrarNotificacao(
                "aviso",
                "Atenção",
                "Preencha todos os campos."
            );

            return;
        }

        if (nome.length < 2) {

            mostrarNotificacao(
                "erro",
                "Nome inválido",
                "Digite um nome válido."
            );

            return;
        }

        if (!email.includes("@")) {

            mostrarNotificacao(
                "erro",
                "E-mail inválido",
                "Digite um e-mail válido."
            );

            return;
        }

        if (senha.length < 6) {

            mostrarNotificacao(
                "aviso",
                "Senha muito curta",
                "A senha precisa ter pelo menos 6 caracteres."
            );

            return;
        }

        if (senha !== confirmarSenha) {

            mostrarNotificacao(
                "erro",
                "Senhas diferentes",
                "As senhas precisam ser iguais."
            );

            return;
        }

        try {
            await enviarRequisicaoApi("/usuarios", {
                nome: nome,
                email: email,
                senha: senha
            });

            mostrarNotificacao(
                "sucesso",
                "Conta criada!",
                "Sua conta foi criada com sucesso."
            );

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        } catch (erro) {
            if (/já (?:está )?cadastrado|ja (?:esta )?cadastrado/i.test(erro.message)) {
                mostrarNotificacao(
                    "erro",
                    "E-mail já cadastrado",
                    "Use outro e-mail para criar sua conta."
                );
            } else {
                mostrarNotificacao(
                    "erro",
                    "Erro no cadastro",
                    erro.message
                );
            }
        }

    });
}


// ==========================
// ELEMENTOS DA HOME
// ==========================

const messageForm =
    document.querySelector(".message-form");

const messageInput =
    document.querySelector(".message-input");

const messages =
    document.querySelector(".messages");

const criarGrupo =
    document.querySelector("#criar-grupo");

const groupModal =
    document.querySelector("#group-modal");

const groupName =
    document.querySelector("#group-name");

const groupCreate =
    document.querySelector("#group-create");

const groupCancel =
    document.querySelector("#group-cancel");

const currentGroupName =
    document.querySelector("#current-group-name");

const currentChannelName =
    document.querySelector("#current-channel-name");

const serverList =
    document.querySelector("#server-list");

const criarCanal =
    document.querySelector("#criar-canal");

const channelModal =
    document.querySelector("#channel-modal");

const channelName =
    document.querySelector("#channel-name");

const channelCancel =
    document.querySelector("#channel-cancel");

const channelCreate =
    document.querySelector("#channel-create");

const channelList =
    document.querySelector("#channel-list");

const membersTitle =
    document.querySelector("#members-title");

const membersList =
    document.querySelector("#members-list");

const homeContainer =
    document.querySelector("#home-container");

const homeButton =
    document.querySelector("#abrir-inicio");

const welcomeName =
    document.querySelector("#welcome-name");

const dashboardUsername =
    document.querySelector("#dashboard-username");

const dashboardAvatar =
    document.querySelector("#dashboard-avatar");

const friendsList =
    document.querySelector("#friends-list");

const friendsCount =
    document.querySelector("#friends-count");


// ==========================
// HOME
// ==========================

function atualizarHome() {

    if (!homeContainer) {
        return;
    }

    const usuario =
        JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    const nome =
        usuario && usuario.nome
            ? usuario.nome
            : "amigo";

    if (welcomeName) {
        welcomeName.textContent =
            nome === "amigo" ? "" : `, ${nome}`;
    }

    if (dashboardUsername) {
        dashboardUsername.textContent =
            usuario && usuario.nome ? usuario.nome : "Minha conta";
    }

    if (dashboardAvatar) {
        dashboardAvatar.textContent =
            nome.charAt(0).toUpperCase();
    }

    if (!friendsList || !friendsCount) {
        return;
    }

    const amigosSalvos =
        JSON.parse(localStorage.getItem("amigos") || "[]");

    const amigos =
        Array.isArray(amigosSalvos)
            ? amigosSalvos
                .map((amigo) => {
                    if (typeof amigo === "string") {
                        return amigo.trim();
                    }

                    if (!amigo || typeof amigo !== "object") {
                        return "";
                    }

                    const nomeAmigo =
                        [amigo.nome, amigo.username, amigo.name]
                            .find((valor) => typeof valor === "string");

                    return nomeAmigo ? nomeAmigo.trim() : "";
                })
                .filter(Boolean)
            : [];

    friendsList.replaceChildren();
    friendsCount.textContent =
        `${amigos.length} ${amigos.length === 1 ? "amigo" : "amigos"}`;

    if (amigos.length === 0) {
        const emptyState =
            document.createElement("p");

        emptyState.className = "friends-empty";
        emptyState.textContent =
            "Sua lista de amigos aparecerá aqui quando você adicionar alguém.";

        friendsList.appendChild(emptyState);
        return;
    }

    amigos.forEach((nomeAmigo) => {

        const friendCard =
            document.createElement("article");

        friendCard.className = "friend-card";

        const avatar =
            document.createElement("span");

        avatar.className = "friend-avatar";
        avatar.textContent =
            nomeAmigo.trim().charAt(0).toUpperCase() || "?";

        const info =
            document.createElement("div");

        info.className = "friend-info";

        const friendName =
            document.createElement("h3");

        friendName.textContent = nomeAmigo;

        const status =
            document.createElement("p");

        status.textContent = "Amigo";

        info.append(friendName, status);
        friendCard.append(avatar, info);
        friendsList.appendChild(friendCard);
    });
}

function abrirInicio() {

    if (!homeContainer) {
        return;
    }

    homeContainer.classList.add("is-home");

    document
        .querySelectorAll("#server-list .server")
        .forEach((server) => server.classList.remove("server-selected"));

    if (homeButton) {
        homeButton.classList.add("server-selected");
        homeButton.setAttribute("aria-current", "page");
    }

    document
        .querySelectorAll("#server-list .server")
        .forEach((server) => server.removeAttribute("aria-current"));
}

if (homeButton) {
    homeButton.addEventListener("click", abrirInicio);
}

atualizarHome();


// ==========================
// CANAL ATUAL
// ==========================

let canalAtual = "geral";
let canaisDoServidor = [];
let idServidorDosCanais = null;
let requisicaoCanaisAtual = 0;
let canaisCarregando = false;


// ==========================
// MEMBROS DO CANAL
// ==========================

function obterMembrosDoCanal(grupoNome, canalNome) {

    const membrosPorCanal =
        JSON.parse(localStorage.getItem("membrosDoCanal")) || {};

    const chave = grupoNome + "_" + canalNome;
    const todasMensagens =
        JSON.parse(localStorage.getItem("mensagens")) || {};

    const autoresDasMensagens =
        (todasMensagens[chave] || [])
            .map((mensagem) => mensagem.nome)
            .filter(Boolean);

    return [...new Set([
        ...(membrosPorCanal[chave] || []),
        ...autoresDasMensagens
    ])];
}

function registrarMembroNoCanal(nome, grupoNome, canalNome) {

    if (!nome || !grupoNome || !canalNome) {
        return;
    }

    const membrosPorCanal =
        JSON.parse(localStorage.getItem("membrosDoCanal")) || {};

    const chave = grupoNome + "_" + canalNome;
    const membros = membrosPorCanal[chave] || [];

    if (!membros.includes(nome)) {
        membros.push(nome);
        membrosPorCanal[chave] = membros;

        localStorage.setItem(
            "membrosDoCanal",
            JSON.stringify(membrosPorCanal)
        );
    }
}

function atualizarMembrosDoCanal() {

    if (!membersTitle || !membersList) {
        return;
    }

    const grupoNome = localStorage.getItem("grupoAtual");

    if (!grupoNome) {
        membersTitle.textContent = "MEMBROS - 0";
        membersList.innerHTML = "";
        return;
    }

    const usuario =
        JSON.parse(localStorage.getItem("usuarioLogado"));

    const membros = obterMembrosDoCanal(grupoNome, canalAtual);

    if (usuario && usuario.nome && !membros.includes(usuario.nome)) {
        registrarMembroNoCanal(usuario.nome, grupoNome, canalAtual);
        membros.push(usuario.nome);
    }

    membersTitle.textContent = "MEMBROS - " + membros.length;
    membersList.innerHTML = "";

    membros.forEach((nome) => {
        const membro = document.createElement("div");
        membro.className = "member";

        const avatar = document.createElement("div");
        avatar.className = "member-avatar";
        avatar.textContent = nome.charAt(0).toUpperCase();

        const nomeMembro = document.createElement("span");
        nomeMembro.textContent = nome;

        membro.append(avatar, nomeMembro);
        membersList.appendChild(membro);
    });
}


// ==========================
// CHAT
// ==========================

if (
    messageForm &&
    messageInput &&
    messages
) {

    messageForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const texto =
            messageInput.value.trim();

        if (!texto) {
            return;
        }

        const usuario =
            JSON.parse(
                localStorage.getItem("usuarioLogado")
            );

        const nome =
            usuario
                ? usuario.nome
                : "Usuário";

        const grupoNome =
            localStorage.getItem("grupoAtual");

        if (!grupoNome || !canalAtual) {
            return;
        }

        const chave =
            grupoNome + "_" + canalAtual;

        const todasMensagens =
            JSON.parse(
                localStorage.getItem("mensagens")
            ) || {};

        if (!todasMensagens[chave]) {
            todasMensagens[chave] = [];
        }

        const agora =
            new Date();

        const mensagem = {

            nome: nome,

            texto: texto,

            hora: agora.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )

        };

        todasMensagens[chave].push(
            mensagem
        );

        localStorage.setItem(
            "mensagens",
            JSON.stringify(todasMensagens)
        );

        registrarMembroNoCanal(
            nome,
            grupoNome,
            canalAtual
        );

        atualizarMembrosDoCanal();

        adicionarMensagemNaTela(
            mensagem
        );

        messageInput.value = "";

        messages.scrollTop =
            messages.scrollHeight;

    });

}


// ==========================
// ADICIONAR MENSAGEM NA TELA
// ==========================

function adicionarMensagemNaTela(mensagem) {

    if (!messages) {
        return;
    }

    const elemento =
        document.createElement("div");

    elemento.className = "message";

    const inicial =
        mensagem.nome
            .charAt(0)
            .toUpperCase();

    elemento.innerHTML = `

        <div class="message-avatar">
            ${inicial}
        </div>

        <div class="message-content">

            <div class="message-info">

                <strong>
                    ${mensagem.nome}
                </strong>

                <span>
                    ${mensagem.hora}
                </span>

            </div>

            <p>
                ${mensagem.texto}
            </p>

        </div>

    `;

    messages.appendChild(elemento);
}


// ==========================
// CRIAR GRUPO
// ==========================

if (criarGrupo) {

    criarGrupo.addEventListener("click", () => {

        groupModal.classList.add("show");

        groupName.value = "";

        groupName.focus();

    });

}


// ==========================
// CANCELAR GRUPO
// ==========================

if (groupCancel) {

    groupCancel.addEventListener("click", () => {

        groupModal.classList.remove("show");

        groupName.value = "";

    });

}


// ==========================
// CONFIRMAR GRUPO
// ==========================

let gruposSalvos = [];

if (groupCreate) {

    groupCreate.addEventListener("click", async () => {

        const nome =
            groupName.value.trim();

        if (!nome) {

            mostrarNotificacao(
                "aviso",
                "Nome vazio",
                "Digite um nome para o grupo."
            );

            return;
        }

        const grupoExiste =
            gruposSalvos.some(
                (grupo) =>
                    grupo.nome.toLowerCase() ===
                    nome.toLowerCase()
            );

        if (grupoExiste) {

            mostrarNotificacao(
                "aviso",
                "Grupo já existe",
                "Já existe um grupo com esse nome."
            );

            return;
        }

        const usuario =
            JSON.parse(localStorage.getItem("usuarioLogado") || "null");

        if (!usuario || !Number.isInteger(Number(usuario.id)) || Number(usuario.id) < 1) {
            mostrarNotificacao(
                "erro",
                "Sessão inválida",
                "Entre novamente para criar um servidor."
            );

            return;
        }

        try {
            const resultado = await enviarRequisicaoApi("/servers", {
                nome: nome,
                dono_id: Number(usuario.id)
            });

            if (
                !Number.isInteger(Number(resultado.id)) ||
                Number(resultado.id) < 1 ||
                typeof resultado.nome !== "string" ||
                !resultado.nome
            ) {
                throw new Error("A API retornou dados inválidos do servidor criado.");
            }

            const grupo = {
                id: Number(resultado.id),
                nome: resultado.nome,
                inicial: resultado.nome.charAt(0).toUpperCase()
            };

            gruposSalvos.push(grupo);
            adicionarGrupoNaTela(grupo);

            groupModal.classList.remove("show");
            groupName.value = "";

            selecionarGrupo(grupo);

            mostrarNotificacao(
                "sucesso",
                "Grupo criado!",
                `O grupo "${grupo.nome}" foi criado.`
            );
        } catch (erro) {
            mostrarNotificacao(
                "erro",
                "Erro ao criar servidor",
                erro.message
            );
        }

    });

}


// ==========================
// ADICIONAR GRUPO NA TELA
// ==========================

function adicionarGrupoNaTela(grupo) {

    if (!serverList) {
        return;
    }

    const elemento =
        document.createElement("button");

    elemento.className = "server";
    elemento.type = "button";

    elemento.textContent =
        grupo.inicial;

    elemento.title =
        grupo.nome;

    elemento.setAttribute("aria-label", grupo.nome);
    if (grupo.id !== undefined) {
        elemento.setAttribute("data-server-id", String(grupo.id));
    }

    elemento.addEventListener(
        "click",
        () => {

            selecionarGrupo(
                grupo
            );

        }
    );

    serverList.appendChild(
        elemento
    );
}


// ==========================
// SELECIONAR GRUPO
// ==========================

function selecionarGrupo(grupo, abrirGrupo = true) {

    localStorage.setItem(
        "grupoAtual",
        grupo.nome
    );
    if (grupo.id !== undefined) {
        localStorage.setItem(
            "servidorAtualId",
            String(grupo.id)
        );
    }

    if (abrirGrupo && homeContainer) {
        homeContainer.classList.remove("is-home");
    }

    if (abrirGrupo && homeButton) {
        homeButton.classList.remove("server-selected");
        homeButton.removeAttribute("aria-current");
    }

    if (currentGroupName) {

        currentGroupName.textContent =
            grupo.nome;

    }

    document
        .querySelectorAll(".server")
        .forEach((server) => {

            server.classList.remove(
                "server-selected"
            );
            server.removeAttribute("aria-current");

            const mesmoServidor = grupo.id !== undefined
                ? server.getAttribute("data-server-id") === String(grupo.id)
                : server.title === grupo.nome;

            if (abrirGrupo && mesmoServidor) {

                server.classList.add(
                    "server-selected"
                );
                server.setAttribute("aria-current", "page");

            }

        });

    carregarCanais(
        grupo.nome,
        grupo.id
    );
}


// ==========================
// CARREGAR GRUPOS
// ==========================

async function carregarGruposDoUsuario() {
    if (!serverList) {
        return;
    }

    const usuario =
        JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    if (!usuario || !Number.isInteger(Number(usuario.id)) || Number(usuario.id) < 1) {
        mostrarNotificacao(
            "erro",
            "Sessão inválida",
            "Entre novamente para carregar seus servidores."
        );

        return;
    }

    try {
        const resultado = await enviarRequisicaoApi(
            `/servers/${encodeURIComponent(Number(usuario.id))}`,
            null,
            "GET"
        );

        if (!Array.isArray(resultado)) {
            throw new Error("A API retornou uma lista de servidores inválida.");
        }

        gruposSalvos = resultado.map((servidor) => {
            if (
                !servidor ||
                !Number.isInteger(Number(servidor.id)) ||
                Number(servidor.id) < 1 ||
                typeof servidor.nome !== "string" ||
                !servidor.nome
            ) {
                throw new Error("A API retornou dados inválidos de um servidor.");
            }

            return {
                id: Number(servidor.id),
                nome: servidor.nome,
                inicial: servidor.nome.charAt(0).toUpperCase()
            };
        });

        serverList.innerHTML = "";
        gruposSalvos.forEach(adicionarGrupoNaTela);

        if (gruposSalvos.length === 0) {
            return;
        }

        const servidorAtualId =
            localStorage.getItem("servidorAtualId");
        const grupoAtual =
            localStorage.getItem("grupoAtual");
        const grupoSelecionado =
            gruposSalvos.find((grupo) => String(grupo.id) === servidorAtualId) ||
            gruposSalvos.find((grupo) => grupo.nome === grupoAtual) ||
            gruposSalvos[0];

        selecionarGrupo(grupoSelecionado, false);
    } catch (erro) {
        mostrarNotificacao(
            "erro",
            "Erro ao carregar servidores",
            erro.message
        );
    }
}

carregarGruposDoUsuario();


// ==========================
// CARREGAR CANAIS
// ==========================

async function carregarCanais(grupoNome, serverId) {

    if (!channelList) {
        return;
    }

    const requisicao = ++requisicaoCanaisAtual;
    channelList.innerHTML = "";
    canaisDoServidor = [];
    canalAtual = "";
    limparCanalSelecionado();
    const numeroServidor = Number(serverId);

    if (!Number.isInteger(numeroServidor) || numeroServidor < 1) {
        idServidorDosCanais = null;
        canaisCarregando = false;
        mostrarNotificacao(
            "erro",
            "Servidor inválido",
            "Não foi possível identificar o servidor para carregar os canais."
        );
        return;
    }

    idServidorDosCanais = numeroServidor;
    canaisCarregando = true;

    try {
        const resultado = await enviarRequisicaoApi(
            `/servers/${encodeURIComponent(numeroServidor)}/channels`,
            null,
            "GET"
        );

        if (requisicao !== requisicaoCanaisAtual) {
            return;
        }

        if (!Array.isArray(resultado)) {
            throw new Error("A API retornou uma lista de canais inválida.");
        }

        canaisDoServidor = resultado.map((canal) => {
            if (
                !canal ||
                typeof canal.nome !== "string" ||
                !canal.nome.trim() ||
                (canal.server_id !== undefined &&
                    Number(canal.server_id) !== numeroServidor)
            ) {
                throw new Error("A API retornou dados inválidos de um canal.");
            }

            return {
                id: canal.id,
                nome: canal.nome.trim(),
                server_id: canal.server_id
            };
        });

        canaisDoServidor.forEach((canal) => {
            adicionarCanalNaTela(canal.nome);
        });

        if (canaisDoServidor.length === 0) {
            canalAtual = "";
            limparCanalSelecionado();
            return;
        }

        const canalInicial =
            canaisDoServidor.find(
                (canal) => canal.nome.toLowerCase() === "geral"
            ) || canaisDoServidor[0];

        trocarCanal(canalInicial.nome);
    } catch (erro) {
        if (requisicao === requisicaoCanaisAtual) {
            canalAtual = "";
            canaisDoServidor = [];
            channelList.innerHTML = "";
            limparCanalSelecionado();
            mostrarNotificacao(
                "erro",
                "Erro ao carregar canais",
                erro.message
            );
        }
    } finally {
        if (requisicao === requisicaoCanaisAtual) {
            canaisCarregando = false;
        }
    }
}

function limparCanalSelecionado() {
    if (currentChannelName) {
        currentChannelName.textContent = "# sem canais";
    }

    if (messageInput) {
        messageInput.placeholder = "Crie um canal para começar";
    }

    if (messages) {
        messages.innerHTML = "";
    }

    if (membersTitle) {
        membersTitle.textContent = "MEMBROS - 0";
    }

    if (membersList) {
        membersList.innerHTML = "";
    }
}


// ==========================
// ADICIONAR CANAL NA TELA
// ==========================

function adicionarCanalNaTela(nome) {

    if (!channelList) {
        return;
    }

    const canal =
        document.createElement("div");

    canal.className =
        "channel";

    canal.textContent =
        "# " + nome;

    canal.title =
        nome;

    canal.addEventListener(
        "click",
        () => {

            trocarCanal(
                nome
            );

        }
    );

    channelList.appendChild(
        canal
    );
}


// ==========================
// TROCAR DE CANAL
// ==========================

function trocarCanal(nome) {

    canalAtual =
        nome;

    atualizarMembrosDoCanal();

    if (currentChannelName) {

        currentChannelName.textContent =
            "# " + nome;

    }

    if (messageInput) {

        messageInput.placeholder =
            "Enviar mensagem em #" + nome;

    }

    document
        .querySelectorAll(".channel")
        .forEach((canal) => {

            canal.classList.remove(
                "channel-selected"
            );

            if (
                canal.title ===
                nome
            ) {

                canal.classList.add(
                    "channel-selected"
                );

            }

        });

    if (!messages) {
        return;
    }

    messages.innerHTML = "";

    const grupoNome =
        localStorage.getItem(
            "grupoAtual"
        );

    const todasMensagens =
        JSON.parse(
            localStorage.getItem(
                "mensagens"
            )
        ) || {};

    const chave =
        grupoNome + "_" + nome;

    const mensagensDoCanal =
        todasMensagens[chave] || [];

    if (
        mensagensDoCanal.length === 0
    ) {

        const mensagem =
            document.createElement("div");
        mensagem.className = "message";

        const conteudo =
            document.createElement("div");
        conteudo.className = "message-content";

        const informacoes =
            document.createElement("div");
        informacoes.className = "message-info";

        const autor =
            document.createElement("strong");
        autor.textContent = "ShannonsCord";

        const horario =
            document.createElement("span");
        horario.textContent = "Agora";

        informacoes.append(autor, horario);

        const texto =
            document.createElement("p");
        texto.textContent = `Você entrou no canal #${nome}.`;

        conteudo.append(informacoes, texto);
        mensagem.appendChild(conteudo);

        messages.appendChild(
            mensagem
        );

        return;
    }

    mensagensDoCanal.forEach(
        (mensagem) => {

            adicionarMensagemNaTela(
                mensagem
            );

        }
    );
}


// Mantém a lista sincronizada quando outra aba altera os dados locais.
window.addEventListener("storage", (event) => {

    if (
        event.key === "membrosDoCanal" ||
        event.key === "mensagens" ||
        event.key === "grupoAtual" ||
        event.key === "usuarioLogado"
    ) {
        atualizarMembrosDoCanal();
    }
});


// ==========================
// ABRIR MODAL DE CANAL
// ==========================

if (criarCanal) {

    criarCanal.addEventListener(
        "click",
        () => {

            channelModal.classList.add(
                "show"
            );

            channelName.value = "";

            channelName.focus();

        }
    );
}


// ==========================
// CANCELAR CANAL
// ==========================

if (channelCancel) {

    channelCancel.addEventListener(
        "click",
        () => {

            channelModal.classList.remove(
                "show"
            );

            channelName.value = "";

        }
    );
}


// ==========================
// CRIAR NOVO CANAL
// ==========================

if (channelCreate) {

    channelCreate.addEventListener(
        "click",
        async () => {

            const nome =
                channelName.value.trim();

            if (!nome) {

                mostrarNotificacao(
                    "aviso",
                    "Nome vazio",
                    "Digite um nome para o canal."
                );

                return;
            }

            const grupoNome =
                localStorage.getItem(
                    "grupoAtual"
                );

            if (!grupoNome) {

                mostrarNotificacao(
                    "erro",
                    "Nenhum grupo selecionado",
                    "Selecione um grupo antes de criar um canal."
                );

                return;
            }

            const servidorId =
                Number(localStorage.getItem("servidorAtualId"));

            if (
                !Number.isInteger(servidorId) ||
                servidorId < 1 ||
                servidorId !== idServidorDosCanais
            ) {
                mostrarNotificacao(
                    "erro",
                    "Servidor inválido",
                    "Selecione um servidor válido antes de criar um canal."
                );

                return;
            }

            if (canaisCarregando) {
                mostrarNotificacao(
                    "aviso",
                    "Aguarde",
                    "Os canais do servidor ainda estão sendo carregados."
                );

                return;
            }

            const canalExiste =
                canaisDoServidor.some(
                    (canal) =>
                        canal.nome.toLowerCase() ===
                        nome.toLowerCase()
                );

            if (canalExiste) {

                mostrarNotificacao(
                    "aviso",
                    "Canal já existe",
                    `O canal #${nome} já existe neste grupo.`
                );

                return;
            }

            channelCreate.disabled = true;

            try {
                const resultado = await enviarRequisicaoApi("/channels", {
                    nome: nome,
                    server_id: servidorId
                });

                if (
                    !resultado ||
                    typeof resultado.nome !== "string" ||
                    !resultado.nome.trim() ||
                    (resultado.server_id !== undefined &&
                        Number(resultado.server_id) !== servidorId)
                ) {
                    throw new Error("A API retornou dados inválidos do canal criado.");
                }

                const canalCriado = {
                    id: resultado.id,
                    nome: resultado.nome.trim(),
                    server_id: resultado.server_id
                };

                const servidorAindaSelecionado =
                    Number(localStorage.getItem("servidorAtualId")) === servidorId &&
                    localStorage.getItem("grupoAtual") === grupoNome;

                if (servidorAindaSelecionado) {
                    if (idServidorDosCanais === servidorId && !canaisCarregando) {
                        canaisDoServidor.push(canalCriado);
                        adicionarCanalNaTela(canalCriado.nome);
                        trocarCanal(canalCriado.nome);
                    } else {
                        await carregarCanais(grupoNome, servidorId);
                        if (canaisDoServidor.some((canal) => canal.nome === canalCriado.nome)) {
                            trocarCanal(canalCriado.nome);
                        }
                    }
                }

                channelModal.classList.remove("show");
                channelName.value = "";

                mostrarNotificacao(
                    "sucesso",
                    "Canal criado!",
                    `O canal #${canalCriado.nome} foi criado.`
                );
            } catch (erro) {
                mostrarNotificacao(
                    "erro",
                    "Erro ao criar canal",
                    erro.message
                );
            } finally {
                channelCreate.disabled = false;
            }

        }
    );
}


// ==========================
// FECHAR MODAL CLICANDO FORA
// ==========================

if (channelModal) {

    channelModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                channelModal
            ) {

                channelModal.classList.remove(
                    "show"
                );

            }

        }
    );
}


if (groupModal) {

    groupModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                groupModal
            ) {

                groupModal.classList.remove(
                    "show"
                );

            }

        }
    );
}
