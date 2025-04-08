const userCommand = require('../../../telegram/commands/user');
const { getUserRole } = require('../../../telegram/utils/utils');

jest.mock('../../../telegram/utils/utils', () => ({
    getUserRole: jest.fn(),
}));

const createMockContext = (overrides = {}) => ({
    from: { id: 12345, username: 'testuser' },
    message: { text: '/user' },
    reply: jest.fn(),
    session: {},
    ...overrides,
});

describe('User Command', () => {
    it('should deny access to non-admin users', async () => {
        getUserRole.mockResolvedValue('user'); // Mock user role as 'user'

        const ctx = createMockContext();

        await userCommand.handler(ctx);
        expect(ctx.reply).toHaveBeenCalledWith('❌ You are not authorized to perform this action.');
    });

    it('should allow access to admin users', async () => {
        getUserRole.mockResolvedValue('admin'); // Mock user role as 'admin'

        const ctx = createMockContext();

        await userCommand.handler(ctx);
        expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('Usage: /user add|remove|setadmin|setmod|list'));
    });
});