# GraphQL-MongoDB-Example

Trial repo, for to develop (mongo-docker + (express + graphql)-docker) server as part of money management application (in development too).  
Above should be implemented as first step, fully functional server for rather simple hybrid application.  

Wanted parts - socket.io or something for instant sync && push notification services will be implemented in second step.  

Now if you want to play with what is it at the moment - Just run something like this

```bash
docker run -p 27017:27017 -v $(pwd)/data:/data/db --name mongo-eva --restart=always -d mongo:latest  
```

And then run some of npm scripts you  will discover/like and get some fun   

At the moment this repo is just copy of https://github.com/nmaro/graphql-mongodb-example