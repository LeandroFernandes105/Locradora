// Importando o Express
const express = require('express');

// Criando uma instância do Express
const app = express();

// Definindo a porta em que o servidor vai rodar
const port = 3000;  

// Importando o mssql
const sql = require('mssql');

// Configuração do banco de dados
const dbConfig = {
  user: 'VEETWT',
  password: 'Mike@2016',
  server: 'localhost', // Ou o IP/hostname do seu servidor SQL
  database: 'Locadora',
  options: {
    encrypt: true, // Se estiver usando SSL
    trustServerCertificate: true // Se o certificado SSL não for confiável
  }
};

// Função para conectar ao banco e fazer uma consulta simples
async function testDBConnection() {
  try {
    await sql.connect(dbConfig);
    console.log('Conectado ao banco de dados!');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    // Se a conexão falhar, você pode finalizar o processo para não continuar sem o banco
    process.exit(1); // Isso vai fazer o processo parar se a conexão falhar
  }
}

// Rota simples para testar
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Conectar ao banco de dados antes de iniciar o servidor Express
async function startServer() {
  await testDBConnection(); // Aguarda a conexão com o banco de dados
  // Iniciando o servidor
  app.listen(port, () => {
    console.log(`Servidor rodando na http://localhost:${port}`);
  });
}

// Inicia o servidor
startServer();
