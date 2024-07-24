const { User } = require("../models");
const { signToken, AuthentificationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { SaveBookInput }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            {
              $push: {
                savedBooks: SaveBookInput,
              },
            },
            { new: true, runValidators: true }
          );

          return updatedUser;
        } catch (err) {
          console.log(err);
          throw new Error("Failed to save book");
        }
      }

      throw new AuthentificationError("Not authenticated");
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            {
              $pull: {
                savedBooks: {
                  bookId: bookId,
                },
              },
            },
            { new: true }
          );
          return updatedUser;
        } catch (error) {
          console.log(err);
          throw new Error("Failed to save book");
        }
        throw new AuthentificationError();
      }
    },
  },
};

module.exports = resolvers;
