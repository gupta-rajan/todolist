const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://rajan_gupta:Atlas@cluster0.jo6c8jy.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name : "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    // const day = date.getDate();
    Item.find().then(function(items){
        if(items.length === 0){
            Item.insertMany(defaultItems).then(function(){
                console.log("Successfully inserted the elements!");
            }).catch(function(err){
                console.log(err);
            });
            res.redirect("/");
        }
        res.render("list",{
            listTitle: "Today", newListItems : items
        });
    });
}); 

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName ==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(){
            console.log("Checked item Removed");
            res.redirect("/");
        }).catch(function(err){
            console.log(err);
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
            res.redirect("/"+listName);
        }); 
    }
});

// app.get("/work",function(req,res){
//     res.render("list",{listTitle: "Work List", newListItems: workItems });
// });

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundList){
        if(!foundList){
            //Create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+ customListName);
        }    
        else{
            //Show an existing list
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
        }
    });
});

app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000,function(){
    console.log("The server is running on port 3000");
});