const { signToken, AuthenticationError } = require("../utils/auth");
const { User } = require("../models");

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
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);

        return { token, user };
      } catch (error) {
        console.error(error);
      }
    },

    saveBook: async (parent, { saveBookInput }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            {
              $addToSet: {
                savedBooks: saveBookInput,
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

      throw new AuthenticationError("Not authenticated");
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            {
              $pull: {
                savedBooks: { bookId },
              },
            },
            { new: true }
          );
          return updatedUser;
        } catch (error) {
          console.log(err);
          throw new Error("Failed to remove book");
        }
      }

      throw new AuthenticationError();
    },
  },
};

module.exports = resolvers;
