const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function EnsureToken(req, res, next) {
    const header = req.headers['authotization-header'];
    if (typeof header !== 'undefined') {
        req.token = header;
        next();
    } else {
        res.sendStatus(403);
    }
}

router.get('/prueba', EnsureToken, (req, res) => {
    jwt.verify(req.token, 'kEYsHHHH154521', (err, data) => {
        if(err) {
            res.sendStatus(403);
        } else {
            res.json(data);
        }
    });
});

router.post('/login', (req, res) => {
    connection.getConnection(function(err, connection) {
        if (err) throw err;
        const { correo, contrasena } = req.body;

        if (correo == '' || correo == null) {
            res.json('Correo vacío');
        } else if (contrasena == '' || contrasena == null) {
            res.json('Contraseña vacío');
        } else {
            try {
                connection.query('CALL GetLogin(?);', [correo], function (error, results, fields) {
                    if (error) throw error;
                    try {
                        var passCompare = bcrypt.compareSync(contrasena, results[0][0].contrasena);
                        if(results[0].length == 1 && passCompare){
                            const token = jwt.sign(results[0][0].idUsuario, 'kEYsHHHH154521');
                            res.json({token: token, id: results[0][0].idUsuario});
                        } else {
                            res.json('No encontrado');
                        }
                    } catch (error) {
                        res.json({Error: "Error 1"});
                    }
                    
                });
            } catch (error) {
                res.json({Error: "Error 2"});
            }
            
        }
    });
});

router.post('/user', (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { nombre, apellido, correo, contrasena, idCompania } = req.body;
    
            if (nombre == '' || nombre == null) {
                res.json('Nombre vacío');
            } else if (apellido == '' || apellido == null) {
                res.json('Apellido vacío');
            } else if (correo == '' || correo == null) {
                res.json('Correo vacío');
            } else if (contrasena == '' || contrasena == null) {
                res.json('Contraseña vacío');
            } else if (idCompania == '' || idCompania == null) {
                res.json('Compañía vacío');
            } else {
                try {
                    const salt = bcrypt.genSaltSync(10);
                    var contrasenaa = bcrypt.hashSync(contrasena, salt);
                    try {
                        connection.query('SELECT correo FROM Usuario WHERE correo = ?', [correo], function (error, results, fields) {
                            if (error) throw error;
                            if(results.length == 0) {
                                try {
                                    connection.query('CALL SetUser(?,?,?,?,?);', [nombre, apellido, correo, contrasenaa, idCompania], function (error, results, fields) {
                                        if (error) throw error;
                                        res.json('Row inserted');
                                    });
                                } catch (error) {
                                    res.statusCode(403).json({Error: "Error 3"});
                                }
                            }
                            else {
                                res.json('Usuario ya creado');
                            }
                        });
                    } catch (error) {
                        res.statusCode(403).json({Error: "Error 4"});
                    }
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 5"});
                }
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 6"});
    }
});

router.put('/user/:id', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { nombre, apellido, correo, contrasena, idCompania } = req.body;
            const { id } = req.params;
    
            if (nombre == '' || idCompania == null) {
                res.json('Nombre vacío');
            } else if (apellido == '' || apellido == null) {
                res.json('Apellido vacío');
            } else if (correo == '' || correo == null) {
                res.json('Correo vacío');
            } else if (contrasena == '' || contrasena == null) {
                res.json('Contraseña vacío');
            } else if (idCompania == '' || idCompania == null) {
                res.json('Compañía vacío');
            } else {
                try {
                    const decode = jwt.verify(req.token, 'kEYsHHHH154521');
                    if(id == decode) {
                        connection.query('CALL UpdateUser(?,?,?,?,?,?);', [nombre, apellido, correo, contrasena, idCompania, id], function (error, results, fields) {
                            if (error) throw error;
                            res.json('Row Updated');
                        });
                    }
                    else {
                        res.json('User not autorized');
                    }
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 7"});
                }
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 8"});
    }
});

router.get('/user/:id', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            try {
                const { id } = req.params;
                const decode = jwt.verify(req.token, 'kEYsHHHH154521');
                
                if(id == decode) {
                    try {
                        connection.query('CALL GetUserById(?);',[id], function (error, results, fields) {
                            if (error) throw error;
                            res.json(results[0]);
                        });
                    } catch (error) {
                        res.statusCode(403).json({Error: "Error 8"});
                    }
                }
                else {
                    res.json('User not autorized');
                }
            } catch (error) {
                res.statusCode(403).json({Error: "Error 9"});
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 10"});
    }
});

router.post('/user/:id/project', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { nombre, descripcion, idUsuario } = req.body;

            if (nombre == '' || nombre == null) {
                res.json('Nombre vacío');
            } else if (descripcion == '' || descripcion == null) {
                res.json('Descripción vacía');
            } else if (idUsuario == '' || idUsuario == null) {
                res.json('Usuario vacío');
            } else {
                const decode = jwt.verify(req.token, 'kEYsHHHH154521');
                if(idUsuario == decode) {
                    try {
                        connection.query('SELECT nombre FROM Proyecto WHERE nombre = ?', [nombre], function (error, results, fields) {
                            if (error) throw error;
                            if(results.length == 0) {
                                try {
                                    connection.query('CALL SetProject(?,?,?);', [nombre, descripcion, idUsuario], function (error, results, fields) {
                                        if (error) throw error;
                                        res.json('Row inserted');
                                    });
                                } catch (error) {
                                    res.statusCode(403).json({Error: "Error 11"});
                                }
                            }
                            else {
                                res.json('Proyecto ya creado');
                            }
                        });
                    } catch (error) {
                        res.statusCode(403).json({Error: "Error 12"});
                    }
                }
                else {
                    res.json('User not autorized');
                }
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 13"});
    }
});

router.get('/user/:id/project', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { id } = req.params;
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(id == decode) {
                try {
                    connection.query('CALL GetProjects(?);',[id], function (error, results, fields) {
                        if (error) throw error;
                        res.json(results[0]);
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 14"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 15"});
    }
});

router.get('/user/:id/project/:idPro', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { idPro, id } = req.params;
    
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(id == decode) {
                try {
                    connection.query('CALL GetProject(?);',[idPro], function (error, results, fields) {
                        if (error) throw error;
                        res.json(results[0]);
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 16"});
                }
            } else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 17"});
    }
});

router.post('/user/:id/history', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { nombre, descripcion, idProyecto, nombreTicket, descripcionTicket } = req.body;
            const { id } = req.params;
    
            if (nombre == '' || nombre == null) {
                res.json('Nombre vacío');
            } else if (descripcion == '' || descripcion == null) {
                res.json('Descripción vacía');
            } else if (idProyecto == '' || idProyecto == null) {
                res.json('Proyecto vacío');
            } else if (nombreTicket == '' || nombreTicket == null) {
                res.json('Nombre ticket vacío');
            } else if (descripcionTicket == '' || descripcionTicket == null) {
                res.json('Descricion ticket vacío');
            } else {
                const decode = jwt.verify(req.token, 'kEYsHHHH154521');
                if(id == decode) {
                    try {
                        connection.query('CALL SetHistory(?,?,?,?,?);', [nombre, descripcion, idProyecto, nombreTicket, descripcionTicket], function (error, results, fields) {
                            if (error) throw error;
                            res.json('Row inserted');
                        });
                    } catch (error) {
                        res.statusCode(403).json({Error: "Error 18"});
                    }
                }
                else {
                    res.json('User not autorized');
                }
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 19"});
    }
});

router.get('/com', (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            try {
                connection.query('CALL GetCom();', function (error, results, fields) {
                    if (error) throw error;
                    res.json(results[0]);
                });
            } catch (error) {
                res.statusCode(403).json({Error: "Error 18"});
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 19"});
    }
});

router.get('/user/:id/project', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { id } = req.params;
    
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(id === decode) {
                try {
                    connection.query('CALL GetProject(?);',[id], function (error, results, fields) {
                        if (error) throw error;
                        res.json(results[0]);
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 18"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 19"});
    }
});

router.get('/user/:id/project/:idPro/history', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { id, idPro } = req.params;
    
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(id === decode) {
                try {
                    connection.query('CALL GetHistories(?);',[idPro], function (error, results, fields) {
                        if (error) throw error;
                        res.json(results[0]);
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 18"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 19"});
    }
});

router.get('/user/:id/project/:idPro/history/:idHis', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { id, idHis } = req.params;
    
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(id === decode) {
                try {
                    connection.query('CALL GetHistory(?);',[idHis], function (error, results, fields) {
                        if (error) throw error;
                        res.json(results[0]);
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 18"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 19"});
    }
});

router.put('/user/:id/project/:idPro/history/:idHis', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { id, idHis } = req.params;
            const { nombre, descripcion } = req.body;
    
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(id === decode) {
                try {
                    connection.query('CALL UpdateHistory(?,?,?);',[nombre, descripcion, idHis], function (error, results, fields) {
                        if (error) throw error;
                        res.json('Updated');
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 18"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 19"});
    }
});

router.post('/user/:id/ticket', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { nombreTicket, descripcionTicket, idHistoria, idEstado } = req.body;
            const { id } = req.params;
    
            if (nombreTicket == '' || nombreTicket == null) {
                res.json('Nombre ticket vacío');
            } else if (descripcionTicket == '' || descripcionTicket == null) {
                res.json('Descricion ticket vacío');
            } else if (idHistoria == '' || idHistoria == null) {
                res.json('Historia vacía');
            } else if (idEstado == '' || idEstado == null) {
                res.json('Estado vacía');
            } else {
                const decode = jwt.verify(req.token, 'kEYsHHHH154521');
                if(id === decode) {
                    try {
                        connection.query('CALL SetTicket(?,?,?,?);', [nombreTicket, descripcionTicket, idHistoria, idEstado], function (error, results, fields) {
                            if (error) throw error;
                            res.json('Row inserted');
                        });
                    } catch (error) {
                        res.statusCode(403).json({Error: "Error 20"});
                    }
                }
                else {
                    res.json('User not autorized');
                }
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 21"});
    }
});

router.put('/user/:idUs/ticket/:id', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { nombreTicket, descripcionTicket, idHistoria, idEstado } = req.body;
            const { id, idUs } = req.params;

            if (nombreTicket == '' || nombreTicket == null) {
                res.json('Nombre ticket vacío');
            } else if (descripcionTicket == '' || descripcionTicket == null) {
                res.json('Descricion ticket vacío');
            } else if (idHistoria == '' || idHistoria == null) {
                res.json('Historia vacía');
            } else if (idEstado == '' || idEstado == null) {
                res.json('Estado vacía');
            } else {
                const decode = jwt.verify(req.token, 'kEYsHHHH154521');
                if(idUs == decode) {
                    try {
                        connection.query('CALL UpdateTicket(?,?,?,?,?);', [nombreTicket, descripcionTicket, idHistoria, idEstado, id], function (error, results, fields) {
                            if (error) throw error;
                            res.json('Row updated');
                        });
                    } catch (error) {
                        res.statusCode(403).json({Error: "Error 22"});
                    }
                }
                else {
                    res.json('User not autorized');
                }
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 23"});
    }
});

router.get('/user/:idUs/history/:id/ticket/:idTic', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { id, idUs, idTic } = req.params;
    
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(idUs == decode) {
                try {
                    connection.query('CALL GetTicket(?);',[idTic], function (error, results, fields) {
                        if (error) throw error;
                        res.json(results[0]);
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 24"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 25"});
    }
});

router.get('/user/:idUs/history/:id/ticket', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { id, idUs } = req.params;
    
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(idUs == decode) {
                try {
                    connection.query('CALL GetTickets(?);',[id], function (error, results, fields) {
                        if (error) throw error;
                        res.json(results[0]);
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 24"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 25"});
    }
});

router.delete('/user/:idUs/history/:idHi/ticket/:idTic', EnsureToken, (req, res) => {
    try {
        connection.getConnection(function(err, connection) {
            if (err) throw err;
            const { idUs, idHi, idTic } = req.params;
            const decode = jwt.verify(req.token, 'kEYsHHHH154521');
            if(idUs === decode) {
                try {
                    connection.query('CALL DelTicket(?);',[idTic], function (error, results, fields) {
                        if (error) throw error;
                        res.json('Row Deleted');
                    });
                } catch (error) {
                    res.statusCode(403).json({Error: "Error 26"});
                }
            }
            else {
                res.json('User not autorized');
            }
        });
    } catch (error) {
        res.statusCode(403).json({Error: "Error 27"});
    }
});

module.exports = router;