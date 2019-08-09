/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
         var res_data = res.body.ops[0];
          assert.equal(res.status, 200);
          assert.equal(res_data.issue_title, 'Title');
          assert.equal(res_data.issue_text, 'text');
          assert.equal(res_data.created_by, 'Functional Test - Every field filled in');
          assert.equal(res_data.assigned_to, 'Chai and Mocha');
          assert.equal(res_data.status_text, 'In QA');
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in'
        })
        .end(function(err, res) {
          var res_data = res.body.ops[0];
          assert.equal(res.status, 200);
          assert.equal(res_data.issue_title, 'Title');
          assert.equal(res_data.issue_text, 'text');
          assert.equal(res_data.created_by, 'Functional Test - Every field filled in');
          done();
        })
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'MARCO',
          created_by:  'MARCO'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "Required parameters do not have valid values");
          done();
        })
      });
      
    }); 
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
         .put('/api/issues/test')
         .send({_id: "123643gkjabk34aglkjb"})
         .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "no updated field sent");
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
         .post('/api/issues/test')
         .send({
          issue_title: 'TITLE',
          issue_text: 'text',
          created_by: 'THE MONKEY MAN'
        })
         .end(function (err, res) {
          if (err || !res.body.ops[0]._id) console.log("There was an error posting new element for PUT TEST");
          else {
            var givenID = res.body.ops[0]._id;
            chai.request(server)
                .put('/api/issues/test')
                .send({
              _id: givenID,
              "issue_title": "SUPER TITLE"
            })
              .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "successfully updated");
              done();
            });
          }
        });  
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
         .post('/api/issues/test')
         .send({
          "issue_title": "Boring Title",
          "issue_text": "This is really boring text for a boring title",
          "created_by": "Mr. Boring"
        })
        .end(function (err, res) {
          var givenId = res.body.ops[0]._id;
          chai.request(server)
           .put('/api/issues/test')
           .send({
              _id: givenId,
              "issue_title": "SUPER DUPER TITLE",
              "issue_text": "This is really super, duper issue-text",
              "created_by": "A Super Duper Guy"
          })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "successfully updated");
              done();
          });
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({'issue_title': 'SUPER DUPER TITLE'})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_title, 'SUPER DUPER TITLE');
          assert.equal(res.body[0].issue_text, "This is really super, duper issue-text");
          assert.equal(res.body[0].created_by, "A Super Duper Guy");
          done();
        })
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
         .get('/api/issues/test')
         .query({"issue_title": "Title",
                "assigned_to": "Chai and Mocha"
                })
         .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_text, "text");
          assert.equal(res.body[0].created_by, "Functional Test - Every field filled in");
          assert.equal(res.body[0].status_text, "In QA");
          done();
        })
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
         .delete('/api/issues/test')
         .send({})
         .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, "_id error");
          done();
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
         .post('/api/issues/test')
         .send({
          "issue_title": "Deleteable Title",
          "issue_text": "I shouldn't see this upon viewing DB",
          "created_by": "Mr. Deleteable"
        })
        .end(function (err, res) {
          var givenId = res.body.ops[0]._id;
          chai.request(server)
           .delete('/api/issues/test')
           .send({
              _id: givenId
          })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              var checkedText = "deleted " + givenId;
              assert.equal(res.text, checkedText);
              done();
          });
          done();
      });
      });
      
    });

});