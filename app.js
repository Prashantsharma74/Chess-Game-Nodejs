const express = require("express")
const socket = require("socket.io")
const color = require("colors")
const http = require("http")
const { Chess } = require("chess.js")
const path = require("path")

const app = express()

const server = http.createServer(app)
const io = socket(server)

const chess = new Chess();
let players = {};
let currentPlayer = 'w';

app.set("view engine", 'ejs')
app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" })
})

// On Connection 
io.on("connection", function (uniquesocket) {
    console.log("Connected");

    if (!players.white) {
        players.white = uniquesocket.id;
        // user who is connected 
        uniquesocket.emit("playerRole", "w")
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b")
    } else {
        uniquesocket.emit("spectatorRole")
    }

    // if one of the user disconnected 
    uniquesocket.on("disconnect", function () {
        if (uniquesocket.id === players.white) {
            delete players.white;
        } else if (uniquesocket.id === players.black) {
            delete players.black;
        }
    })

    uniquesocket.on("move", function (move) {
        try {
            if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
            if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;

            const result = chess.move(move);

            if (result) {
                currentPlayer = chess.turn()
                io.emit("move", move)
                io.emit("boardState", chess.fen())
            } else {
                console.log("Invalid move: ", move);
                uniquesocket.emit("Invalid move: ", move)
            }
        } catch (error) {
            console.log(err);
            uniquesocket.emit("Invalid move: ", move)
        }
    })

    // For checking is it valid move or not 

    // for checking wo is online 
    // uniquesocket.on("disconnect", function () {
    //     console.log("disconnected");
    // })

    // we use for sending mssg to all
    // uniquesocket.on("churan", function () {
    //     io.emit("Churan Papdi") 
    // })
})

server.listen(3000, () => {
    console.log(`PORT is running on 3000`.bgMagenta);

})