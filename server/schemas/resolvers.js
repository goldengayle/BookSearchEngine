const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query:{
        
        me: async (parent, args, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
          },

    },
    Mutation:{
        loginUser: async(parent, { email, password}) => {
            const user = await User.findOne({email});

            if(!profile){
                throw new AuthenticationError(`No profile with this email found!`)
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw){
                throw new AuthenticationError(`Incorrect password`);
            }

            const token =signToken(user);
            return { token, user};
        },
        addUser: async(parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = signToken(username);

            return {token, user}
        },
        saveBook: async (parent, { userId, book }, context) => {
            if (context.user){
                return User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $addToSet: { savedBooks: book }
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );
            }

            throw new AuthenticationError(`You need to be logged in!`)
        },

        removeBook: async (parent, { book }, context) => {
            if (context.user){
                return User.findOneAndUpdate(
                    { _id:context.user._id },
                    { $pull: {savedBooks: book}},
                    {new:true}
                );
            }
                throw new AuthenticationError('You need to be logged in!')
            },
        },

    }

module.exports = resolvers;