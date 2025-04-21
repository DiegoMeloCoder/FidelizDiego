'use strict';

const { DataTypes } = require('sequelize'); // Import DataTypes

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create RewardVotes table
    await queryInterface.createTable('RewardVotes', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rewardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Rewards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      voteType: {
        type: DataTypes.ENUM('like', 'dislike'),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
    // Add unique index for RewardVotes
    await queryInterface.addIndex('RewardVotes', ['userId', 'rewardId'], {
      unique: true,
      name: 'rewardvotes_userid_rewardid_unique', // Optional: specify index name
    });

    // Create RewardRequests table
    await queryInterface.createTable('RewardRequests', {
       id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null if user is deleted
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      requestText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('new', 'reviewed', 'planned', 'implemented', 'rejected'),
        allowNull: false,
        defaultValue: 'new',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    // Drop RewardRequests table
    await queryInterface.dropTable('RewardRequests');

    // Drop RewardVotes table (including index)
    await queryInterface.dropTable('RewardVotes');
  }
};
