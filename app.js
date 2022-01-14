const express = require('express');
const bodyParser = require("body-parser");
const dateModule = require(__dirname + "/date.js");   //created a new module for date related operations
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
mongoose.connect("mongodb+srv://admin-shubham:admin123@cluster0.r72es.mongodb.net/todoListDB");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine", "ejs");  //set EJS as templating engine

// const items = []; //global variable that stores all the todo items added by user
// const workItems = [];

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Empty item! Add a name."]
    }
});

const Item = new mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: [itemSchema]     //mongoose subdocs
});

const List = new mongoose.model("List", listSchema);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, () => {
    console.log("Server is running at port 3000");
})

app.get("/", (req,res) => {
    const date = dateModule.getDate();
    Item.find({}, (err, items) => {
        if (err) {
            console.log(err);
        } else {
            res.render("list", {title:date, items: items, postTo: "/"});     //passing context to views/list.ejs file that contains EJS template
        }
    })
});

app.post("/", (req, res) => {
    const item = new Item({
        name: req.body.todo_item
    });
    item.save();
    // items.push(req.body.todo_item); //add the new item to the items array
    res.redirect("/");
});

app.post("/delete", (req,res) => {
    const listName = req.body.listName;
    const itemId = req.body.checkbox;
    if (listName === dateModule.getDate()) {
        Item.deleteOne({_id: itemId}, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Item deleted successfully!");
            }
        });
        res.redirect("/");
    } else {
        List.findOne({name:listName}, (err,list) => {
            if (err) {
                console.log(err);
            } else {
                list.items.id(itemId).remove();
                list.save();
                console.log("Item deleted successfully!");
            }
        });
        res.redirect("/"+listName);
    }
});

// app.get("/work", (req,res) => {
//     res.render("work", {title:"Work Items", items: workItems, postTo: "/work"});
// });

// app.post("/work", (req,res) => {
//     workItems.push(req.body.todo_item);
//     res.redirect("/work");
// });

app.get("/:list", (req,res) => {
    const listName = _.capitalize(req.params.list);
    List.findOne({name:listName}, (err, list) => {
        if (err) {
            console.log(err);
        } else {
            if (!list) {
                const newList = new List({
                    name: listName,
                    items: null
                });
                newList.save();
                res.render("list", {title:listName, items: [], postTo: ("/"+listName)});
            } else {
                if (list.items)
                    res.render("list", {title:listName, items: list.items, postTo: ("/"+listName)});
                else   
                    res.render("list", {title:listName, items: [], postTo: ("/"+listName)});
            }
        }
    });
});

app.post("/:list", (req, res) => {
    const listName = req.params.list;
    List.findOne({name:listName}, (err,list) => {
        if (err) {
            console.log(err);
        } else {
            const item = new Item({
                name: req.body.todo_item
            });
            if (list.items == null) {
                List.updateOne({name:listName},{items:item}, (err,result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Item added sucessfully!");
                    }
                });
            } else {
                //insert documents into collection of embedded documents, i.e., items
                list.items.push(item);          //mongoose subdocs feature
                list.save((err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Inserted item successfully!");
                    }
                });
            }
            res.redirect("/"+listName);
        }
    });
});