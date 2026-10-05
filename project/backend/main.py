from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
import psycopg2

app = FastAPI()

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


def conectar_banco():
    return psycopg2.connect(
        host="127.0.0.1",
        database="shannonscord",
        user="postgres",
        password="Raf214181",
        port=5432
    )


class Usuario(BaseModel):
    nome: str
    email: str
    senha: str


class Login(BaseModel):
    email: str
    senha: str


@app.get("/")
def inicio():
    return {
        "mensagem": "ShannonsCord API funcionando",
        "banco": "PostgreSQL conectado"
    }


@app.post("/usuarios")
def criar_usuario(usuario: Usuario):
    conexao = conectar_banco()
    cursor = conexao.cursor()

    senha_hash = pwd_context.hash(usuario.senha)

    try:
        cursor.execute(
            """
            INSERT INTO users (nome, email, senha)
            VALUES (%s, %s, %s)
            RETURNING id;
            """,
            (usuario.nome, usuario.email, senha_hash)
        )

        usuario_id = cursor.fetchone()[0]
        conexao.commit()

        return {
            "mensagem": "Usuário criado com sucesso!",
            "id": usuario_id,
            "nome": usuario.nome,
            "email": usuario.email
        }

    except psycopg2.errors.UniqueViolation:
        conexao.rollback()

        raise HTTPException(
            status_code=400,
            detail="Este e-mail já está cadastrado."
        )

    finally:
        cursor.close()
        conexao.close()


@app.post("/login")
def fazer_login(login: Login):
    conexao = conectar_banco()
    cursor = conexao.cursor()

    cursor.execute(
        """
        SELECT id, nome, email, senha
        FROM users
        WHERE email = %s;
        """,
        (login.email,)
    )

    usuario = cursor.fetchone()

    cursor.close()
    conexao.close()

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha incorretos."
        )

    senha_correta = pwd_context.verify(
        login.senha,
        usuario[3]
    )

    if not senha_correta:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha incorretos."
        )

    return {
        "mensagem": "Login realizado com sucesso!",
        "id": usuario[0],
        "nome": usuario[1],
        "email": usuario[2]
    }