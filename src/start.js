const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const { graphiqlExpress, graphqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const cors = require('cors');
const { prepare } = require('../util');

const app = express();

app.use(cors());

const homePath = '/graphiql';
const URL = 'http://localhost';
const PORT = 3001;
const MONGO_URL = 'mongodb://localhost:27017/blog';



module.exports = async () => {
  try {
    const db = await MongoClient.connect(MONGO_URL);

    const Posts = db.collection('posts');
    const Comments = db.collection('comments');

    const typeDefs = [`

      type Post {
        _id: String
        title: String
        content: String
        comments: [Comment]
      }

      type Comment {
        _id: String
        postId: String
        content: String
        post: Post
      }

      type Query {
        post(_id: String): Post
        posts: [Post]
        comment(_id: String): Comment
      }

      type Mutation {
        createPost(title: String, content: String): Post
        createComment(postId: String, content: String): Comment
      }

      schema {
        query: Query
        mutation: Mutation
      }
      
    `];

    const resolvers = {
      Post: {
        comments: async ({_id}) => {
          return (await Comments.find({postId: _id}).toArray()).map(prepare)
        }
      },
      Comment: {
        post: async ({postId}) => {
          return prepare(await Posts.findOne(ObjectId(postId)))
        }
      },
      Query: {
        post: async (root, {_id}) => {
          return prepare(await Posts.findOne(ObjectId(_id)))
        },
        posts: async () => {
          const posts = await Posts.find({}).toArray();

          return posts.map(prepare)
        },
        comment: async (root, {_id}) => {
          return prepare(await Comments.findOne(ObjectId(_id)))
        },
      },
      Mutation: {
        createPost: async (root, args, context, info) => {
          const res = await Posts.insertOne(args);
          return prepare(res.ops[0])  // https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#~insertOneWriteOpResult
        },
        createComment: async (root, args) => {
          const res = await Comments.insertOne(args);
          return prepare(res.ops[0])
        },
      },
    };

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers
    });


    app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));


    app.use(homePath, graphiqlExpress({
      endpointURL: '/graphql'
    }));

    app.listen(PORT, () => {
      console.log(`Visit ${URL}:${PORT}${homePath}`)
    })

  } catch (e) {
    console.log(e)
  }

};
