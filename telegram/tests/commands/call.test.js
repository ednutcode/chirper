const callCommand = require('../../../telegram/commands/call');
const { getUserRole } = require('../../../telegram/utils/utils');

jest.mock('../../../telegram/utils/utils', () => ({
    getUserRole: jest.fn(),
}));

const createMockContext = (overrides = {}) => ({
    from: { id: 12345, username: 'testuser' },
    message: { text: '/call' },
    reply: jest.fn(),
    session: {},
    ...overrides,
});

describe('Call Command', () => {
    it('should deny access to non-admin users', async () => {
        getUserRole.mockResolvedValue('user'); // Mock user role as 'user'

        const ctx = createMockContext();

        await callCommand.handler(ctx);
        expect(ctx.reply).toHaveBeenCalledWith('🚫 You are not authorized to use this command.');
    });

    it('should allow access to admin users', async () => {
        getUserRole.mockResolvedValue('admin'); // Mock user role as 'admin'

        const ctx = createMockContext();

        await callCommand.handler(ctx);
        expect(ctx.reply).toHaveBeenCalledWith('📞 Please provide the client phone number to call (e.g., 33612345678):');
    });
});