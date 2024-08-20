const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use((req, res, next) => {
    res.setHeader(
      "Permissions-Policy",
      "attribution-reporting=(), run-ad-auction=(), join-ad-interest-group=(), compute-pressure=(), browsing-topics=()"
    );
    next();
  });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
  });
// Verbindung zur MySQL-Datenbank herstellen
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'webtech2',
    database: 'jobdb'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Datenbank verbunden!');
});

// API-Endpunkt, um alle Einträge aus der "adressen"-Tabelle abzurufen
app.get('/api/jobstelle', (req, res) => {
    console.log("Get erfolgreich!");
    connection.query('SELECT * FROM jobstelle', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

// API-Endpunkt zum Hinzufügen von Adressen http://localhost:3000/api/jobstelle/jobID
app.post('/api/jobstelle', (req, res) => {
    const  title = req.body.title;
    const  description = req.body.description;
    const  salary  = req.body.salary;
    const  location = req.body.location;
    const  jobtype = req.body.jobtype;
    const  jobid = req.body.jobid;

    console.log("Post erfolgreich!");
    const query = 'INSERT INTO jobstelle (title, description, salary, location, jobtype) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(query, [title, description, salary,location, jobtype], (error, results) => {
        if (error) {
            console.error('Fehler beim Einfügen des Jobs:', error);
            res.status(500).json({ error: 'Daten konnten nicht eingefügt werden' });
            return;
        }
        res.status(201).json({ id: results.insertId, title, description, salary, location, jobtype });
    });
  });

  app.post('/api/jobstelle/edit', (req, res) => {
    const  title = req.body.title;
    const  description = req.body.description;
    const  salary  = req.body.salary;
    const  location = req.body.location;
    const  jobtype = req.body.jobtype;
    const  jobid = req.body.jobID;

    console.log("Post erfolgreich!");
    const query = 'UPDATE jobstelle  SET title = ?, description = ?, salary = ?,  location = ?,  jobtype = ?   WHERE jobID = ? ;';
    
    connection.query(query, [title, description, salary,location, jobtype, jobid], (error, results) => {
        if (error) {
            console.error('Fehler beim Einfügen des Jobs:', error);
            res.status(500).json({ error: 'Daten konnten nicht updated werden' });
            return;
        }
        res.status(201).json({ id: results.insertId, title, description, salary, location, jobtype });
    });
  });

  app.get('/api/jobstelle/delete/:id', (req, res) => {
    console.log("Delete erfolgreich!");
    const jobId = req.params.id;
    const query = 'DELETE FROM jobstelle WHERE jobID = ?';

    connection.query(query, [jobId], (error, results) => {
        if (error) {
            console.error('Fehler beim Löschen des Jobs:', error);
            res.status(500).json({ error: 'Daten konnten nicht gelöscht werden' });
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Job nicht gefunden' });
        } else {
            res.status(200).json({ message: 'Job erfolgreich gelöscht' });
        }
  });
});
// Server starten
app.listen(3000, () => {
    console.log('Server läuft auf http://localhost:3000');
});