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

const loginForm =
    document.querySelector("#login-form");

if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

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

        const usuario =
            JSON.parse(localStorage.getItem("usuario"));

        if (!usuario) {

            mostrarNotificacao(
                "aviso",
                "Nenhuma conta encontrada",
                "Crie uma conta antes de entrar."
            );

            return;
        }

        if (
            email !== usuario.email ||
            senha !== usuario.senha
        ) {

            mostrarNotificacao(
                "erro",
                "Login inválido",
                "E-mail ou senha incorretos."
            );

            return;
        }

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

    });
}


// ==========================
// CADASTRO
// ==========================

const cadastroForm =
    document.querySelector("#cadastro-form");

if (cadastroForm) {

    cadastroForm.addEventListener("submit", (event) => {

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

        const usuarioExistente =
            JSON.parse(localStorage.getItem("usuario"));

        if (
            usuarioExistente &&
            usuarioExistente.email === email
        ) {

            mostrarNotificacao(
                "erro",
                "E-mail já cadastrado",
                "Use outro e-mail para criar sua conta."
            );

            return;
        }

        const usuario = {
            nome: nome,
            email: email,
            senha: senha
        };

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );

        mostrarNotificacao(
            "sucesso",
            "Conta criada!",
            "Sua conta foi criada com sucesso."
        );

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);

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


// ==========================
// CANAL ATUAL
// ==========================

let canalAtual = "geral";


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

        if (!grupoNome) {
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

if (groupCreate) {

    groupCreate.addEventListener("click", () => {

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

        const grupos =
            JSON.parse(
                localStorage.getItem("grupos")
            ) || [];

        const grupoExiste =
            grupos.some(
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

        const grupo = {

            nome: nome,

            inicial:
                nome.charAt(0).toUpperCase()

        };

        grupos.push(grupo);

        localStorage.setItem(
            "grupos",
            JSON.stringify(grupos)
        );

        adicionarGrupoNaTela(
            grupo
        );

        groupModal.classList.remove("show");

        groupName.value = "";

        selecionarGrupo(
            grupo
        );

        mostrarNotificacao(
            "sucesso",
            "Grupo criado!",
            `O grupo "${nome}" foi criado.`
        );

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
        document.createElement("div");

    elemento.className = "server";

    elemento.textContent =
        grupo.inicial;

    elemento.title =
        grupo.nome;

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

function selecionarGrupo(grupo) {

    localStorage.setItem(
        "grupoAtual",
        grupo.nome
    );

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

            if (
                server.title ===
                grupo.nome
            ) {

                server.classList.add(
                    "server-selected"
                );

            }

        });

    carregarCanais(
        grupo.nome
    );
}


// ==========================
// CARREGAR GRUPOS
// ==========================

const gruposSalvos =
    JSON.parse(
        localStorage.getItem("grupos")
    ) || [];

if (serverList) {

    serverList.innerHTML = "";

    gruposSalvos.forEach(
        (grupo) => {

            adicionarGrupoNaTela(
                grupo
            );

        }
    );

}


// ==========================
// SELECIONAR GRUPO INICIAL
// ==========================

const grupoAtual =
    localStorage.getItem("grupoAtual");

if (gruposSalvos.length > 0) {

    let grupoSelecionado =
        gruposSalvos.find(
            (grupo) =>
                grupo.nome === grupoAtual
        );

    if (!grupoSelecionado) {

        grupoSelecionado =
            gruposSalvos[0];

    }

    selecionarGrupo(
        grupoSelecionado
    );
}


// ==========================
// CARREGAR CANAIS
// ==========================

function carregarCanais(grupoNome) {

    if (!channelList) {
        return;
    }

    channelList.innerHTML = "";

    const canais =
        JSON.parse(
            localStorage.getItem("canais")
        ) || {};

    if (!canais[grupoNome]) {

        canais[grupoNome] = [
            "geral"
        ];

        localStorage.setItem(
            "canais",
            JSON.stringify(canais)
        );

    }

    canais[grupoNome].forEach(
        (nome) => {

            adicionarCanalNaTela(
                nome
            );

        }
    );

    trocarCanal(
        "geral"
    );
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

    if (currentChannelName) {

        currentChannelName.textContent =
            "# " + nome;

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
            document.createElement(
                "div"
            );

        mensagem.className =
            "message";

        mensagem.innerHTML = `

            <div class="message-content">

                <div class="message-info">

                    <strong>
                        ShannonsCord
                    </strong>

                    <span>
                        Agora
                    </span>

                </div>

                <p>
                    Você entrou no canal #${nome}.
                </p>

            </div>

        `;

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
        () => {

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

            const canais =
                JSON.parse(
                    localStorage.getItem(
                        "canais"
                    )
                ) || {};

            if (!canais[grupoNome]) {

                canais[grupoNome] = [
                    "geral"
                ];

            }

            const canalExiste =
                canais[grupoNome].some(
                    (canal) =>
                        canal.toLowerCase() ===
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

            canais[grupoNome].push(
                nome
            );

            localStorage.setItem(
                "canais",
                JSON.stringify(
                    canais
                )
            );

            carregarCanais(
                grupoNome
            );

            trocarCanal(
                nome
            );

            channelModal.classList.remove(
                "show"
            );

            channelName.value = "";

            mostrarNotificacao(
                "sucesso",
                "Canal criado!",
                `O canal #${nome} foi criado.`
            );

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