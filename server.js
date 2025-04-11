/********************************************************************************
*  WEB322 – Assignment 06
*  
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*  
*  Name: Tanmay Dineshbhai Savaj
*  Student ID: 131573230
*  Date: 7 April 2025
********************************************************************************/

const express = require("express");
const path = require("path");
const clientSessions = require("client-sessions");
require("dotenv").config();

const {
    getAllProjects,
    getProjectsBySector,
    getProjectById,
    getAllSectors,
    addProject,
    editProject,
    deleteProject,
    initialize
} = require("./Modules/projects");

const authData = require("./Modules/auth-service");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));

app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    cookieName: 'session',
    secret: process.env.SESSION_SECRET, 
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5
  }));
  

// Expose session to all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Login check middleware
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// Homepage
app.get("/", async (req, res) => {
    try {
        const allProjects = await getAllProjects();
        const projects = allProjects.slice(0, 9);
        res.render("home", { projects, page: "/" });
    } catch (err) {
        res.status(500).render("500", { message: "Error loading home page" });
    }
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

app.get("/solutions/projects", async (req, res) => {
    try {
        let projects;
        if (req.query.sector) {
            projects = await getProjectsBySector(req.query.sector);
            if (projects.length === 0) {
                return res.status(404).render("404", { message: "No projects found in this sector." });
            }
        } else {
            projects = await getAllProjects();
        }
        res.render("projects", { projects, page: "/solutions/projects" });
    } catch (err) {
        res.status(500).render("500", { message: "Error loading projects" });
    }
});

app.get("/solutions/projects/:id", async (req, res) => {
    try {
        const project = await getProjectById(parseInt(req.params.id));
        if (!project) {
            return res.status(404).render("404", { message: "Project not found." });
        }
        res.render("project", { project, page: "" });
    } catch (err) {
        res.status(500).render("500", { message: "Error loading project" });
    }
});

// --- Protected routes ---
app.get("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
        const sectors = await getAllSectors();
        res.render("addProject", { sectors, page: "/solutions/addProject" });
    } catch (err) {
        res.status(500).render("500", { message: "Error loading form" });
    }
});

app.post("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
        await addProject(req.body);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).render("500", { message: err.message });
    }
});

app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
    try {
        const project = await getProjectById(parseInt(req.params.id));
        const sectors = await getAllSectors();
        res.render("editProject", { project, sectors, page: "/solutions/editProject" });
    } catch (err) {
        res.status(500).render("500", { message: err.message });
    }
});

app.post("/solutions/editProject/:id", ensureLogin, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const success = await editProject(projectId, req.body);
        if (!success) {
            return res.status(404).render("404", { message: "Project update failed" });
        }
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).render("500", { message: err.message });
    }
});

app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
    try {
        await deleteProject(parseInt(req.params.id));
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).render("500", { message: err.message });
    }
});

// --- Auth Routes ---

app.get("/register", (req, res) => {
    res.render("register", { errorMessage: "", successMessage: "", userName: "", page: "/register" });
});

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render("register", { successMessage: "User created", errorMessage: "", userName: "", page: "/register" });
    }).catch(err => {
        res.render("register", { errorMessage: err, successMessage: "", userName: req.body.userName, page: "/register" });
    });
});

app.get("/login", (req, res) => {
    res.render("login", { errorMessage: "", userName: "", page: "/login" });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");

    authData.checkUser(req.body).then(user => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        };
        res.redirect("/solutions/projects");
    }).catch(err => {
        res.render("login", { errorMessage: err, userName: req.body.userName, page: "/login" });
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory", { page: "/userHistory" });
});

// --- Error handlers ---
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found", page: "/" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("500", { message: err.message || "Something went wrong", page: "/" });
});

// --- Start Server ---
initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error("Unable to start server:", err);
    });

module.exports = app;
