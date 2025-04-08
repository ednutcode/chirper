const helpCommand = require('../../../telegram/commands/help');

const createMockContext = (overrides = {}) => ({
    reply: jest.fn(),
    ...overrides,
});

describe('Help Command', () => {
    it('should send the help message', async () => {
        const ctx = createMockContext();

        await helpCommand.handler(ctx);
        expect(ctx.reply).toHaveBeenCalled();
        expect(ctx.reply.mock.calls[0][0]).toContain('Help, Commands & Information');
    });
});