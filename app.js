const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const saltRounds = 5;

app.set("view engine", "ejs");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "githubClone",
});

app.get("/", function (req, res) {
  res.redirect("/signup");
});

app.get("/repository", function (req, res) {
  let query =
              'SELECT * FROM NEWITEMS;';
            con.query(query, (err, results) => {
              if (err) {
                res.send(err.message);
                console.log(err.message);
              } else {
                // console.log(results.length)
                res.render('home/page', { results: results, total: results.length });
              }
            });
});

app.get("/signup", function (req, res) {
  res.render('user/signup', { message: null });
});

app.get("/signin", function (req, res) {
  res.render('user/signin', { message: null });
});

app.get("/updateUser", function (req, res) {
  res.render('user/updateUser', { message: null });
});

app.get("/deleteUser", function (req, res) {
  res.render('user/deleteUser', { message: null });
});

app.get("/newfile", function (req, res) {
  res.render("repo/newfile");
});

app.post("/signup", (req, res) => {
  let userName = req.body.userName;
  let password = req.body.password;
  con.query(`SELECT userName FROM userinfo WHERE userName ='${userName}'`, function (
    err,
    result
  ) {
    if (err) throw err;
    // console.log(result);

    if (result.length == 0) {
      let hashedPswd;
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          throw err;
        } else {
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
              throw err;
            } else {
              hashedPswd = hash;
              // console.log(hashedPswd);

              let query =
              'INSERT INTO USERINFO (userName, password) VALUES ("'+userName+'", "'+hashedPswd+'")';
            con.query(query, (err, results) => {
              if (err) {
                res.send(err.message);
                console.log(err.message);
              } else {
                console.log("Data has been entered.");
                res.redirect('/repository');
              }
            });
            }
          });
        }
      });
    } else {
      res.render('user/signup', { message: "User Already exists." });
      res.end();
    }
  });
});


app.post("/signin", function (req, res) {
  var userName = req.body.userName;
  var password = req.body.password;
  if (userName && password) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        console.log(err);
      } else {
        let hash = "";
        let getPass = `SELECT password FROM userinfo WHERE userName = '${userName}'`;
        con.query(getPass, function (err, results) {
          if (err) throw err;
          if (results.length != 0) {
            // console.log(results);
            hash = results[0].password; 
            bcrypt.compare(password, hash, function (err, isMatch) {
              if (err) {
                throw err;
              } else if (!isMatch) {
                res.render('user/signin', { message: "Incorrect Password." });
              } else {
                let sql = `SELECT * FROM userinfo WHERE userName = '${userName}' AND password = '${hash}';`;
                con.query(sql, function (error, results) {
                  if (error) throw error;

                  if (results.length > 0) {
                    res.redirect("/repository");
                  } else {
                    res.render('user/signin', { message: "Invalid Username." });
                  }

                });
              }
            }); 
          } else {
            res.render('user/signin', { message: "Invalid Username." });
          }
        }); 
      }
    });
  }
});


app.post("/updateUser", (req, res) => {
  let name = req.body.userName;
  let newName = req.body.newName;
  let password = req.body.password;
  let newPassword = req.body.newPassword;
  let hashedPswd;
  con.query(`SELECT userName FROM userinfo WHERE userName ='${newName}'`, function (
    err,
    result
  ) {
    if (err) throw err;
    // console.log(result);
    if (result.length == 0) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          throw err;
        } else {
          bcrypt.hash(newPassword, salt, function (err, hash) {
            if (err) {
              throw err;
            } else {
              hashedPswd = hash;
              let oldpass = "";
              let getPass = `SELECT password FROM userinfo WHERE userName = '${name}'`;
              con.query(getPass, function (err, results) {
                if (err) throw err;
                if (results.length != 0) {
                  oldpass = results[0].password; 

                  bcrypt.compare(password, oldpass, function (err, isMatch) {
                    if (err) {
                      throw err;
                    } else if (!isMatch) {
                      res.render('user/updateUser', { message: "Incorrect password." });
                    } else {
                      let sql = `UPDATE userinfo SET userName = "${newName}", password = "${hashedPswd}" WHERE userName = "${name}" AND password = "${oldpass}"`;
                      con.query(sql, function (error, results) {
                        if (error) {
                          throw error;
                        } else if (results.affectedRows != 0)
                        res.render('user/updateUser', { message: "User Details Updated." });
                        else res.render('user/updateUser', { message: "Incorrect Credentials." });
                      });
                    }
                  });
                } else {
                  res.render('user/updateUser', { message: "Incorrect Email." });
                }
              });
            }
          });
        }
      });
    } else {
      res.render('user/updateUser', { message: "Email already taken." });
    }
  });
});


app.post("/deleteUser", function (req, res) {
  var userName = req.body.userName;
  var password = req.body.password;
  if (userName && password) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        throw err;
      } else {
        let hash = "";
        //store the value of hashedPswd in hash
        let getPass = `SELECT password FROM userinfo WHERE userName = '${userName}'`;
        con.query(getPass, function (err, results) {
          if (err) throw err;
          if (results.length != 0) {
            hash = results[0].password; // stored
            //compare it with the entered password
            bcrypt.compare(password, hash, function (err, isMatch) {
              if (err) {
                throw err;
              } else if (!isMatch) {
                res.render('user/deleteUser', { message: "Incorrect Password." });
              } else {
                let sql = `DELETE FROM userinfo WHERE userName = '${userName}' AND password = '${hash}';`;
                con.query(sql, function (error, results) {
                  if (error) {
                    throw error;
                  }
                  // res.redirect("/");
                  res.render('user/deleteUser', { message: "User has been deleted." });
                  // res.end();
                }); // end con.query(sql)
              }
            }); //end bcrypt.comapre()
          } else {
            res.render('user/deleteUser', { message: "Invalid details." });
          }
        }); // end con.query(getPass)
      }
    });
  }
});

app.post("/newfile", function (req, res) {
  let itemName = req.body.itemName;
  let commit = req.body.commit;
  let type = req.body.type;

              let query =
              'INSERT INTO NEWITEMS (itemName, commitMessage, itemType) VALUES ("'+itemName+'", "'+commit+'", "'+type+'")';
            con.query(query, (err, results) => {
              if (err) {
                res.send(err.message);
                console.log(err.message);
              } else {
                console.log("Data has been entered.");
                res.redirect("/repository");
              }
            });
});

app.post("/deleteItem", function(req, res){
  console.log(req.body)
  res.redirect("/repository")
})

const PORT = 6001;
app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});