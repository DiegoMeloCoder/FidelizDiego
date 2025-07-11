const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RewardVote extends Model {
    static associate(models) {
      RewardVote.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      RewardVote.belongsTo(models.Reward, {
        foreignKey: 'rewardId',
        as: 'reward',
      });
    }
  }
  RewardVote.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING, // Matches User.id (Firebase UID)
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If user is deleted, remove their votes
      },
      rewardId: {
        type: DataTypes.INTEGER, // Matches Reward.id
        allowNull: false,
        references: {
          model: 'Rewards',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If reward is deleted, remove its votes
      },
      voteType: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false,
      },
      // createdAt y updatedAt son añadidos automáticamente
    },
    {
      sequelize,
      modelName: 'RewardVote',
      timestamps: true,
      // Add unique constraint to prevent multiple votes by the same user for the same reward
      indexes: [
        {
          unique: true,
          fields: ['userId', 'rewardId'],
        },
      ],
    }
  );
  return RewardVote;
};
