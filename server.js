/******************************************************************************** 
*  WEB322 – Assignment 02 
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Tanmay Dineshbhai Savaj 
*  Student ID: 131573230 
*  Date: 28 Jan. 2025
********************************************************************************/

const express = require("express");
const projectData = require("./Modules/projects");

const app = express();
const PORT = process.env.PORT || 3000;

projectData.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error(err);
    });

app.get("/", (req, res) => {
    res.send("Assignment 2: Tanmay Dineshbhai Savaj - 131573230");
});

app.get("/solutions/projects", (req, res) => {
    projectData.getAllProjects()
        .then(data => res.json(data))
        .catch(err => res.status(500).send(err));
});

app.get("/solutions/projects/id-demo", (req, res) => {
    projectData.getProjectById(7)
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
});

app.get("/solutions/projects/sector-demo", (req, res) => {
    projectData.getProjectsBySector("agriculture")
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
});

