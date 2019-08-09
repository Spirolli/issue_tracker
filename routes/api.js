/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;


const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

function isEmpty(obj) {
  // Created based on suggestion made through Stack Overflow
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

module.exports = function (app) {
  
  app.route('/api/issues/:project')
    .get(function (req, res){
    if (process.env.DEBUG === 'yes') console.log("==> GETTING")
      var project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, {useNewUrlParser: true},function(err, connection) {
        if (err) console.log('Database connection error: ' + err);
        else {
          if (process.env.DEBUG === 'yes') console.log('Successful database connection');
          const db = connection.db();
          db.collection(project).find(
            req.query,
            (err, data) => {
              if (err) console.log('Error in working with database');
              else {
                data.toArray(function (err, docData) {
                  if (err) console.log('Error assembling data: ' + err);
                  else {
                    res.json(docData);
                  }
                });
              }
            }
          );
        }
      });
    })
  
    .post(function (req, res){
      var project = req.params.project;
      if (process.env.DEBUG === 'yes') console.log("==> POSTING");
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        // As per specifications, the above elements are required.
        res.send("Required parameters do not have valid values");
      } else {
        MongoClient.connect(CONNECTION_STRING, function(err, connection) {
          if (err) console.log('Database connection error: ' + err);
          else {
            if (process.env.DEBUG === 'yes') console.log('Successful database connection');
            const db = connection.db();
            var create_date = new Date();
            db.collection(project).insertOne(
              {
                issue_title: req.body.issue_title,
                issue_text:  req.body.issue_text,
                created_by:  req.body.created_by,
                assigned_to: req.body.assigned_to,
                status_text: req.body.status_text,
                created_on:  create_date,
                updated_on:  create_date,
                open:        true
              }, (err, data) => {
                if (err) console.log('Error has occurred: ' + err);
                res.json(data);
              }
            );
          }
        });
      }
    })

    .put(function (req, res){
      if (process.env.DEBUG === 'yes') console.log("==> PUTTING")
      var project = req.params.project;
      var id = req.body._id;
      delete req.body._id;
      if (isEmpty(req.body)) {
        res.send("no updated field sent");
      } else {
        MongoClient.connect(CONNECTION_STRING, function(err, connection) {
          if (err) console.log("Unable to connect to database.");
          else {
            if (process.env.DEBUG === 'yes') console.log('Successful database connection');
            const db = connection.db();
            var update_date = new Date();
            req.body['updated_on'] = update_date;
            var usableID = ObjectId.createFromHexString(id);
            db.collection(project).updateOne(
              {_id: usableID},
              {$set: req.body}, 
              (err, data) => {
                if (err) {
                  console.log('Error occurred during database connection: ' + err);
                  res.send("Could not update " + id);
                } else {
                  if (data.modifiedCount == 0) {
                    res.send("Could not update " + id);
                  } else {
                    res.send("successfully updated");
                  }
                  
                }
              });
          }
        });
      }
  })

    .delete(function (req, res){
      var project = req.params.project;
      if (process.env.DEBUG === 'yes') console.log("==> DELETING");
      var id = req.body.id
      if(!id) {
        res.send("_id error");
      } else {
        MongoClient.connect(CONNECTION_STRING, function(err, connection) {
          if (err) console.log('Error in establishing database connection: ' + err);
          else {
            if (process.env.DEBUG === 'yes') console.log("Success in establishing connection with database");
            const db = connection.db();
            db.collection(project).remove(
              {"_id": ObjectId.createFromHexString(id)},
              (err, data) => {
                if (err) res.send("Could not delete " + id);
                else {res.send("deleted " + id);}
              }
            );
          }
        });
      }
      
    });
  
  
};