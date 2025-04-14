const config = require('../config');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../db/data.db');

const creatorId = parseInt(config.telegramId);

/**
 * Get role of a user (e.g., "admin", "user")
 */
function getUserRole(db, userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT role FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err || !row) return resolve(null);
            resolve(row.role);
        });
    });
}

/**
 * Check if user is admin
 */
function isAdmin(db, userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT role FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row?.role === 'admin');
        });
    });
}

/**
 * Check if user is the bot creator
 */
function isCreator(userId) {
    return userId === creatorId;
}

/**
 * Check if user has the required role or is creator
 * Example: hasPermission(db, ctx.from.id, 'admin')
 */
async function hasPermission(db, userId, requiredRole = 'user') {
    if (isCreator(userId)) return true;

    const role = await getUserRole(db, userId);
    if (!role) return false;

    const roles = ['user', 'admin']; // define hierarchy here
    const userRank = roles.indexOf(role);
    const requiredRank = roles.indexOf(requiredRole);

    return userRank >= requiredRank;
}

/**
 * Extract username from @mention
 */
function getUserIdFromMention(mention) {
    const match = mention.match(/^@(\w+)/);
    return match ? match[1] : null;
}

module.exports = {
    getUserRole,
    isAdmin,
    isCreator,
    hasPermission,
    getUserIdFromMention,
};