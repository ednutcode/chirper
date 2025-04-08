const secretCommand = require('../../../telegram/commands/secret');
const db = require('../../../telegram/db/database');

const createMockContext = (overrides = {}) => ({
    from: { id: 12345, username: 'testuser' },
    message: { text: '/secret validtoken' },
    reply: jest.fn(),
    session: {},
    ...overrides,
});

describe('Secret Command', () => {
    beforeAll(() => {
        // Insert a valid token into the database
        db.run('INSERT INTO tokens (token, telegram_id, used) VALUES (?, ?, 0)', [
            'validtoken',
            '12345',
        ]);
    });

    it('should grant admin privileges with a valid token', async () => {
        const ctx = createMockContext();

        await secretCommand.middleware()(ctx); // Call the middleware directly
        expect(ctx.reply).toHaveBeenCalledWith('✅ Congratulations! You are now an Admin! 🎉');
    });

    it('should deny access with an invalid token', async () => {
        const ctx = createMockContext({ message: { text: '/secret invalidtoken' } });

        await secretCommand.middleware()(ctx); // Call the middleware directly
        expect(ctx.reply).toHaveBeenCalledWith('❌ Invalid or expired token. Access denied.');
    });

    it('should show usage instructions if no token is provided', async () => {
        const ctx = createMockContext({ message: { text: '/secret' } });

        await secretCommand.middleware()(ctx); // Call the middleware directly
        expect(ctx.reply).toHaveBeenCalledWith(
            '❓ Usage: /secret <token>\n\nProvide a valid token to gain admin access.'
        );
    });
});