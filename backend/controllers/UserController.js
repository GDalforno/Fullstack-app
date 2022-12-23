var User = require("../models/User");
var PasswordToken = require("../models/PasswordToken");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");


var secret = "rbreberberbreberbrbr";



class UserController {

    async index(req, res) {
        var users = await User.findAll();
        res.json(users);
    }

    async findUser(req, res) {
        var id = req.params.id;
        var user = await User.findById(id);
        if (user == undefined) {
            res.status(404);
            res.json({});
        } else {
            res.status(200);
            res.json(user);
        }
    }

    async create(req, res) {
        var {email, name, password} = req.body;

        if (email == undefined || email == '' || email == ' ') {
            res.status(400);
            res.json({err: "O e-mail é inválido"});
            return;
        }

        if (name == undefined || name == '' || name == ' ') {
            res.status(400);
            res.json({err: "O nome é inválido"});
            return;
        }

        if (password == undefined || password == '' || password == ' ') {
            res.status(400);
            res.json({err: "A senha é inválido"});
            return;
        }
        
        var emailExists = await User.findEmail(email);

        if (emailExists) {
            res.status(406);
            res.json({err: "O e-mail já está cadastrado"});
            return;
        }

        await User.new(email, password, name);
        
        res.status(200);
        res.send("Tudo OK!");
    }

    async edit(req, res) {
        var id = req.params.id;
        var {name, role, email} = req.body;
        var result = await User.update(id, email, name, role);
        
        if(result != undefined) {
            if(result.status) {
                res.status(200);
                res.send("Tudo OK!");
            } else {
                res.send(406);
                res.json(result.err);
            }
        } else {
            res.status(406);
            res.send("Ocorreu um erro no servidor!");
        }
    }

    async remove(req, res) {
        var id = req.params.id;

        var result = await User.delete(id);

        if (result.status) {
            res.status(200);
            res.send("Tudo OK!");
        } else {
            res.status(406);
            res.send(result.err);
        }
    }

    async recoverPassword(req, res) {
        var email = req.body.email;
        var result = await PasswordToken.create(email);
        if (result.status) {
            console.log(result.token);
            res.status(200);
            res.send(result.token.toString());
        } else {
            res.status(406);
            res.send(result.err);
        }
    }

    async changePassword(req, res) {
        var token = req.body.token;
        var password = req.body.password;

        var isTokenValid = await PasswordToken.validate(token);
    
        if(isTokenValid.status) {
            try {
                var result = await User.changePassword(password, isTokenValid.tk.user_id, isTokenValid.tk.token);
                if (result.status) {
                    res.status(200);
                    res.send("Senha alterada");
                } else {
                    res.status(500);
                    res.send("Erro durante a troca de senha");
                }
            } catch(err) {
                console.log(err);
            }
        } else {
            res.status(406);
            res.send("Token inválido");
        }
    }

    async login(req, res) {
        var {email, password} = req.body;

        try {
            var user = await User.findByEmail(email);
            if (user != undefined) {
                var result = await bcrypt.compare(password, user.password);
                if (result) {
                    var token = jwt.sign({ email: user.email, role: user.role }, secret);
                    res.status(200);
                    res.json({token: token});
                } else {
                    res.status(406);
                    res.json({err: "Senha incorreta"});
                }
            } else {
                res.status(401);
                res.json({status: false, err: "O usuário não existe"});
            }
        } catch(err) {
            res.status(500);
            res.send(err);
        }
    }
}

module.exports = new UserController();