// Create server for browser use w/ express
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const password = require('./password');
const PASSWORD = password.getPassword()
const CONNECTION_STRING = `mongodb+srv://tasks:${PASSWORD}@tasks-cluster.fnjlht6.mongodb.net/?retryWrites=true&w=majority`;

// Create Database Client Connection 
MongoClient.connect(CONNECTION_STRING)
  .then(client => {
    console.log('Connected to MongoDB Server')
    const db = client.db("tasksDB");
    const tasksCollection = db.collection('tasks');

    // we need to set view engine to ejs. This tells Express we’re using EJS as the template engine
    app.set('view engine', 'ejs');

    // Body Parser -----------------------------------------------------------
    /*
    Body-parser: is a middleware that helps express handle reading data from the <form> element.
    npm install body-parser --save
    
    They help tidy up request objects before use w/ use method:
    app.use(bodyParser.urlencoded({extended: true}))
    
    urlencoded: method within body-parser tells body-parser to extract data from the <form> element and add them to the body property in the request object:
    { inputName: inputValue }
    
    Make sure you place body-parser before your CRUD handlers!
    app.get()
    app.post()
    app.put()
    app.delete()
    */
    app.use(bodyParser.urlencoded({ extended: true }));
    // Read JSON --------------------------------------------------------------
    app.use(bodyParser.json());
    //  Serve Static Files ----------------------------------------------------
    app.use(express.static('public'));

    // ----------------------------------------------------------------------------

    // Create ---------------------------------------------------------------------
    /*
    Browsers can only perform a Create operation if they send a POST request:
    app.post(endpoint, callback);
    
    To the server though a <form> or javascript.
    
    To send a POST request the index.html needs a <form> element.
    The form should have an action, method attribute and a name attribute on each input element:
    action: tells the browser where to send the request: /endpoint
    method: tells the browser what kind of request to send: POST
    name: Descriptive name
    
    We can handle this POST request with a post method in server.js. The path should be the value you placed in the action attribute.
    app.post('/path', (req, res) => { handle post req});
    
    See: Body-parser
    */

    // POST route for adding a new task
    app.post('/tasks', (req, res) => {
      // Log the request body
      console.log('rb', req.body);

      // Add the received task to the database collection
      tasksCollection.insertOne(req.body)
        .then(result => {
          // Redirect the browser to the home page after successfully adding the task
          res.redirect('/');
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
        });
    });

    // API:---------------------
    app.post('/api', (req, res) => {
      // Log the request body
      console.log('rb', req.body);

      // Add the received task to the database collection
      tasksCollection.insertOne(req.body)
        .then(result => {
          // Send back the inserted document as JSON
          res.json(req.body);
          console.log('rb2', result, req.body)
          // Redirect the browser to the home page after successfully adding the task
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
        });
    });
    // ---------------------------

    // ----------------------------------------------------------------------------

    // Read -----------------------------------------------------------------------
    /*
    We handle GET request w/ get method:
    app.get(endpoint, callback);
    
    domain_name: www.website.com/dir/file/
    endpoint: is anything after domain_name (/dir/file/)
    callback: tells the server what to do when the requested endpoint  matches the endpoint in the route.
    
    It takes (req, res) as parameters where req is the HTTP request and res is the  HTTP response.
    
    app.get('/', (req, res) => {handle get req})
    */

    // Home page route
    app.get('/', (req, res) => {

      // Retrieve tasks from the database
      tasksCollection.find()
        .toArray() // Convert MongoDB cursor to array
        .then(results => {
          // Render the home page with the retrieved tasks
          res.render('index', { tasks: results });

          // Alternative approach: Determine the response format based on the request accept header
          // if (req.accepts('html')) {
          //   res.status(200).render('index.ejs', { tasks: results });
          // } else {
          //   res.status(200).json({ tasks: results });
          // }
        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
          // Send a 500 response for any internal server errors
          res.status(500).send('Internal Server Error');
        });
    });

    // API: Route to retrieve all tasks as JSON
    app.get('/api/tasks', (req, res) => {
      // Retrieve all tasks from the database
      tasksCollection.find()
        .toArray() // Convert MongoDB cursor to array
        .then(results => {
          // Check if there are any tasks found
          (!results) ?
            // Send a 404 response if no tasks are found
            res.status(404).json({
              message: 'No entries found.',
              results // Include an empty results array in the response
            })
            :
            // Send a successful response with the tasks as JSON
            res.status(200).json(results);

        })
        .catch(err => {
          // Log any errors to the console
          console.error(err);
          // Send a 500 response for any internal server errors
          res.status(500).send('Internal Server Error');
        });
    });
    // ------------------------

    // API: Route to retrieve all tasks by ID as JSON
    app.get('/api/tasks/:id', (req, res) => {
      // Extract the task ID from the request parameters
      let taskId = req.params.id;

      // Define the query to find the task by its ID
      let taskQuery = { _id: new ObjectId(taskId) };

      // Use findOne to find the task in the database
      tasksCollection.findOne(taskQuery)
        .then((result) => {

          // Check if the task is not found
          if (!result) {
            // If task is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find task with ID ${taskId}` });
          } else {
            // If the task is found, send a 200 status with a JSON response containing the task
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
    // ------------------------

     // GET route for retrieving all tasks
    app.get('/tasks', (req, res) => {
      // Retrieve all tasks from the database collection
      tasksCollection.find()
        .toArray()
        .then(results => {
          // Log the results to the console
          console.log(results);

          // Check if there are no results
          if (!results) {
            // If no results found, send a 404 status with a JSON response
            return res.status(404).json({ message: 'No Results' });
          } else {
            // If results found, send a 200 status with a JSON response containing the results
            res.status(200).json(results);
          }
        })
        .catch(err => {
          // Log any errors to the console and send a 500 status with a JSON response containing the error
          console.error(err);
          res.status(500).json({ error: err })
        })
    });


    // Route to retrieve all tasks by ID
    app.get('/tasks/:id', (req, res) => {
      // Extract the task ID from the request parameters
      let taskId = req.params.id;

      // Define the query to find the task by its ID
      let taskQuery = { _id: new ObjectId(taskId) };

      // Use findOne to find the task in the database
      tasksCollection.findOne(taskQuery)
        .then((result) => {
          // Log the result to the console
          // console.log('r', result);

          // Check if the task is not found
          if (!result) {
            // If task is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find task with ID ${taskId}` });
          } else {
            // If the task is found, send a 200 status with a JSON response containing the task
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
    
    // Route to retrieve all tasks by ID
    app.get('/api/tasks/:id', (req, res) => {
      // Extract the task ID from the request parameters
      let taskId = req.params.id;

      // Define the query to find the task by its ID
      let taskQuery = { _id: new ObjectId(taskId) };

      // Use findOne to find the task in the database
      tasksCollection.findOne(taskQuery)
        .then((result) => {
          // Log the result to the console
          // console.log('r', result);

          // Check if the task is not found
          if (!result) {
            // If task is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find task with ID ${taskId}` });
          } else {
            // If the task is found, send a 200 status with a JSON response containing the task
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });

   
    // GET route for editing a specific task
    app.get('/tasks/:id/edit', (req, res) => {
      // Extract the task ID from the request parameters
      let taskId = req.params.id;

      // Define the query to find the task by its ID
      let taskQuery = { _id: new ObjectId(taskId) };

      // Log the task ID to the console
      console.log(taskId);

      // Use findOne to find the task in the database
      tasksCollection.findOne(taskQuery)
        .then((result) => {
          // Log the result to the console
          console.log('r', result);

          // Check if the task is not found
          if (!result) {
            // If task is not found, send a 404 status with a JSON response and redirect to the home page
            return res.status(404).json({ message: `Cannot find task with ID ${taskId}` }).redirect("/");
          } else {
            // If the task is found

            // Check if the request's accept header indicates JSON format
            const acceptHeader = req.headers['accept'];
            if (acceptHeader && acceptHeader.includes('application/json')) {
              // If JSON format is requested, send a 200 status with a JSON response containing the task
              return res.status(200).json(result);
            } else {
              // If HTML format is requested, render the edit-task.ejs template with the task data
              res.render("edit-task.ejs", { task: result });
            }
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.error(err);
          res.status(500).send('Internal Server Error');
        });
    });

    // API: GET route for editing a specific task in API format
    app.get('/api/tasks/:id/edit', (req, res) => {
      // Extract the task ID from the request parameters
      let taskId = req.params.id;

      // Define the query to find the task by its ID
      let taskQuery = { _id: new ObjectId(taskId) };

      // Use findOne to find the task in the database
      tasksCollection.findOne(taskQuery)
        .then((result) => {

          // Check if the task is not found
          if (!result) {
            // If task is not found, send a 404 status with a JSON response
            return res.status(404).json({ message: `Cannot find task with ID ${taskId}` });
          } else {
            // If the task is found, send a 200 status with a JSON response containing the task
            res.status(200).json(result);
          }
        })
        .catch((err) => {
          // Log any errors to the console and send a 500 status with a JSON response indicating internal server error
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
    });
    // ------------------------

    // ----------------------------------------------------------------------------

    // Update -----------------------------------------------------------------
    app.put('/tasks/:id', (req, res) => {
      const taskId = req.params.id;
      const taskQuery = { _id: new ObjectId(taskId) };
      const taskData = req.body;
      console.log('Updated Task Data:', taskData);


      tasksCollection.findOneAndUpdate(taskQuery, { $set: taskData }, { upsert: true, returnOriginal: false })
        .then((result) => {
          console.log("updateResult",taskData);
          // res.send({taskData})
          result = Object.assign({}, taskQuery, taskData);
          if (!result) {
            return res.status(404).json({ message: `Cannot update task with ID ${taskId}` });
          } else {
            return res.status(200).json(result);
          }
        })
        .catch((e) => {
          console.error(`Error updating task ${taskId}`, e);
          res.status(500).send('Server error');
        });

    });

    // API: PUT route handler that is called when the /api/tasks/:id endpoint is hit 
    app.put('/api/tasks/:id', (req, res) => {
      const taskId = req.params.id;
      const taskQuery = { _id: new ObjectId(taskId) };
      const taskData = req.body;
      console.log('Updated Task Data:', taskData);


      tasksCollection.findOneAndUpdate(taskQuery, { $set: taskData }, { upsert: true, returnOriginal: false })
        .then((result) => {
          console.log("updateResult",);
          // res.send({taskData})
          result = Object.assign({}, taskQuery, taskData);
          if (!result) {
            return res.status(404).json({ message: `Cannot update task with ID ${taskId}` });
          } else {
            return res.status(200).json(result);
          }
        })
        .catch((e) => {
          console.error(`Error updating task ${taskId}`, e);
          res.status(500).send('Server error');
        });

    });
    // ------------------------


    // ----------------------------------------------------------------------------

    // Delete ---------------------------------------------------------------------
    app.delete('/tasks/:id/delete', (req, res) => {
      console.log('DRR:', req.body)
      const taskId = req.params.id;
      const taskQuery = { _id: new ObjectId(taskId) };
      const taskData = req.body;
      console.log('Delete Task Data:', taskData);
      
      tasksCollection.deleteOne(taskQuery, taskData)
      .then(result => {
        console.log('Delete Task Data:', taskData);
        console.log('dr',{...result})
        if (result.deletedCount === 0) {
          res.json({message: 'No record of that task was found.'});
        } else {
          console.log('Deleted', result, taskData);
          res.status(200).json(result)
        }
      })
      .catch((e) => {
        console.error(`Error deleting task ${taskId}`, e);
        res.status(500).send('Server error');
      });
    });
    
    
    app.delete('/api/tasks/:id/delete', (req, res) => {
      console.log('DRR:', req.body)
      const taskId = req.params.id;
      const taskQuery = { _id: new ObjectId(taskId) };
      const taskData = req.body;
      console.log('Delete Task Data:', taskData);
      
      tasksCollection.deleteOne(taskQuery, taskData)
      .then(result => {
        console.log('Delete Task Data:', taskData);
        console.log('dr',{...result})
        if (result.deletedCount === 0) {
          res.json({message: 'No record of that task was found.'});
        } else {
          console.log('Deleted', result, taskData);
          res.status(200).json(result)
        }
      })
      .catch((e) => {
        console.error(`Error deleting task ${taskId}`, e);
        res.status(500).send('Server error');
      });
    });
    // ----------------------------------------------------------------------------

    // Listen for server on port localhost:3000
    app.listen(PORT, function () {
      console.log(`Listening on localhost:${PORT}`)
    });
  })
  .catch(error => console.error(error));

// Run server
// cd working_dir && node server.js
// ----------------------------------------------------------------------------

// Nodemon --------------------------------------------------------------------
/*
Nodemon: restarts the server automatically when you save a file that’s used by the server.js. 
npm install nodemon --save-dev

Update script in package.json
"scripts": {
  "dev": "nodemon server.js"
}

npm run dev to trigger nodemon server.js
*/

// ----------------------------------------------------------------------------


// Test server
console.log('Tasks:  Create, Read, Update & Delete');