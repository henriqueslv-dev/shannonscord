from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
import psycopg2
from dotenv import load_dotenv
import os
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


def conectar_banco():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT")
    )


class Usuario(BaseModel):
    nome: str
    email: str
    senha: str


class Login(BaseModel):
    email: str
    senha: str

class Servidor(BaseModel):
    nome: str
    dono_id: int


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

@app.post("/servers")
def criar_servidor(servidor: Servidor):
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        # Verifica se o usuário existe
        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE id = %s;
            """,
            (servidor.dono_id,)
        )

        usuario = cursor.fetchone()

        if not usuario:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado."
            )

        # Cria o servidor
        cursor.execute(
            """
            INSERT INTO servers (nome, dono_id)
            VALUES (%s, %s)
            RETURNING id;
            """,
            (servidor.nome, servidor.dono_id)
        )

        servidor_id = cursor.fetchone()[0]

        # Adiciona o dono como membro
        cursor.execute(
            """
            INSERT INTO server_members (server_id, user_id)
            VALUES (%s, %s);
            """,
            (servidor_id, servidor.dono_id)
        )

        conexao.commit()

        return {
            "mensagem": "Servidor criado com sucesso!",
            "id": servidor_id,
            "nome": servidor.nome,
            "dono_id": servidor.dono_id
        }

    except HTTPException:
        conexao.rollback()
        raise

    except Exception as erro:
        conexao.rollback()
        print("Erro:", erro)

        raise HTTPException(
            status_code=500,
            detail="Erro ao criar servidor."
        )

    finally:
        cursor.close()
        conexao.close()