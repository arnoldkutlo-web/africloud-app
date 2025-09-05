
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true },
  passwordHash: DataTypes.STRING,
  name: DataTypes.STRING
});

const File = sequelize.define('File', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: DataTypes.STRING,
  type: DataTypes.STRING, // file or folder
  size: DataTypes.INTEGER,
  parentId: { type: DataTypes.UUID, allowNull: true },
  s3Key: DataTypes.STRING,
  deleted: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Version = sequelize.define('Version', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fileId: { type: DataTypes.UUID },
  s3Key: DataTypes.STRING,
  size: DataTypes.INTEGER
});

const Share = sequelize.define('Share', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fileId: DataTypes.UUID,
  token: DataTypes.STRING,
  expiresAt: DataTypes.DATE,
  permission: DataTypes.STRING
});

User.hasMany(File, { foreignKey: 'ownerId' });
File.belongsTo(User, { foreignKey: 'ownerId' });

File.hasMany(Version, { foreignKey: 'fileId' });

module.exports = { sequelize, User, File, Version, Share };
