const https = require('https');
const http = require('http');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/blocks.cash2.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/blocks.cash2.org/cert.pem')
};

const server = https.createServer(options, createServerListener).listen(8080);

function createServerListener(request, response)
{
  if (request.url == "/getinfo" && request.method == 'GET')
  {
    var options = {
      host : 'blocks.cash2.org',
      port : 12276,
      path : "/getinfo",
      method : 'GET'
    };

    http.get(options, function(resp) {
      var data = "";

      resp.on('data', function(d) {
        data += d;
      });

      resp.on('end', function() {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(data);
        response.end();
      });

    }).on("error", (e) => {
      console.error("Error: " + e.message);
    });
  }
  else if (request.url == "/circulatingSupply" && request.method == 'GET')
  {
    var options = {
      host : 'blocks.cash2.org',
      port : 12276,
      path : "/getinfo",
      method : 'GET'
    };

    http.get(options, function(resp) {
      var data = "";

      resp.on('data', function(d) {
        // console.log(JSON.parse(d).circulating_supply);
        data += JSON.parse(d).circulating_supply;
        // console.log(data);
      });

      resp.on('end', function() {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(data);
        response.end();
      });

    }).on("error", (e) => {
      console.error("Error: " + e.message);
    });
  }
  else if (request.url == "/json_rpc" && request.method == 'POST')
  {
    var postData = '';

    request.on('data', function (d) {
      postData += d;
    });

    request.on('end', function() {
      sendRpcHelper(postData)
    });

    function sendRpcHelper(postData) {
      var options = {
        host : 'blocks.cash2.org',
        port : 12276,
        path : "/json_rpc",
        method : 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      var postRequest = http.request(options, function(res) {
        var data = "";

        res.on('data', function(d) {
          data += d;
        });

        res.on('end', function() {
          response.setHeader('Access-Control-Allow-Origin', '*');
          response.writeHead(200, {'Content-Type': 'application/json'});
          response.write(data);
          response.end();
        });

      }).on("error", (e) => {
        console.error("Error: " + e.message);
      });

      postRequest.write(postData);
      postRequest.end();
    }
  }
  else
  {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write("Route not defined");
    response.end();
  }
}