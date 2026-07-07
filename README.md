# Harmonic

Sistema web para gerenciamento e compartilhamento de avaliações de músicas, permitindo que usuários publiquem, editem e curtam reviews.

---

# Tecnologias Utilizadas

## Front-end
- React
- Vite
- TypeScript
- Axios

## Back-end
- Node.js
- Express
- TypeScript
- Knex

## Infraestrutura
- Docker
- Docker Compose

---

# Arquitetura

O projeto utiliza o padrão de projeto **Repository**.

Fluxo da aplicação:

Routes → Controllers → Services → Repositories → Banco de Dados

### Responsabilidades

- **Controllers:** recebem as requisições HTTP.
- **Services:** implementam as regras de negócio.
- **Repositories:** realizam o acesso ao banco de dados.
- **Schemas:** validam os dados recebidos.
- **Middlewares:** autenticação e outras validações.

---

# Instalação


## Clonar o projeto

```bash
git clone https://github.com/kauanschiavon/Harmonic.git
cd crud-harmonic
```

## Configuração

Criar o arquivo:

```
backend/.env
```

Conteúdo:

```env
DATABASE_URL=
JWT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
FRONTEND_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Executar

npm install 
```bash
docker compose up --build
```

Após iniciar os containers, acesse:

http://localhost:3000

---

# Estrutura do Projeto

backend/
├── controllers
├── database
├── middlewares
├── repositories
├── routes
├── schemas
├── services

frontend/
├── components
├── pages
├── services


---

# Padrão de Projeto

Foi utilizado o padrão **Repository**, que separa a lógica de acesso ao banco de dados das regras de negócio da aplicação.

Essa separação facilita:
- manutenção;
- organização do código;
- testes;
- troca da tecnologia de persistência sem alterar as regras de negócio.