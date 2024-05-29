import express from 'express';
import bodyParser from 'body-parser';
import {deleteLocalFiles, filterImageFromURL, isValidUrl} from './util/util.js';
import fetch from 'node-fetch';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

app.get('/filteredimage', async (rq, rs) => {
  let queryData = rq.query;
  let imageUrl = null;
  if (queryData) {
    if (queryData.image_url) {
      imageUrl = queryData.image_url;
    }
  }
  // 1. validate the image_url query
  if (imageUrl && isValidUrl(imageUrl)) {
    fetch(imageUrl).then(async (res) => {
      if (res.ok) {
        let path = await filterImageFromURL(imageUrl);
        if (path) {
          // 3. send the resulting file in the response
          return rs.status(200).sendFile(path, (err) => {
            if (!err) {
              // 4. deletes any files on the server on finish of the response
              deleteLocalFiles([path]);
            }
          });
        } else {
          return rs.status(422).send('can not process image!');
        }
      } else {
        return rs.status(404).send(`image_url not found!`);
      }
    });
  } else {
    return rs.status(400).send('invalid image_url!')
  }
});

// Root Endpoint
// Displays a simple message to the user
app.get( "/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}")
});


// Start the Server
app.listen( port, () => {
    console.log( `server running http://localhost:${ port }` );
    console.log( `press CTRL+C to stop server` );
});
  