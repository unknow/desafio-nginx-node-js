const express = require('express')
const axios = require('axios').default;
const app = express()
const port = 3000
const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb',
};
const mysql = require('mysql')
const connection = mysql.createConnection(config)

// Conecta ao MySQL
connection.connect(error => {
    if (error) {
        console.error("Erro ao conectar no banco de dados:", error);
        return;
    }
    console.log("Conectado ao banco de dados MySQL!");
});

async function getName() {
    const RANDOM = Math.floor(Math.random() * 82);
    const response = await axios.get(`https://swapi.dev/api/people/${RANDOM}`);
    return response.data.name;
}

async function insertName(res) {
    const name = await getName();
    // const connection = mysql.createConnection(dbConfig);
    const INSERT_QUERY = `INSERT INTO people(name) values('${name}')`;

    connection.query(INSERT_QUERY, (error, _results, _fields) => {
        if (error) {
            console.log(`Error inserting name: ${error}`);
            res.status(500).send('Error inserting name');
            return;
        }

        console.log(`${name} inserted successfully in the database!`);
        getAll(res, connection);
    });
}

async function getAll(res) {
    return connection.query('SELECT * FROM people', (error, results) => {
        if (error) {
            console.error("Erro ao consultar registros:", error);
            res.send("Erro ao consultar registros");
            return;
        }

        // Monta a resposta com a mensagem e a lista de nomes
        let response = "<h1>Full Cycle Rocks!</h1>";
        response += '<ul>';
        results.forEach(row => {
            response += `<li>${row.name}</li>`;
        });
        response += '</ul>';
        res.send(response);
    });
}

app.get('/', (req, res) => {

    connection.query(
        `CREATE TABLE IF NOT EXISTS people (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        )`,
        (error) => {
            if (error) {
                console.error("Erro ao criar a tabela:", error);
                res.send("Erro na criação da tabela");
                return;
            }

            return insertName(res);
        });
})

app.listen(port, () => {
    console.log('Rodando na porta ' + port)
})
