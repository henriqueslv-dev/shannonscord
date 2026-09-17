
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
            <div class="notification-title">${titulo}</div>
            <div class="notification-message">${mensagem}</div>
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

const loginForm = document.querySelector("#login-form");

if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email = document
            .querySelector("#login-email")
            .value
            .trim();

        const senha = document
            .querySelector("#login-senha")
            .value;

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

        const usuario = JSON.parse(
            localStorage.getItem("usuario")
        );

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

const cadastroForm = document.querySelector("#cadastro-form");

if (cadastroForm) {

    cadastroForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const nome = document
            .querySelector("#cadastro-nome")
            .value
            .trim();

        const email = document
            .querySelector("#cadastro-email")
            .value
            .trim();

        const senha = document
            .querySelector("#cadastro-senha")
            .value;

        const confirmarSenha =
            document
                .querySelector("#cadastro-confirmar")
                .value;

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

        const usuarioExistente = JSON.parse(
            localStorage.getItem("usuario")
        );

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
// HOME - CHAT
// ==========================

const messageForm = document.querySelector(".message-form");
const messageInput = document.querySelector(".message-input");
const messages = document.querySelector(".messages");

if (messageForm && messageInput && messages) {

    messageForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const texto = messageInput.value.trim();

        // Não envia mensagem vazia
        if (!texto) {
            return;
        }

        // Pega o usuário logado
        const usuario = JSON.parse(
            localStorage.getItem("usuarioLogado")
        );

        const nome = usuario
            ? usuario.nome
            : "Usuário";

        // Cria a mensagem
        const mensagem = document.createElement("div");

        mensagem.className = "message";

        mensagem.innerHTML = `
            <div class="message-avatar">
                ${nome.charAt(0).toUpperCase()}
            </div>

            <div class="message-content">

                <div class="message-info">
                    <strong>${nome}</strong>
                    <span>Agora</span>
                </div>

                <p>${texto}</p>

            </div>
        `;

        // Adiciona no chat
        messages.appendChild(mensagem);

        // Limpa o campo
        messageInput.value = "";

        // Desce automaticamente para a última mensagem
        messages.scrollTop = messages.scrollHeight;
    });
}

