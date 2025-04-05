import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.urlencoded({ extended: true })); // Para processar os dados do formulário
app.use(express.json());

let db; // Declara a variável db globalmente

// Função para abrir a conexão com o banco de dados SQLite
async function openDatabase() {
    if (!db) { // Verifica se a conexão com o banco já foi estabelecida
        db = await open({
            filename: './banco.db',
            driver: sqlite3.Database
        });
    }
    return db;
}


// Função para apagar os dados de todas as tabelas
const apagarTodosOsDados = async () => {
    try {
        const database = await openDatabase(); // Usa a conexão aberta
        // Desativa a verificação de chaves estrangeiras para evitar erros de integridade
        await database.run('PRAGMA foreign_keys = OFF');
        
        const tables = ['cliente', 'locacao_opcional', 'opcional', 'locacao', 'pagamento', 'seguro', 'tarifa', 'veiculo'];
        for (const table of tables) {
            await database.run(`DELETE FROM ${table}`);
        }

        // Reativa a verificação de chaves estrangeiras
        await database.run('PRAGMA foreign_keys = ON');

        console.log('Todos os dados foram apagados com sucesso.');
    } catch (err) {
        console.error('Erro ao apagar os dados:', err);
    }
};

// Executa a função para apagar os dados
(async () => {
    await apagarTodosOsDados();
})();


async function removerColunaCdLocacao() {
    try {
        const db = await openDatabase();

        // 1. Criar a nova tabela sem a coluna 'cdLocacao'
        await db.run(`
            CREATE TABLE seguro_novo1 (
                cdSeguro INTEGER PRIMARY KEY,
                tipoSeguro TEXT,
                valor REAL
            );
        `);

        // 2. Copiar os dados da tabela original para a nova tabela (sem a coluna 'cdLocacao')
        await db.run(`
            INSERT INTO seguro_novo1 (cdSeguro, tipoSeguro, valor)
            SELECT cdSeguro, tipoSeguro, valor FROM seguro;
        `);

        // 3. Excluir a tabela antiga
        await db.run(`DROP TABLE seguro;`);

        // 4. Renomear a nova tabela para 'seguro'
        await db.run(`ALTER TABLE seguro_novo1 RENAME TO seguro;`);

        console.log('Coluna "cdLocacao" removida com sucesso!');
    } catch (err) {
        console.error('Erro ao remover coluna:', err);
    }
}

// Chamar a função
removerColunaCdLocacao();

// Página inicial com o formulário de cadastro de cliente
app.get('/', (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Cliente</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/11058150-fundo-branco-em-branco-com-design-ondulado-verde-e-simples-adequado-para-fundo-de-apresentacao-vetor.jpg'); /* Caminho relativo para imagem */
                    background-size: cover; /* A imagem vai cobrir toda a tela */
                    background-position: center center; /* A imagem será centralizada */
                    color: white;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem; /* Reduzimos o tamanho da fonte do título */
                    color: #FF7F32;
                    margin-bottom: 10px; /* Diminuímos o espaçamento do título */
                }

                .form-container {
                    background-color: rgba(0, 0, 0, 0.7); /* Fundo escuro e semitransparente */
                    width: 80%; /* Reduzimos a largura para tornar o formulário mais estreito */
                    max-width: 400px; /* Aumentamos a restrição máxima */
                    padding: 20px; /* Diminui o preenchimento */
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 15px; /* Menor espaçamento entre os campos */
                }

                label {
                    font-size: 1.1rem; /* Reduzimos um pouco o tamanho da fonte */
                }

                input {
                    background-color: #555;
                    border: 1px solid #666;
                    color: white;
                    padding: 10px; /* Diminuímos o preenchimento */
                    font-size: 1rem;
                    border-radius: 5px;
                    outline: none;
                    width: 100%;
                }

                input:focus {
                    border-color: #FF7F32;
                }

                button {
                    background-color: #FF7F32;
                    border: none;
                    padding: 12px; /* Diminuímos o preenchimento */
                    font-size: 1rem; /* Reduzimos o tamanho da fonte do botão */
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    width: 100%;
                }

                button:hover {
                    background-color: #e66b23;
                    transform: scale(1.05);
                }

                button:active {
                    transform: scale(0.98);
                }

                .button-container {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 20px;
                }

                .button-container form {
                    margin: 0;
                }

                .form-container input[type="date"] {
                    font-size: 1rem;
                    padding: 12px;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>

            <div class="form-container">
                <h1>Cadastro de Cliente</h1>

                <form action="/adicionarCliente" method="POST">
                    <label for="CPFCliente">CPF:</label>
                    <input type="text" name="CPFCliente" required />

                    <label for="nomeCliente">Nome:</label>
                    <input type="text" name="nomeCliente" required />

                    <label for="telefoneCliente">Telefone:</label>
                    <input type="text" name="telefoneCliente" required />

                    <label for="emailCliente">Email:</label>
                    <input type="email" name="emailCliente" required />

                    <label for="logradouroCliente">Logradouro:</label>
                    <input type="text" name="logradouroCliente" required />

                    <label for="bairroCliente">Bairro:</label>
                    <input type="text" name="bairroCliente" required />

                    <label for="cidadeCliente">Cidade:</label>
                    <input type="text" name="cidadeCliente" required />

                    <label for="estadoCliente">Estado:</label>
                    <input type="text" name="estadoCliente" required />

                    <label for="CEPCliente">CEP:</label>
                    <input type="text" name="CEPCliente" required />

                    <label for="dataNascimento">Data de Nascimento:</label>
                    <input type="date" name="dataNascimento" required />

                    <button type="submit">Cadastrar</button>
                </form>

                <div class="button-container">
                    <form action="/clientes" method="GET">
                        <button type="submit">Ver Todos os Clientes</button>
                    </form>
                </div>
            </div>

        </body>
        </html>
    `);
});



// Rota para adicionar o cliente
app.post('/adicionarCliente', async (req, res) => {
    const { CPFCliente, nomeCliente, telefoneCliente, emailCliente, logradouroCliente, bairroCliente, cidadeCliente, estadoCliente, CEPCliente, dataNascimento } = req.body;

    // Validação dos dados
    if (!CPFCliente || !nomeCliente || !telefoneCliente || !emailCliente || !logradouroCliente || !bairroCliente || !cidadeCliente || !estadoCliente || !CEPCliente || !dataNascimento) {
        return res.status(400).send('Todos os campos são obrigatórios!');
    }

    try {
        const db = await openDatabase();
        await db.run(`INSERT INTO cliente (CPFCliente, nomeCliente, telefoneCliente, emailCliente, logradouroCliente, bairroCliente, cidadeCliente, estadoCliente, CEPCliente, dataNascimento) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [CPFCliente, nomeCliente, telefoneCliente, emailCliente, logradouroCliente, bairroCliente, cidadeCliente, estadoCliente, CEPCliente, dataNascimento]);
        res.redirect('/formularioVeiculo');
    } catch (err) {
        console.error('Erro ao adicionar cliente:', err);
        res.status(500).send('Erro ao cadastrar cliente.');
    }
});



// Rota para exibir todos os clientes
app.get('/clientes', async (req, res) => {
    try {
        const db = await openDatabase();
        const clientes = await db.all('SELECT * FROM cliente');
        
        // Retorna o HTML com a lista de clientes
        res.send(`
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lista de Clientes</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background: linear-gradient(to right, #f8f9fa, #e9ecef); /* Gradiente suave */
                        background-size: cover;
                        color: black;
                        margin: 0;
                        padding: 0;
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                        background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/22286075-em-branco-ondulado-verde-fundo-com-branco-copia-de-espaco-vetor.jpg'); /* Adicionar imagem de fundo suave */
                        background-attachment: fixed;
                    }

                    h1 {
                        text-align: center;
                        font-size: 2rem;
                        color: #FF7F32;
                        margin-bottom: 20px;
                    }

                    .clientes-container {
                        background-color: #28a745; /* Fundo verde para o bloco de clientes */
                        width: 80%;
                        max-width: 600px;
                        padding: 25px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                        background-image: url('https://www.transparenttextures.com/patterns/wood.png'); /* Textura sutil */
                    }

                    ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }

                    li {
                        background-color: white;
                        color: black;
                        padding: 15px;
                        margin-bottom: 10px;
                        border-radius: 8px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }

                    strong {
                        color: #28a745; /* Cor verde para detalhes */
                    }

                    button {
                        background-color: #FF7F32;
                        border: none;
                        padding: 8px 15px;
                        font-size: 1rem;
                        color: white;
                        font-weight: bold;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: all 0.3s ease-in-out;
                        margin-left: 10px;
                    }

                    button:hover {
                        background-color: #e66b23;
                        transform: scale(1.05);
                    }

                    button:active {
                        transform: scale(0.98);
                    }

                    a {
                        margin-top: 20px;
                        color: #FF7F32;
                        font-weight: bold;
                        text-decoration: none;
                    }

                    a:hover {
                        text-decoration: underline;
                    }

                </style>
            </head>
            <body>

                <h1>Lista de Clientes</h1>
                <div class="clientes-container">
                    <ul>
                        ${clientes.map(cliente => 
                            `<li>
                                <strong>Nome:</strong> ${cliente.nomeCliente}, 
                                <strong>Telefone:</strong> ${cliente.telefoneCliente}, 
                                <strong>Email:</strong> ${cliente.emailCliente}, 
                                <strong>CEP:</strong> ${cliente.CEPCliente}
                                <form action="/deletarCliente" method="POST" style="display:inline;">
                                    <input type="hidden" name="CPFCliente" value="${cliente.CPFCliente}">
                                    <button type="submit">Deletar</button>
                                </form>
                                <form action="/atualizarCliente" method="GET" style="display:inline;">
                                    <input type="hidden" name="CPFCliente" value="${cliente.CPFCliente}">
                                    <button type="submit">Editar</button>
                                </form>
                            </li>`
                        ).join('')}
                    </ul>
                    <a href="/">Voltar</a>
                </div>

            </body>
            </html>
        `);
    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        res.status(500).send('Erro ao buscar clientes.');
    }
});



// Rota para deletar cliente
app.post('/deletarCliente', async (req, res) => {
    try {
        const { CPFCliente } = req.body;
        const db = await openDatabase();

        // Deleta o cliente com o CPF informado
        await db.run('DELETE FROM cliente WHERE CPFCliente = ?', [CPFCliente]);
        
        res.redirect('/clientes');  // Redireciona de volta para a lista de clientes
    } catch (err) {
        console.error('Erro ao deletar cliente:', err);
        res.status(500).send('Erro ao deletar cliente.');
    }
});

// Rota para editar cliente
app.get('/atualizarCliente', async (req, res) => {
    try {
        const { CPFCliente } = req.query;
        const db = await openDatabase();

        // Busca o cliente pelo CPF
        const cliente = await db.get('SELECT * FROM cliente WHERE CPFCliente = ?', [CPFCliente]);

        if (cliente) {
            // Exibe o formulário de edição com os dados do cliente
            res.send(`
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Editar Cliente</title>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f4f4f9;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/11058150-fundo-branco-em-branco-com-design-ondulado-verde-e-simples-adequado-para-fundo-de-apresentacao-vetor.jpg'); /* Imagem de fundo */
                            background-size: cover; /* Cobrir toda a tela */
                            background-position: center; /* Centralizar a imagem */
                        }

                        .container {
                            background-color: white;
                            border-radius: 15px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                            padding: 30px;
                            width: 90%;
                            max-width: 400px;
                            opacity: 0.9; /* Para dar um efeito mais suave com a imagem de fundo */
                        }

                        h1 {
                            font-size: 1.5rem;
                            color: #333;
                            margin-bottom: 20px;
                            text-align: center;
                        }

                        label {
                            font-size: 1rem;
                            color: #555;
                            display: block;
                            margin-bottom: 5px;
                        }

                        input {
                            width: 100%;
                            padding: 10px;
                            margin-bottom: 15px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            font-size: 1rem;
                        }

                        button {
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            padding: 10px 15px;
                            font-size: 1rem;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: background-color 0.3s;
                            width: 100%;
                        }

                        button:hover {
                            background-color: #45a049;
                        }

                        a {
                            display: block;
                            text-align: center;
                            margin-top: 10px;
                            color: #4CAF50;
                            text-decoration: none;
                            font-size: 1rem;
                        }

                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Editar Cliente</h1>
                        <form action="/atualizarCliente" method="POST">
                            <input type="hidden" name="CPFCliente" value="${cliente.CPFCliente}">

                            <label for="nomeCliente">Nome:</label>
                            <input type="text" id="nomeCliente" name="nomeCliente" value="${cliente.nomeCliente}" required>

                            <label for="telefoneCliente">Telefone:</label>
                            <input type="text" id="telefoneCliente" name="telefoneCliente" value="${cliente.telefoneCliente}" required>

                            <label for="emailCliente">Email:</label>
                            <input type="email" id="emailCliente" name="emailCliente" value="${cliente.emailCliente}" required>

                            <label for="CEPCliente">CEP:</label>
                            <input type="text" id="CEPCliente" name="CEPCliente" value="${cliente.CEPCliente}" required>

                            <button type="submit">Atualizar</button>
                        </form>
                        <a href="/clientes">Cancelar</a>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.status(404).send('Cliente não encontrado.');
        }
    } catch (err) {
        console.error('Erro ao carregar dados do cliente para edição:', err);
        res.status(500).send('Erro ao carregar dados do cliente.');
    }
});


// Rota para atualizar cliente
app.post('/atualizarCliente', async (req, res) => {
    try {
        const { CPFCliente, nomeCliente, telefoneCliente, emailCliente, CEPCliente } = req.body;
        const db = await openDatabase();

        // Atualiza os dados do cliente no banco de dados
        await db.run('UPDATE cliente SET nomeCliente = ?, telefoneCliente = ?, emailCliente = ?, CEPCliente = ? WHERE CPFCliente = ?', 
            [nomeCliente, telefoneCliente, emailCliente, CEPCliente, CPFCliente]);
        
        res.redirect('/clientes');  // Redireciona de volta para a lista de clientes
    } catch (err) {
        console.error('Erro ao atualizar cliente:', err);
        res.status(500).send('Erro ao atualizar cliente.');
    }
});

app.get('/formularioVeiculo', (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Veículo</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/22286075-em-branco-ondulado-verde-fundo-com-branco-copia-de-espaco-vetor.jpg'); /* Imagem no fundo */
                    background-size: cover;
                    background-position: center center;
                    color: white;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    color:rgb(0, 0, 0);
                    margin-bottom: 10px;
                }

                .form-container {
                    background-color: rgba(181, 255, 124, 0.5); /* Fundo verde com transparência */
                    width: 80%;
                    max-width: 500px;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                label {
                    font-size: 1rem;
                    color:rgb(0, 0, 0); /* Detalhes em laranja */
                }

                input {
                    background-color: #555;
                    border: 1px solid #666;
                    color: white;
                    padding: 10px;
                    font-size: 1rem;
                    border-radius: 5px;
                    outline: none;
                    width: 100%;
                }

                input:focus {
                    border-color: #FF7F32;
                }

                button {
                    background-color: #FF7F32;
                    border: none;
                    padding: 12px;
                    font-size: 1rem;
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    width: 100%;
                }

                button:hover {
                    background-color: #e66b23;
                    transform: scale(1.05);
                }

                button:active {
                    transform: scale(0.98);
                }

                /* Para telas menores (responsividade) */
                @media (max-width: 768px) {
                    .form-container {
                        width: 90%;
                    }

                    input {
                        width: 100%; /* Em telas menores, faz os campos ficarem em uma única coluna */
                    }
                }
            </style>
        </head>
        <body>

            <div class="form-container">
                <h1>Cadastro de Veículo</h1>

                <form action="/adicionarVeiculo" method="POST">
                    <label for="modelo">Modelo:</label>
                    <input type="text" id="modelo" name="modelo" required>

                    <label for="marca">Marca:</label>
                    <input type="text" id="marca" name="marca" required>

                    <label for="ano">Ano:</label>
                    <input type="number" id="ano" name="ano" required>

                    <label for="placa">Placa:</label>
                    <input type="text" id="placa" name="placa" required>

                    <label for="quilometragem">Quilometragem:</label>
                    <input type="number" id="quilometragem" name="quilometragem" required>

                    <label for="Status">Status:</label>
                    <input type="text" id="Status" name="Status" required>

                    <button type="submit">Cadastrar Veículo</button>
                </form>
            </div>

        </body>
        </html>
    `);
});



// Rota para adicionar o veículo
app.post('/adicionarVeiculo', async (req, res) => {
    const { modelo, marca, ano, placa, quilometragem, Status } = req.body;

    const quilometragemNumero = parseFloat(quilometragem);
    if (isNaN(quilometragemNumero)) {
        return res.status(400).send('Quilometragem inválida.');
    }

    try {
        const db = await openDatabase();
        await db.run('INSERT INTO veiculo (modelo, marca, ano, placa, quilometragem, Status) VALUES (?, ?, ?, ?, ?, ?)', 
                     [modelo, marca, ano, placa, quilometragem, Status]);
        res.redirect('/formularioTarifa');
    } catch (err) {
        console.error('Erro ao adicionar veículo:', err);
        res.status(500).send('Erro ao cadastrar veículo.');
    }
});

// Página do formulário de cadastro de tarifa
app.get('/formularioTarifa', (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Tarifa</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/11058150-fundo-branco-em-branco-com-design-ondulado-verde-e-simples-adequado-para-fundo-de-apresentacao-vetor.jpg'); /* Imagem no fundo */
                    background-size: cover;
                    background-position: center center;
                    color: white;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    color: white;
                    margin-bottom: 10px;
                }

                .form-container {
                    background-color: rgba(0, 128, 0, 0.5); /* Fundo verde com transparência */
                    width: 80%;
                    max-width: 400px;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                label {
                    font-size: 1rem;
                    color: white; /* Textos em branco para melhor legibilidade */
                }

                input {
                    background-color: #555;
                    border: 1px solid #666;
                    color: white;
                    padding: 10px;
                    font-size: 1rem;
                    border-radius: 5px;
                    outline: none;
                    width: 100%;
                }

                input:focus {
                    border-color: #FF7F32; /* Borda laranja ao focar */
                }

                button {
                    background-color: #FF7F32;
                    border: none;
                    padding: 12px;
                    font-size: 1rem;
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    width: 100%;
                }

                button:hover {
                    background-color: #e66b23;
                    transform: scale(1.05);
                }

                button:active {
                    transform: scale(0.98);
                }

                @media (max-width: 768px) {
                    .form-container {
                        width: 90%;
                    }
                }
            </style>
        </head>
        <body>

            <div class="form-container">
                <h1>Cadastro de Tarifa</h1>

                <form action="/adicionarTarifa" method="POST">
                    <label for="tipoTarifa">Tipo de Tarifa:</label>
                    <input type="text" id="tipoTarifa" name="tipoTarifa" required>

                    <label for="valor">Valor:</label>
                    <input type="number" id="valor" name="valor" step="0.01" required>

                    <button type="submit">Cadastrar Tarifa</button>
                </form>
            </div>

        </body>
        </html>
    `);
});


// Rota para adicionar tarifa
app.post('/adicionarTarifa', async (req, res) => {
    const { tipoTarifa, valor } = req.body;

    // Validação dos dados
    if (!tipoTarifa || !valor) {
        return res.status(400).send('Todos os campos obrigatórios devem ser preenchidos!');
    }

    try {
        const db = await openDatabase();

        // Inserção na tabela de tarifa
        await db.run('INSERT INTO tarifa (tipoTarifa, valor) VALUES (?, ?)', 
                     [tipoTarifa, valor]);

        res.redirect('/formularioLocacao');  // Redireciona para o formulário de locação após o cadastro
    } catch (err) {
        console.error('Erro ao adicionar tarifa:', err);
        res.status(500).send('Erro ao cadastrar tarifa.');
    }
});


// Página do formulário de cadastro de locação
app.get('/formularioLocacao', (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Locação</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/22286075-em-branco-ondulado-verde-fundo-com-branco-copia-de-espaco-vetor.jpg');
                    background-size: cover;
                    background-position: center center;
                    color: white;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    color: white;
                    margin-bottom: 15px;
                }

                .form-container {
                    background-color: rgba(0, 128, 0, 0.5);
                    width: 90%;
                    max-width: 500px;
                    padding: 25px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                label {
                    font-size: 1rem;
                    color: white;
                }

                input, textarea {
                    background-color: #555;
                    border: 1px solid #666;
                    color: white;
                    padding: 10px;
                    font-size: 1rem;
                    border-radius: 5px;
                    outline: none;
                    width: 100%;
                }

                input:focus, textarea:focus {
                    border-color: #FF7F32;
                }

                textarea {
                    resize: vertical;
                }

                button {
                    background-color: #FF7F32;
                    border: none;
                    padding: 12px;
                    font-size: 1rem;
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    width: 100%;
                }

                button:hover {
                    background-color: #e66b23;
                    transform: scale(1.05);
                }

                button:active {
                    transform: scale(0.98);
                }

                @media (max-width: 768px) {
                    .form-container {
                        width: 95%;
                    }
                }
            </style>
        </head>
        <body>
            <div class="form-container">
                <h1>Cadastro de Locação</h1>
                <form action="/adicionarLocacao" method="POST">
                    <label for="cdCliente">Código do Cliente:</label>
                    <input type="number" id="cdCliente" name="cdCliente" required>

                    <label for="cdVeiculo">Código do Veículo:</label>
                    <input type="number" id="cdVeiculo" name="cdVeiculo" required>

                    <label for="cdTarifa">Código da Tarifa:</label>
                    <input type="number" id="cdTarifa" name="cdTarifa" required>

                    <label for="dataInicio">Data de Início:</label>
                    <input type="date" id="dataInicio" name="dataInicio" required>

                    <label for="dataFim">Data de Fim:</label>
                    <input type="date" id="dataFim" name="dataFim">

                    <label for="valorTotal">Valor Total:</label>
                    <input type="number" id="valorTotal" name="valorTotal" step="0.01" required>

                    <label for="quilometragemInicial">Quilometragem Inicial:</label>
                    <input type="number" id="quilometragemInicial" name="quilometragemInicial" required>

                    <label for="quilometragemFinal">Quilometragem Final:</label>
                    <input type="number" id="quilometragemFinal" name="quilometragemFinal">

                    <label for="observacoes">Observações:</label>
                    <textarea id="observacoes" name="observacoes" rows="4"></textarea>

                    <button type="submit">Cadastrar Locação</button>
                </form>
            </div>
        </body>
        </html>
    `);
});



app.post('/adicionarLocacao', async (req, res) => {
    const {
        cdCliente,
        cdVeiculo,
        cdTarifa,
        dataInicio,
        dataFim,
        valorTotal,
        quilometragemInicial,
        quilometragemFinal,
        observacoes
    } = req.body;

    // Validação dos dados obrigatórios
    if (!cdCliente || !cdVeiculo || !cdTarifa || !dataInicio || !valorTotal || !quilometragemInicial) {
        return res.status(400).send('Todos os campos obrigatórios devem ser preenchidos!');
    }

    try {
        const db = await openDatabase();

        // Inserção na tabela de locação
        await db.run(
            `INSERT INTO locacao (
                cdCliente, 
                cdVeiculo, 
                cdTarifa, 
                dataInicio, 
                dataFim, 
                valorTotal, 
                quilometragemInicial, 
                quilometragemFinal, 
                observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cdCliente,
                cdVeiculo,
                cdTarifa,
                dataInicio,
                dataFim || null, // Insere null se dataFim estiver vazio
                valorTotal,
                quilometragemInicial,
                quilometragemFinal || null, // Insere null se quilometragemFinal estiver vazio
                observacoes || '' // Insere string vazia se observacoes estiver vazio
            ]
        );

        res.redirect('/formularioOpcional'); // Redireciona após o cadastro
    } catch (err) {
        console.error('Erro ao adicionar locação:', err);
        res.status(500).send('Erro ao cadastrar locação.');
    }
});


// Página do formulário de cadastro de locação opcional
app.get('/formularioOpcional', (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Opcional</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/11058150-fundo-branco-em-branco-com-design-ondulado-verde-e-simples-adequado-para-fundo-de-apresentacao-vetor.jpg'); /* Imagem de fundo */
                    background-size: cover;
                    background-position: center center;
                    color: white;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    color: white;
                    margin-bottom: 15px;
                }

                .form-container {
                    background-color: rgba(0, 128, 0, 0.5); /* Fundo verde translúcido */
                    width: 90%;
                    max-width: 400px;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                label {
                    font-size: 1rem;
                    color: white;
                }

                input {
                    background-color: #555;
                    border: 1px solid #666;
                    color: white;
                    padding: 10px;
                    font-size: 1rem;
                    border-radius: 5px;
                    outline: none;
                    width: 100%;
                }

                input:focus {
                    border-color: #FF7F32; /* Borda laranja ao focar */
                }

                button {
                    background-color: #FF7F32;
                    border: none;
                    padding: 12px;
                    font-size: 1rem;
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    width: 100%;
                }

                button:hover {
                    background-color: #e66b23;
                    transform: scale(1.05);
                }

                button:active {
                    transform: scale(0.98);
                }

                @media (max-width: 768px) {
                    .form-container {
                        width: 95%;
                    }
                }
            </style>
        </head>
        <body>

            <div class="form-container">
                <h1>Cadastro de Opcional</h1>

                <form action="/adicionarOpcional" method="POST">
                    <label for="nomeOpcional">Nome do Opcional:</label>
                    <input type="text" id="nomeOpcional" name="nomeOpcional" required>

                    <label for="valor">Valor do Opcional:</label>
                    <input type="number" id="valor" name="valor" step="0.01" required>

                    <button type="submit">Cadastrar Locação Opcional</button>
                </form>
            </div>

        </body>
        </html>
    `);
});

app.post('/adicionarOpcional', async (req, res) => {
    const { nomeOpcional, valor } = req.body;

    // Validação dos dados
    if (!nomeOpcional || !valor) {
        return res.status(400).send('Todos os campos obrigatórios devem ser preenchidos!');
    }

    try {
        const db = await openDatabase();

        // Inserção na tabela de locação opcional
        await db.run(
            'INSERT INTO opcional (nomeOpcional, valor) VALUES (?, ?)', 
            [nomeOpcional, valor]
        );

        res.redirect('/formularioSeguro');  // Redireciona para o formulário de locação opcional após o cadastro
    } catch (err) {
        console.error('Erro ao adicionar locação opcional:', err);
        res.status(500).send('Erro ao cadastrar locação opcional.');
    }
});


app.get('/formularioSeguro', (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Seguro</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/11058150-fundo-branco-em-branco-com-design-ondulado-verde-e-simples-adequado-para-fundo-de-apresentacao-vetor.jpg'); /* Imagem de fundo */
                    background-size: cover;
                    background-position: center center;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    color: black; /* Letras pretas */
                    margin-bottom: 15px;
                }

                .form-container {
                    background-color: rgba(255, 255, 255, 0.8); /* Fundo branco translúcido */
                    width: 90%;
                    max-width: 400px;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                label {
                    font-size: 1rem;
                    color: black; /* Letras pretas */
                }

                input {
                    background-color: #f9f9f9;
                    border: 1px solid #ccc;
                    color: black;
                    padding: 10px;
                    font-size: 1rem;
                    border-radius: 5px;
                    outline: none;
                    width: 100%;
                }

                input:focus {
                    border-color: #FF7F32; /* Borda laranja ao focar */
                }

                button {
                    background-color: #FF7F32;
                    border: none;
                    padding: 12px;
                    font-size: 1rem;
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    width: 100%;
                }

                button:hover {
                    background-color: #e66b23;
                    transform: scale(1.05);
                }

                button:active {
                    transform: scale(0.98);
                }

                @media (max-width: 768px) {
                    .form-container {
                        width: 95%;
                    }
                }
            </style>
        </head>
        <body>

            <div class="form-container">
                <h1>Cadastro de Seguro</h1>

                <form action="/adicionarSeguro" method="POST">

                    <label for="tipoSeguro">Tipo de Seguro:</label>
                    <input type="text" id="tipoSeguro" name="tipoSeguro" required>

                    <label for="valor">Valor:</label>
                    <input type="number" id="valor" name="valor" step="0.01" required>

                    <button type="submit">Cadastrar Seguro</button>
                </form>
            </div>

        </body>
        </html>
    `);
});


app.post('/adicionarSeguro', async (req, res) => {
    const {tipoSeguro, valor } = req.body;

    // Validação dos dados
    if (!tipoSeguro || !valor) {
        return res.status(400).send('Todos os campos obrigatórios devem ser preenchidos!');
    }

    try {
        const db = await openDatabase();

        // Inserção na tabela de seguro
        await db.run(
            `INSERT INTO seguro (tipoSeguro, valor) VALUES (?, ?)`,
            [tipoSeguro, valor]
        );

        res.redirect('/formularioPagamento');  // Redireciona para o formulário de pagamento após o cadastro
    } catch (err) {
        console.error('Erro ao adicionar seguro:', err);
        res.status(500).send('Erro ao cadastrar seguro.');
    }
});

app.get('/formularioPagamento', (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Pagamento</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/22286075-em-branco-ondulado-verde-fundo-com-branco-copia-de-espaco-vetor.jpg'); /* Imagem de fundo */
                    background-size: cover;
                    background-position: center center;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }

                h1 {
                    text-align: center;
                    font-size: 2rem;
                    color: black; /* Letras pretas */
                    margin-bottom: 15px;
                }

                .form-container {
                    background-color: rgba(255, 255, 255, 0.8); /* Fundo branco translúcido */
                    width: 90%;
                    max-width: 400px;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                label {
                    font-size: 1rem;
                    color: black; /* Letras pretas */
                }

                input {
                    background-color: #f9f9f9;
                    border: 1px solid #ccc;
                    color: black;
                    padding: 10px;
                    font-size: 1rem;
                    border-radius: 5px;
                    outline: none;
                    width: 100%;
                }

                input:focus {
                    border-color: #FF7F32; /* Borda laranja ao focar */
                }

                button {
                    background-color: #FF7F32;
                    border: none;
                    padding: 12px;
                    font-size: 1rem;
                    color: white;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    width: 100%;
                }

                button:hover {
                    background-color: #e66b23;
                    transform: scale(1.05);
                }

                button:active {
                    transform: scale(0.98);
                }

                @media (max-width: 768px) {
                    .form-container {
                        width: 95%;
                    }
                }
            </style>
        </head>
        <body>

            <div class="form-container">
                <h1>Cadastro de Pagamento</h1>

                <form action="/adicionarPagamento" method="POST">
                    <label for="cdCliente">Código do Cliente:</label>
                    <input type="number" id="cdCliente" name="cdCliente" required>

                    <label for="cdLocacao">Código da Locação:</label>
                    <input type="number" id="cdLocacao" name="cdLocacao" required>

                    <label for="formaPagamento">Forma de Pagamento:</label>
                    <input type="text" id="formaPagamento" name="formaPagamento" required>

                    <label for="valor">Valor:</label>
                    <input type="number" id="valor" name="valor" step="0.01" required>

                    <button type="submit">Cadastrar Pagamento</button>
                </form>
            </div>

        </body>
        </html>
    `);
});


app.post('/adicionarPagamento', async (req, res) => {
    const { cdCliente, cdLocacao, formaPagamento, valor } = req.body;

    // Validação dos dados
    if (!cdCliente || !cdLocacao || !formaPagamento || !valor) {
        return res.status(400).send('Todos os campos obrigatórios devem ser preenchidos!');
    }

    try {
        const db = await openDatabase();

        // Inserção na tabela de pagamento
        await db.run(
            `INSERT INTO pagamento (cdCliente, cdLocacao, formaPagamento, valor) VALUES (?, ?, ?, ?)`,
            [cdCliente, cdLocacao, formaPagamento, valor]
        );

        // Página de sucesso estilizada
        res.send(`
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Carro Alugado com Sucesso</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-image: url('https://static.vecteezy.com/ti/vetor-gratis/p1/11058150-fundo-branco-em-branco-com-design-ondulado-verde-e-simples-adequado-para-fundo-de-apresentacao-vetor.jpg');
                        background-size: cover;
                        background-position: center center;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        color: black;
                    }

                    .container {
                        background-color: rgba(255, 255, 255, 0.9);
                        border-radius: 15px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                        padding: 30px;
                        text-align: center;
                        width: 80%;
                        max-width: 400px;
                    }

                    h1 {
                        font-size: 2rem;
                        color: #2d3436;
                        margin-bottom: 20px;
                    }

                    p {
                        font-size: 1rem;
                        color: #636e72;
                        margin-bottom: 30px;
                    }

                    .button {
                        display: inline-block;
                        background-color: #FF7F32;
                        color: white;
                        padding: 10px 20px;
                        font-size: 1rem;
                        text-decoration: none;
                        border-radius: 5px;
                        transition: all 0.3s ease-in-out;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    }

                    .button:hover {
                        background-color: #e66b23;
                        transform: scale(1.05);
                    }

                    .button:active {
                        transform: scale(0.98);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Carro alugado com sucesso!</h1>
                    <p>O pagamento foi registrado com sucesso e a locação está ativa.</p>
                    <a href="/" class="button">Voltar ao Início</a>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        console.error('Erro ao adicionar pagamento:', err);
        res.status(500).send('Erro ao cadastrar pagamento.');
    }
});


// Inicializando o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
