const { getUserRole, userExists } = require('../../../telegram/utils/utils');
const db = require('../../../telegram/db/database');

describe('Utils', () => {
    beforeAll((done) => {
        db.run('INSERT INTO users (telegram_id, username, role) VALUES (12345, "testuser", "admin")', done);
    });

    afterAll((done) => {
        db.run('DELETE FROM users WHERE telegram_id = 12345', done);
    });

    it('should return the correct user role', async () => {
        const role = await getUserRole(12345);
        expect(role).toBe('admin');
    });

    it('should return true if the user exists', async () => {
        const exists = await userExists(12345);
        expect(exists).toBe(true);
    });

    it('should return false if the user does not exist', async () => {
        const exists = await userExists(67890);
        expect(exists).toBe(false);
    });
});