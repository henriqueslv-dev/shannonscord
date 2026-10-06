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

class Canal(BaseModel):
    nome: str
    server_id: int


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

@app.get("/servers/{usuario_id}")
def listar_servidores(usuario_id: int):
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
            SELECT
                s.id,
                s.nome,
                s.dono_id,
                s.criado_em
            FROM servers s
            INNER JOIN server_members sm
                ON s.id = sm.server_id
            WHERE sm.user_id = %s
            ORDER BY s.criado_em;
            """,
            (usuario_id,)
        )

        servidores = cursor.fetchall()

        return [
            {
                "id": servidor[0],
                "nome": servidor[1],
                "dono_id": servidor[2],
                "criado_em": servidor[3]
            }
            for servidor in servidores
        ]

    finally:
        cursor.close()
        conexao.close()

@app.post("/channels")
def criar_canal(canal: Canal):
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        # Verifica se o servidor existe
        cursor.execute(
            """
            SELECT id
            FROM servers
            WHERE id = %s;
            """,
            (canal.server_id,)
        )

        servidor = cursor.fetchone()

        if not servidor:
            raise HTTPException(
                status_code=404,
                detail="Servidor não encontrado."
            )

        # Cria o canal
        cursor.execute(
            """
            INSERT INTO channels (nome, server_id)
            VALUES (%s, %s)
            RETURNING id, nome, server_id, criado_em;
            """,
            (canal.nome, canal.server_id)
        )

        novo_canal = cursor.fetchone()

        conexao.commit()

        return {
            "mensagem": "Canal criado com sucesso!",
            "id": novo_canal[0],
            "nome": novo_canal[1],
            "server_id": novo_canal[2],
            "criado_em": novo_canal[3]
        }

    except HTTPException:
        conexao.rollback()
        raise

    except Exception as erro:
        conexao.rollback()
        print("Erro:", erro)

        raise HTTPException(
            status_code=500,
            detail="Erro ao criar canal."
        )

    finally:
        cursor.close()
        conexao.close()

@app.get("/servers/{server_id}/channels")
def listar_canais(server_id: int):
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        # Verifica se o servidor existe
        cursor.execute(
            """
            SELECT id
            FROM servers
            WHERE id = %s;
            """,
            (server_id,)
        )

        servidor = cursor.fetchone()

        if not servidor:
            raise HTTPException(
                status_code=404,
                detail="Servidor não encontrado."
            )

        # Busca os canais do servidor
        cursor.execute(
            """
            SELECT id, nome, server_id, criado_em
            FROM channels
            WHERE server_id = %s
            ORDER BY criado_em;
            """,
            (server_id,)
        )

        canais = cursor.fetchall()

        return [
            {
                "id": canal[0],
                "nome": canal[1],
                "server_id": canal[2],
                "criado_em": canal[3]
            }
            for canal in canais
        ]

    finally:
        cursor.close()
        conexao.close()